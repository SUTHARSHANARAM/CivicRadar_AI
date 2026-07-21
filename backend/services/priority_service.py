import joblib
import os
import logging

# Configure path relative to this file
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "ai_models", "urgency_model.pkl")

class PriorityService:
    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            self.model = joblib.load(MODEL_PATH)
            logging.info(f"AI Model loaded successfully from {MODEL_PATH}")
        except Exception as e:
            logging.error(f"Failed to load AI Model: {e}")
            self.model = None

    def predict(self, text: str):
        if not self.model:
            return {"urgency": "Unknown", "confidence": 0.0, "error": "Model not loaded"}
        
        try:
            prediction = self.model.predict([text])[0]
            probabilities = self.model.predict_proba([text])[0]
            confidence = max(probabilities)
            
            return {
                "urgency": prediction,
                "confidence": round(float(confidence), 2)
            }
        except Exception as e:
            logging.error(f"Prediction error: {e}")
            return {"urgency": "Error", "confidence": 0.0}

# Global instance
priority_service = PriorityService()
