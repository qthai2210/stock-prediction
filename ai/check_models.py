"""
Quick test script để xem kết quả training
"""

import joblib
import os

print("\n" + "="*60)
print("📊 CHECKING TRAINED MODELS")
print("="*60)

# Check files
models_dir = "models"
if os.path.exists(models_dir):
    files = os.listdir(models_dir)
    print(f"\n✓ Found {len(files)} files in models directory:")
    for f in files:
        size = os.path.getsize(os.path.join(models_dir, f))
        print(f"   - {f:<30} ({size:,} bytes)")
else:
    print("\n❌ Models directory not found!")

# Try loading models
print("\n" + "="*60)
print("🔍 LOADING MODELS")
print("="*60)

try:
    model_advanced = joblib.load('models/model_VCB_advanced.pkl')
    print(f"\n✓ Advanced Model loaded successfully")
    print(f"   Type: {type(model_advanced).__name__}")
    if hasattr(model_advanced, 'n_estimators'):
        print(f"   Estimators: {model_advanced.n_estimators}")
except Exception as e:
    print(f"\n❌ Error loading advanced model: {e}")

try:
    model_simple = joblib.load('models/model_VCB_simple.pkl')
    print(f"\n✓ Simple Model loaded successfully")
    print(f"   Type: {type(model_simple).__name__}")
except Exception as e:
    print(f"\n❌ Error loading simple model: {e}")

try:
    features = joblib.load('models/features_VCB.pkl')
    print(f"\n✓ Feature list loaded successfully")
    print(f"   Total features: {len(features)}")
    print(f"\n   Features:")
    for i, f in enumerate(features, 1):
        print(f"   {i:2d}. {f}")
except Exception as e:
    print(f"\n❌ Error loading features: {e}")

print("\n" + "="*60 + "\n")
