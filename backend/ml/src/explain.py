import shap
import numpy as np
import pandas as pd
import os
from joblib import load

# Dynamic Paths relative to script location
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
MODEL_PATH = os.path.join(BASE_DIR, "models", "xgboost_v1.pkl")

FEATURE_COLUMNS = [
    "Time", "V1", "V2", "V3", "V4", "V5", "V6", "V7",
    "V8", "V9", "V10", "V11", "V12", "V13", "V14",
    "V15", "V16", "V17", "V18", "V19", "V20", "V21",
    "V22", "V23", "V24", "V25", "V26", "V27", "V28",
    "Amount"
]

def main():
    # Load model and data
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at: {MODEL_PATH}")
    
    model = load(MODEL_PATH)
    X_train_path = os.path.join(DATA_DIR, "X_train.npy")
    if not os.path.exists(X_train_path):
        raise FileNotFoundError(f"Processed training features not found at: {X_train_path}")
        
    X_train = np.load(X_train_path)

    # Use a subset for speed
    X_sample = X_train[:1000]

    # Convert NumPy array sample to pandas DataFrame to preserve feature names in SHAP plots
    df_sample = pd.DataFrame(X_sample, columns=FEATURE_COLUMNS)

    # SHAP Explainer
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(df_sample)

    # Global feature importance with semantic column names
    print("Generating SHAP summary plot...")
    shap.summary_plot(shap_values, df_sample, show=True)


if __name__ == "__main__":
    main()