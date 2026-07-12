import numpy as np
import pandas as pd
from joblib import load
import os

# Dynamic Paths relative to script location
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "xgboost_v1.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "data", "processed", "scaler.pkl")

# Load artifacts once
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found at: {MODEL_PATH}")
if not os.path.exists(SCALER_PATH):
    raise FileNotFoundError(f"Scaler not found at: {SCALER_PATH}")

model = load(MODEL_PATH)
scaler = load(SCALER_PATH)

FEATURE_COLUMNS = [
    "Time", "V1", "V2", "V3", "V4", "V5", "V6", "V7",
    "V8", "V9", "V10", "V11", "V12", "V13", "V14",
    "V15", "V16", "V17", "V18", "V19", "V20", "V21",
    "V22", "V23", "V24", "V25", "V26", "V27", "V28",
    "Amount"
]

def risk_level(prob):
    if prob >= 0.85:
        return "HIGH"
    elif prob >= 0.6:
        return "MEDIUM"
    else:
        return "LOW"


def score_transaction(transaction: dict, threshold=0.5):
    """
    Input:
        transaction: dict with all feature values
        threshold: fraud decision threshold

    Output:
        dict with probability, prediction, risk level
    """

    # Convert input to DataFrame
    df = pd.DataFrame([transaction])

    # Ensure correct column order
    df = df[FEATURE_COLUMNS]

    # Scale Time & Amount (pass DataFrame directly to match fitted schema names)
    df[["Time", "Amount"]] = scaler.transform(df[["Time", "Amount"]])

    # Predict probability (pass .values to match fitted numpy structure and avoid warning)
    df_compat = df.astype("float32")
    fraud_prob = model.predict_proba(df_compat.values)[0][1]
    prediction = int(fraud_prob >= threshold)

    return {
        "fraud_probability": round(float(fraud_prob), 4),
        "is_fraud": prediction,
        "risk_level": risk_level(fraud_prob)
    }


# Manual test
if __name__ == "__main__":
    sample_transaction = {
        "Time": 100000,
        "V1": -1.359807,
        "V2": -0.072781,
        "V3": 2.536347,
        "V4": 1.378155,
        "V5": -0.338321,
        "V6": 0.462388,
        "V7": 0.239599,
        "V8": 0.098698,
        "V9": 0.363787,
        "V10": 0.090794,
        "V11": -0.551600,
        "V12": -0.617801,
        "V13": -0.991390,
        "V14": -0.311169,
        "V15": 1.468177,
        "V16": -0.470401,
        "V17": 0.207971,
        "V18": 0.025791,
        "V19": 0.403993,
        "V20": 0.251412,
        "V21": -0.018307,
        "V22": 0.277838,
        "V23": -0.110474,
        "V24": 0.066928,
        "V25": 0.128539,
        "V26": -0.189115,
        "V27": 0.133558,
        "V28": -0.021053,
        "Amount": 149.62
    }

    result = score_transaction(sample_transaction)
    print(result)