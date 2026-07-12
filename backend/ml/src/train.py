import numpy as np
import os
from joblib import dump
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, roc_auc_score

# Paths
DATA_DIR = "../data/processed"
MODEL_DIR = "../models"

os.makedirs(MODEL_DIR, exist_ok=True)

def main():
    # 1. Load processed data
    X_train = np.load(os.path.join(DATA_DIR, "X_train.npy"))
    y_train = np.load(os.path.join(DATA_DIR, "y_train.npy"))
    X_test = np.load(os.path.join(DATA_DIR, "X_test.npy"))
    y_test = np.load(os.path.join(DATA_DIR, "y_test.npy"))

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