import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE

from joblib import dump
import os

# Dynamic Paths relative to script location
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "creditcard.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "data", "processed")

os.makedirs(OUTPUT_DIR, exist_ok=True)

def main():
    # 1. Load dataset
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Credit card dataset not found at: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)

    # 2. Separate features and target
    X = df.drop("Class", axis=1)
    y = df["Class"]

    # 3. Train-test split (stratified) first to prevent data leakage
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    # 4. Scale Time and Amount (fit on X_train only, transform both)
    scaler = StandardScaler()
    X_train[["Time", "Amount"]] = scaler.fit_transform(X_train[["Time", "Amount"]])
    X_test[["Time", "Amount"]] = scaler.transform(X_test[["Time", "Amount"]])

    # Save scaler (needed in backend later)
    dump(scaler, os.path.join(OUTPUT_DIR, "scaler.pkl"))

    # 5. Apply SMOTE only on training data
    smote = SMOTE(random_state=42)
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

    # 6. Save processed arrays
    np.save(os.path.join(OUTPUT_DIR, "X_train.npy"), X_train_resampled)
    np.save(os.path.join(OUTPUT_DIR, "y_train.npy"), y_train_resampled)
    np.save(os.path.join(OUTPUT_DIR, "X_test.npy"), X_test.values)
    np.save(os.path.join(OUTPUT_DIR, "y_test.npy"), y_test.values)

    print("Preprocessing complete ✅")
    print("Original training size:", X_train.shape)
    print("Resampled training size:", X_train_resampled.shape)
    print("Fraud ratio after SMOTE:", np.mean(y_train_resampled))


if __name__ == "__main__":
    main()