import numpy as np
import os
from joblib import dump
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, roc_auc_score

# Dynamic Paths relative to script location
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
MODEL_DIR = os.path.join(BASE_DIR, "models")

os.makedirs(MODEL_DIR, exist_ok=True)

def main():
    # 1. Load processed data
    X_train_path = os.path.join(DATA_DIR, "X_train.npy")
    y_train_path = os.path.join(DATA_DIR, "y_train.npy")
    X_test_path = os.path.join(DATA_DIR, "X_test.npy")
    y_test_path = os.path.join(DATA_DIR, "y_test.npy")

    if not all(os.path.exists(p) for p in [X_train_path, y_train_path, X_test_path, y_test_path]):
        raise FileNotFoundError(f"Processed arrays missing in {DATA_DIR}. Please run preprocess.py first.")

    X_train = np.load(X_train_path)
    y_train = np.load(y_train_path)
    X_test = np.load(X_test_path)
    y_test = np.load(y_test_path)

    print("Data loaded successfully")

    # 2. Define XGBoost model
    model = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="binary:logistic",
        eval_metric="auc",
        random_state=42,
        n_jobs=-1
    )

    # 3. Train model
    print("Training XGBClassifier...")
    model.fit(X_train, y_train)

    # 4. Evaluate on test set
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    print("\nClassification Report:\n")
    print(classification_report(y_test, y_pred))

    auc = roc_auc_score(y_test, y_prob)
    print("ROC-AUC Score:", auc)

    # 5. Save trained model
    model_path = os.path.join(MODEL_DIR, "xgboost_v1.pkl")
    dump(model, model_path)

    print(f"\nModel saved to {model_path}")


if __name__ == "__main__":
    main()