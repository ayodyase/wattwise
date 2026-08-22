import pickle
import os

base_dir = os.path.dirname(os.path.abspath(__file__))

def load_pkl(name):
    path = os.path.join(base_dir, name)
    if os.path.exists(path):
        with open(path, 'rb') as f:
            return pickle.load(f)
    return None

try:
    feature_names = load_pkl('feature_names.pkl')
    print("Feature Names:", feature_names)
except Exception as e:
    print("Error loading feature_names:", e)

try:
    time_encoder = load_pkl('time_encoder.pkl')
    print("Time Encoder:", time_encoder)
except Exception as e:
    print("Error loading time_encoder:", e)

try:
    scaler = load_pkl('energy_scaler.pkl')
    print("Scaler n_features_in_:", getattr(scaler, 'n_features_in_', 'N/A'))
    print("Scaler feature_names_in_:", getattr(scaler, 'feature_names_in_', 'N/A'))
except Exception as e:
    print("Error loading scaler:", e)

try:
    model = load_pkl('energy_rf_model.pkl')
    print("Model n_features_in_:", getattr(model, 'n_features_in_', 'N/A'))
    print("Model n_estimators:", getattr(model, 'n_estimators', 'N/A'))
except Exception as e:
    print("Error loading model:", e)
