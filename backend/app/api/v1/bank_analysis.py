from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
import pandas as pd
import io
import json
from datetime import datetime
from collections import Counter

from app.core.database import get_db
from app.models.bank_analysis import BankTransaction, BehaviouralProfile
from app.models.wachlist import WatchList
from app.models.user import User
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/bank",
    tags=["Bank Transaction Analysis"],
)

REQUIRED_CSV_COLUMNS = ["Date", "Amount", "Merchant", "Location", "Time"]

@router.post("/import", status_code=200)
def import_bank_transactions(
    customer_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a CSV file."
        )

    try:
        contents = file.file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # 1. Validate Columns
        missing_cols = set(REQUIRED_CSV_COLUMNS) - set(df.columns)
        if missing_cols:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"CSV file is missing required columns: {sorted(list(missing_cols))}"
            )

        # 2. Validate Values & Formats
        transactions_to_add = []
        seen_duplicates = 0
        
        for idx, row in df.iterrows():
            # Check for NaN / Empty values
            if pd.isna(row["Date"]) or pd.isna(row["Amount"]) or pd.isna(row["Merchant"]) or pd.isna(row["Location"]) or pd.isna(row["Time"]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Row {idx+2} contains empty values in required fields."
                )

            # Date format validation
            try:
                date_val = pd.to_datetime(row["Date"])
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Row {idx+2} contains an invalid Date format: '{row['Date']}'"
                )

            # Amount validation
            try:
                amount_val = float(row["Amount"])
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Row {idx+2} contains an invalid Amount format: '{row['Amount']}'"
                )

            # Check for duplicate transactions in the CSV or database
            exists = db.query(BankTransaction).filter(
                BankTransaction.customer_id == customer_id,
                BankTransaction.date == date_val,
                BankTransaction.amount == amount_val,
                BankTransaction.merchant == str(row["Merchant"]),
                BankTransaction.location == str(row["Location"])
            ).first()
            
            if exists:
                seen_duplicates += 1
                continue

            tx = BankTransaction(
                customer_id=customer_id,
                date=date_val,
                amount=amount_val,
                merchant=str(row["Merchant"]),
                location=str(row["Location"]),
                time=str(row["Time"])
            )
            transactions_to_add.append(tx)

        if not transactions_to_add and seen_duplicates > 0:
            return {
                "success": True,
                "message": f"All transactions in file were already imported (skipped {seen_duplicates} duplicates).",
                "imported_count": 0
            }

        # 3. Add to Database
        db.add_all(transactions_to_add)
        db.commit()

        # 4. Generate Behavioural Profile
        all_txs = db.query(BankTransaction).filter(BankTransaction.customer_id == customer_id).all()
        if not all_txs:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No transaction history available to analyze."
            )

        amounts = [tx.amount for tx in all_txs]
        merchants = [tx.merchant for tx in all_txs]
        locations = [tx.location for tx in all_txs]
        times = [tx.time for tx in all_txs]
        dates = [tx.date.date() for tx in all_txs]
        months = [tx.date.strftime("%Y-%m") for tx in all_txs]

        # Spending calculations
        avg_spending = sum(amounts) / len(amounts)
        max_spending = max(amounts)
        min_spending = min(amounts)

        # Average Daily / Monthly spending
        days_count = len(set(dates)) or 1
        months_count = len(set(months)) or 1
        avg_daily_spending = sum(amounts) / days_count
        avg_monthly_spending = sum(amounts) / months_count

        # Common categories
        merchant_counter = Counter(merchants)
        common_merchants = [item[0] for item in merchant_counter.most_common(5)]
        
        location_counter = Counter(locations)
        common_locations = [item[0] for item in location_counter.most_common(5)]
        
        time_counter = Counter(times)
        common_times = [item[0] for item in time_counter.most_common(5)]

        # Weekend vs Weekday ratios
        weekend_amounts = sum(tx.amount for tx in all_txs if tx.date.weekday() >= 5)
        total_amounts = sum(amounts)
        weekend_ratio = weekend_amounts / total_amounts if total_amounts > 0 else 0.0

        # Frequency: transactions per week
        total_weeks = (max(dates) - min(dates)).days / 7.0 if len(dates) > 1 else 1.0
        if total_weeks < 1.0:
            total_weeks = 1.0
        tx_frequency = len(all_txs) / total_weeks

        # Fetch or update BehaviouralProfile
        profile = db.query(BehaviouralProfile).filter(BehaviouralProfile.customer_id == customer_id).first()
        if not profile:
            profile = BehaviouralProfile(customer_id=customer_id)
            db.add(profile)

        profile.avg_spending = round(avg_spending, 2)
        profile.max_spending = round(max_spending, 2)
        profile.min_spending = round(min_spending, 2)
        profile.avg_daily_spending = round(avg_daily_spending, 2)
        profile.avg_monthly_spending = round(avg_monthly_spending, 2)
        profile.common_merchants = json.dumps(common_merchants)
        profile.common_locations = json.dumps(common_locations)
        profile.common_times = json.dumps(common_times)
        profile.weekend_ratio = round(weekend_ratio, 3)
        profile.tx_frequency = round(tx_frequency, 2)

        db.commit()

        return {
            "success": True,
            "message": f"Successfully imported {len(transactions_to_add)} transactions. Skipped {seen_duplicates} duplicates.",
            "imported_count": len(transactions_to_add),
            "profile": {
                "customer_id": customer_id,
                "avg_spending": profile.avg_spending,
                "max_spending": profile.max_spending,
                "min_spending": profile.min_spending,
                "avg_daily_spending": profile.avg_daily_spending,
                "weekend_ratio": profile.weekend_ratio
            }
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Import failed: {str(e)}"
        )

@router.get("/profiles", status_code=200)
def list_profiles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(BehaviouralProfile).all()

@router.get("/profiles/{customer_id}", status_code=200)
def get_profile(customer_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(BehaviouralProfile).filter(BehaviouralProfile.customer_id == customer_id).first()
    if not profile:
        raise HTTPException(
            status_code=404,
            detail=f"Behavioural Profile not found for customer: '{customer_id}'."
        )
    return profile

@router.delete("/datasets/{customer_id}", status_code=200)
def delete_customer_data(customer_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Delete bank transactions
    db.query(BankTransaction).filter(BankTransaction.customer_id == customer_id).delete()
    
    # Delete profile
    db.query(BehaviouralProfile).filter(BehaviouralProfile.customer_id == customer_id).delete()
    
    db.commit()
    return {
        "success": True,
        "message": f"Deleted all transactions and behavioural profiles for customer: '{customer_id}'."
    }
