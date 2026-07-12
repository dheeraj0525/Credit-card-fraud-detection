import shap
import numpy as np
import os

from joblib import load

# Paths
DATA_DIR = "../data/processed"
MODEL_PATH = "../models/xgboost_v1.pkl"


def main():
    # Load model and data
    model = load(MODEL_PATH)
    X_train = np.load(os.path.join(DATA_DIR, "X_train.npy"))

    # Use a subset for speed
    X_sample = X_train[:1000]

    # SHAP Explainer
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_sample)

    # Global feature importance
    shap.summary_plot(shap_values, X_sample, show=True)


if __name__ == "__main__":
    main()