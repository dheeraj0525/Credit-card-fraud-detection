import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

from joblib import load
from sklearn.metrics import (
    confusion_matrix,
    classification_report,
    roc_auc_score,
    roc_curve
)

# Paths
DATA_DIR = "../data/processed"
MODEL_PATH = "../models/xgboost_v1.pkl"


def main():
    # Load data
    X_test = np.load(os.path.join(DATA_DIR, "X_test.npy"))
    y_test = np.load(os.path.join(DATA_DIR, "y_test.npy"))

    # Load model
    model = load(MODEL_PATH)

    # Predict probabilities
    y_prob = model.predict_proba(X_test)[:, 1]

    # ==================================================
    # STEP 5.2 — THRESHOLD TESTING (INSERTED HERE)
    # ==================================================
    print("\n===== THRESHOLD COMPARISON =====")

    for t in [0.3, 0.5, 0.7, 0.85]:
        preds = (y_prob >= t).astype(int)
        print(f"\nThreshold: {t}")
        print(classification_report(y_test, preds))

    # ==================================================
    # DEFAULT THRESHOLD (for plots)
    # ==================================================
    threshold = 0.5
    y_pred = (y_prob >= threshold).astype(int)

    # Metrics
    auc = roc_auc_score(y_test, y_prob)
    print("\nROC-AUC Score:", auc)

    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)

    plt.figure(figsize=(5, 4))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.title(f"Confusion Matrix (threshold={threshold})")
    plt.show()

    # ROC Curve
    fpr, tpr, _ = roc_curve(y_test, y_prob)

    plt.figure(figsize=(6, 4))
    plt.plot(fpr, tpr, label=f"AUC = {auc:.3f}")
    plt.plot([0, 1], [0, 1], linestyle="--")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curve")
    plt.legend()
    plt.show()


if __name__ == "__main__":
    main()