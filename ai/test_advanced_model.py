"""
Test và so sánh Advanced Model với Simple Model
"""

import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta


def test_models(symbol='VCB'):
    """
    Test và so sánh models
    """
    print("=" * 60)
    print("🧪 TESTING ADVANCED STOCK PREDICTION MODEL")
    print("=" * 60)
    
    # Load models
    try:
        model_advanced = joblib.load(f'models/model_{symbol}_advanced.pkl')
        print(f"✓ Loaded advanced model (Gradient Boosting)")
    except Exception as e:
        print(f"❌ Could not load advanced model: {e}")
        return
    
    try:
        model_simple = joblib.load(f'models/model_{symbol}_simple.pkl')
        print(f"✓ Loaded simple model (Linear Regression)")
    except Exception as e:
        print(f"⚠ Could not load simple model: {e}")
        model_simple = None
    
    try:
        feature_cols = joblib.load(f'models/features_{symbol}.pkl')
        print(f"✓ Loaded feature columns ({len(feature_cols)} features)")
    except Exception as e:
        print(f"❌ Could not load feature columns: {e}")
        return
    
    # Get latest data
    print(f"\n📥 Fetching latest data for {symbol}...")
    import vnstock
    from feature_engineering import prepare_features
    
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
    
    quote = vnstock.Quote(symbol=symbol, source='VCI')
    df_raw = quote.history(start=start_date, end=end_date, interval='1D')
    
    if df_raw.empty:
        print("❌ No data fetched")
        return
    
    # Prepare features
    df_processed = prepare_features(df_raw, symbol, start_date, end_date, vnstock)
    
    # Get features
    X = df_processed[feature_cols]
    
    print(f"\n✓ Data prepared: {len(X)} samples")
    
    # Make predictions for last 5 days
    print(f"\n🔮 PREDICTIONS FOR LAST 5 DAYS:")
    print(f"   {'-'*70}")
    print(f"   {'Date':<12} {'Actual':<12} {'Advanced':<12} {'Simple':<12} {'Error (Adv)':<12}")
    print(f"   {'-'*70}")
    
    errors_advanced = []
    errors_simple = []
    
    for i in range(-5, 0):
        if i + 1 < len(df_processed):
            actual = df_processed.iloc[i + 1]['close'] if i + 1 < len(df_processed) else None
        else:
            actual = None
            
        features = X.iloc[i:i+1].values
        pred_advanced = model_advanced.predict(features)[0]
        pred_simple = model_simple.predict(features)[0] if model_simple else 0
        
        date_str = df_processed.iloc[i]['time'].strftime('%Y-%m-%d') if hasattr(df_processed.iloc[i]['time'], 'strftime') else str(df_processed.iloc[i]['time'])[:10]
        
        if actual:
            error_advanced = abs(actual - pred_advanced)
            error_simple = abs(actual - pred_simple) if model_simple else 0
            errors_advanced.append(error_advanced)
            if model_simple:
                errors_simple.append(error_simple)
            
            print(f"   {date_str:<12} {actual:<12,.0f} {pred_advanced:<12,.0f} {pred_simple:<12,.0f} {error_advanced:<12,.0f}")
        else:
            print(f"   {date_str:<12} {'N/A':<12} {pred_advanced:<12,.0f} {pred_simple:<12,.0f} {'N/A':<12}")
    
    # Calculate average errors
    if errors_advanced:
        avg_error_adv = np.mean(errors_advanced)
        avg_error_sim = np.mean(errors_simple) if errors_simple else 0
        
        print(f"   {'-'*70}")
        print(f"   {'Average Error':<12} {'':<12} {avg_error_adv:<12,.0f} {avg_error_sim:<12,.0f}")
        
        if errors_simple:
            improvement = ((avg_error_sim - avg_error_adv) / avg_error_sim) * 100
            print(f"\n   💡 Advanced model is {improvement:.1f}% better than simple model")
    
    # Predict next day
    print(f"\n🔮 PREDICTION FOR NEXT TRADING DAY:")
    print(f"   {'-'*40}")
    
    latest_features = X.iloc[-1:].values
    prediction_advanced = model_advanced.predict(latest_features)[0]
    latest_close = df_processed.iloc[-1]['close']
    change_pct = ((prediction_advanced - latest_close) / latest_close) * 100
    
    print(f"   Current Close:      {latest_close:,.0f} VND")
    print(f"   Predicted Close:    {prediction_advanced:,.0f} VND")
    print(f"   Expected Change:    {change_pct:+.2f}%")
    print(f"   Direction:          {'📈 UP' if change_pct > 0 else '📉 DOWN'}")
    
    # Feature importance (nếu có)
    if hasattr(model_advanced, 'feature_importances_'):
        print(f"\n🔍 TOP 10 MOST IMPORTANT FEATURES:")
        print(f"   {'-'*40}")
        feature_importance = sorted(
            zip(feature_cols, model_advanced.feature_importances_),
            key=lambda x: x[1],
            reverse=True
        )
        for i, (feature, importance) in enumerate(feature_importance[:10], 1):
            bar_length = int(importance * 50)
            bar = '█' * bar_length
            print(f"   {i:2d}. {feature:<20} {bar} {importance:.4f}")
    
    print(f"\n{'='*60}")
    print("✅ TESTING COMPLETED!")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    import sys
    
    # Kiểm tra arguments
    symbol = sys.argv[1] if len(sys.argv) > 1 else 'VCB'
    
    test_models(symbol)
