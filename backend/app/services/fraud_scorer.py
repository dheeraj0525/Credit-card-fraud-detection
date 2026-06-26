import pandas as pd
from joblib import load
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

MODEL_PATH = os.path.join(BASE_DIR, "ml/models/xgboost_v1.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "ml/data/processed/scaler.pkl")

FEATURE_COLUMNS = [
    "Time", "V1", "V2", "V3", "V4", "V5", "V6", "V7",
    "V8", "V9", "V10", "V11", "V12", "V13", "V14",
    "V15", "V16", "V17", "V18", "V19", "V20", "V21",
    "V22", "V23", "V24", "V25", "V26", "V27", "V28",
    "Amount"
]

class FraudScorer:
    def __init__(self):
        self.model = load(MODEL_PATH)
        self.scaler = load(SCALER_PATH)

    def _risk_level(self, prob: float) -> str:
        if prob >= 0.85:
            return "HIGH"
        elif prob >= 0.6:
            return "MEDIUM"
        return "LOW"

    def score(self, transaction: dict, threshold: float = 0.7) -> dict:
        df = pd.DataFrame([transaction])
        df = df[FEATURE_COLUMNS]

        df[["Time", "Amount"]] = self.scaler.transform(
            df[["Time", "Amount"]]
        )

        prob = self.model.predict_proba(df)[0][1]
        is_fraud = int(prob >= threshold)

        return {
            "fraud_probability": round(float(prob), 4),
            "is_fraud": is_fraud,
            "risk_level": self._risk_level(prob)
        }


fraud_scorer = FraudScorer()