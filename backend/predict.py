import joblib
import numpy as np

# Load trained model (path explained below)
model = joblib.load("../ml/model.pkl")

def predict_output(input_data):
    """
    input_data: list or array of feature values
    """
    input_array = np.array(input_data).reshape(1, -1)
    prediction = model.predict(input_array)
    return prediction[0]