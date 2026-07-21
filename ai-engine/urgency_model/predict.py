import joblib
import sys
import os

# Get path to model (assuming it's in the same directory or adjust as needed)
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'urgency_model.pkl')

def load_model():
    try:
        model = joblib.load(MODEL_PATH)
        return model
    except FileNotFoundError:
        print(f"Error: Model not found at {MODEL_PATH}")
        return None

def predict_urgency(text):
    """
    Predicts the urgency level of a city problem report.
    Args:
        text (str): Description of the problem.
    Returns:
        dict: {'urgency': 'High'|'Medium'|'Low', 'confidence': float}
    """
    model = load_model()
    if not model:
        return {"error": "Model not loaded"}

    prediction = model.predict([text])[0]
    probabilities = model.predict_proba([text])[0]
    confidence = max(probabilities)

    return {
        "urgency": prediction,
        "confidence": round(confidence, 2)
    }

if __name__ == "__main__":
    # Test cases
    test_inputs = [
        "There is a massive pothole causing damage",
        "Some graffiti on the wall",
        "Streetlight is flickering",
        "Traffic is completely blocked"
    ]
    
    print("--- AI Urgency Prediction Test ---")
    for text in test_inputs:
        result = predict_urgency(text)
        print(f"Report: '{text}' -> Urgency: {result['urgency']} (Conf: {result['confidence']})")
