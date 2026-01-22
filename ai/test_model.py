import joblib
import pandas as pd
import numpy as np
import os

def test_model_loading():
    """
    Check if model file exists after training (mocked here for structure)
    """
    # This is a placeholder test. In a real scenario, we'd run training first.
    # For now, we just verify the logic of loading.
    model_dir = "models"
    if not os.path.exists(model_dir):
        print(f"Directory {model_dir} does not exist yet.")
        return False
    
    models = [f for f in os.listdir(model_dir) if f.endswith(".pkl")]
    if not models:
        print("No model files found in models/")
        return False
    
    model_path = os.path.join(model_dir, models[0])
    try:
        model = joblib.load(model_path)
        print(f"Successfully loaded model: {model_path}")
        
        # Test prediction with dummy data (3 features: Close, SMA5, SMA20)
        dummy_input = np.array([[100.0, 98.0, 95.0]])
        prediction = model.predict(dummy_input)
        print(f"Prediction test successful: {prediction[0]:.2f}")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

if __name__ == "__main__":
    test_model_loading()
