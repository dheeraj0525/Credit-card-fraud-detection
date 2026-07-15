import joblib
import numpy as np
import os

# Dynamic path relative to script location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "models", "xgboost_v1.pkl")

# Load trained model
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
else:
    model = None

def predict_output(input_data):
    """
    input_data: list or array of feature values
    """
    if model is None:
        raise FileNotFoundError("Model pickle file not found")
    input_array = np.array(input_data).reshape(1, -1)
    prediction = model.predict(input_array)
    return prediction[0]
