"""
Demo đơn giản - Hiển thị kết quả training
"""

import joblib
import os

print("\n" + "="*70)
print(" " * 15 + "📊 STOCK PREDICTION MODEL - SUMMARY")
print("="*70)

# Check files
models_dir = "models"
files = [f for f in os.listdir(models_dir) if 'VCB' in f and f.endswith('.pkl')]

print(f"\n✅ MODELS CREATED: {len(files)} files")
print("-" * 70)
for f in sorted(files):
    size = os.path.getsize(os.path.join(models_dir, f))
    print(f"   {f:<35} {size/1024:>10,.1f} KB")

# Load and show info
print("\n" + "="*70)
print(" " * 20 + "📈 MODEL DETAILS")
print("="*70)

try:
    # Advanced model
    model_adv = joblib.load('models/model_VCB_advanced.pkl')
    print(f"\n🤖 ADVANCED MODEL (Gradient Boosting)")
    print(f"   Algorithm:      {type(model_adv).__name__}")
    print(f"   Estimators:     {model_adv.n_estimators}")
    print(f"   Max Depth:      {model_adv.max_depth}")
    print(f"   Learning Rate:  {model_adv.learning_rate}")
    
    # Simple model
    model_simple = joblib.load('models/model_VCB_simple.pkl')
    print(f"\n📝 SIMPLE MODEL (Linear Regression)")
    print(f"   Algorithm:      {type(model_simple).__name__}")
    print(f"   Coefficients:   {len(model_simple.coef_)}")
    
    # Features
    features = joblib.load('models/features_VCB.pkl')
    print(f"\n📊 FEATURES")
    print(f"   Total Features: {len(features)}")
    print(f"\n   Feature List:")
    
    # Group features by category
    technical = [f for f in features if any(x in f for x in ['RSI', 'MACD', 'BB', 'EMA', 'SMA', 'volume', 'momentum', 'VWAP'])]
    financial = [f for f in features if any(x in f.upper() for x in ['EPS', 'PE', 'PB', 'ROE', 'ROA'])]
    macro = [f for f in features if any(x in f for x in ['VNINDEX', 'USD'])]
    other = [f for f in features if f not in technical + financial + macro]
    
    print(f"\n   📈 Technical Indicators ({len(technical)}):")
    for f in technical:
        print(f"      • {f}")
    
    print(f"\n   💼 Financial Ratios ({len(financial)}):")
    for f in financial:
        print(f"      • {f}")
    
    print(f"\n   🌍 Macro Data ({len(macro)}):")
    for f in macro:
        print(f"      • {f}")
    
    if other:
        print(f"\n   🔧 Other ({len(other)}):")
        for f in other:
            print(f"      • {f}")
    
    print("\n" + "="*70)
    print(" " * 18 + "🎯 QUICK START GUIDE")
    print("="*70)
    print("\n   1. Dự đoán nhanh:")
    print("      python ai\\predict.py VCB")
    print("\n   2. Train lại model:")
    print("      python ai\\model_training_advanced.py")
    print("\n   3. Kiểm tra model:")
    print("      python ai\\check_models.py")
    print("\n   4. Đọc hướng dẫn:")
    print("      notepad ADVANCED_GUIDE.md")
    
    print("\n" + "="*70)
    print(" " * 22 + "✅ SETUP COMPLETE!")
    print("="*70 + "\n")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nℹ️  Run training first: python ai\\model_training_advanced.py\n")
