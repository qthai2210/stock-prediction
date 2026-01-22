"""
Advanced Stock Price Prediction Model
Sử dụng Gradient Boosting với technical indicators, financial ratios, và macro data
"""

import os
import sys
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# Import vnstock trước để tránh deadlock
import vnstock

# Lazy imports cho ML libraries
def get_ml_libs():
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import GradientBoostingRegressor
    from sklearn.linear_model import LinearRegression
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    from sklearn.preprocessing import StandardScaler
    import joblib
    return pd, np, GradientBoostingRegressor, LinearRegression, train_test_split, cross_val_score, mean_absolute_error, mean_squared_error, r2_score, StandardScaler, joblib


def fetch_data(symbol, start_date, end_date, vnstock):
    """
    Fetch historical data using vnstock 3.x API
    """
    print(f"📥 Fetching data for {symbol} from {start_date} to {end_date}...")
    quote = vnstock.Quote(symbol=symbol, source='VCI')
    df = quote.history(start=start_date, end=end_date, interval='1D')
    print(f"✓ Fetched {len(df)} days of data")
    return df


def train_model(X, y, model_type='gradient_boosting'):
    """
    Train model với Gradient Boosting hoặc Linear Regression
    
    Args:
        X: Features
        y: Target
        model_type: 'gradient_boosting' hoặc 'linear_regression'
    """
    from sklearn.ensemble import GradientBoostingRegressor
    from sklearn.linear_model import LinearRegression
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    import numpy as np
    
    # Split data (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, shuffle=False
    )
    
    print(f"\n🤖 Training {model_type} model...")
    print(f"   Training samples: {len(X_train)}")
    print(f"   Testing samples: {len(X_test)}")
    print(f"   Features: {X.shape[1]}")
    
    # Choose model
    if model_type == 'gradient_boosting':
        # Try to load tuned parameters
        params_file = "ai/best_params.json"
        symbol = None  # Will be passed from main, use default for now
        
        # Default parameters - Optimized for speed!
        default_params = {
            'n_estimators': 50,  # Reduced from 100 for faster training
            'learning_rate': 0.15,  # Increased to compensate
            'max_depth': 4,  # Reduced from 5 for speed
            'min_samples_split': 10,  # Increased for speed
            'min_samples_leaf': 4,  # Increased for speed
            'random_state': 42,
            'verbose': 0
        }
        
        # Try to load tuned params
        if os.path.exists(params_file):
            try:
                import json
                with open(params_file, 'r') as f:
                    all_params = json.load(f)
                
                # Check if we have params for this symbol (try to infer from context)
                # For now, use first available tuned params
                if all_params:
                    first_symbol = list(all_params.keys())[0]
                    tuned_params = all_params[first_symbol]
                    
                    # Extract only model params (remove metadata)
                    model_params = {k: v for k, v in tuned_params.items() 
                                   if k not in ['tuned_date', 'cv_score']}
                    model_params['random_state'] = 42
                    model_params['verbose'] = 0
                    
                    print(f"   ✓ Using tuned parameters from {params_file}")
                    print(f"   ✓ Tuned on: {tuned_params.get('tuned_date', 'unknown')}")
                    print(f"   ✓ CV Score: {tuned_params.get('cv_score', 0):.4f}")
                    
                    model = GradientBoostingRegressor(**model_params)
                else:
                    print(f"   ℹ Using default parameters (no tuned params available)")
                    model = GradientBoostingRegressor(**default_params)
            except Exception as e:
                print(f"   ⚠ Error loading tuned params: {e}")
                print(f"   ℹ Using default parameters")
                model = GradientBoostingRegressor(**default_params)
        else:
            print(f"   ℹ Using default parameters (run hyperparameter_tuning.py to optimize)")
            model = GradientBoostingRegressor(**default_params)
    else:
        model = LinearRegression()
    
    # Train
    model.fit(X_train, y_train)
    
    # Evaluate
    train_predictions = model.predict(X_train)
    test_predictions = model.predict(X_test)
    
    train_mae = mean_absolute_error(y_train, train_predictions)
    test_mae = mean_absolute_error(y_test, test_predictions)
    train_rmse = np.sqrt(mean_squared_error(y_train, train_predictions))
    test_rmse = np.sqrt(mean_squared_error(y_test, test_predictions))
    train_r2 = r2_score(y_train, train_predictions)
    test_r2 = r2_score(y_test, test_predictions)
    
    print(f"\n📊 Model Performance:")
    print(f"   {'Metric':<15} {'Train':<12} {'Test':<12}")
    print(f"   {'-'*40}")
    print(f"   {'MAE':<15} {train_mae:<12.2f} {test_mae:<12.2f}")
    print(f"   {'RMSE':<15} {train_rmse:<12.2f} {test_rmse:<12.2f}")
    print(f"   {'R² Score':<15} {train_r2:<12.4f} {test_r2:<12.4f}")
    
    # Feature importance (cho Gradient Boosting)
    if model_type == 'gradient_boosting' and hasattr(model, 'feature_importances_'):
        print(f"\n🔍 Top 10 Important Features:")
        feature_importance = sorted(
            zip(X.columns, model.feature_importances_),
            key=lambda x: x[1],
            reverse=True
        )
        for i, (feature, importance) in enumerate(feature_importance[:10], 1):
            print(f"   {i:2d}. {feature:<20} {importance:.4f}")
    
    return model, test_mae, test_rmse, test_r2


def train_and_save_model(symbol):
    """
    Train and save model for a specific symbol
    """
    print(f"\n{'#'*60}")
    print(f"🚀 STARTING TRAINING FOR {symbol}")
    print(f"{'#'*60}")
    
    # Imports needed
    try:
        from feature_engineering import prepare_features, get_feature_columns
        import joblib
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        return False
        
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=365*2)).strftime('%Y-%m-%d')
    
    # 1. Fetch raw data
    try:
        df_raw = fetch_data(symbol, start_date, end_date, vnstock)
    except Exception as e:
        print(f"❌ Error fetching data for {symbol}: {e}")
        return False

    if df_raw.empty:
        print(f"❌ No data fetched for {symbol}. Skipping...")
        return False
    
    # 2. Prepare features (technical indicators, ratios, macro data)
    try:
        df_processed = prepare_features(df_raw, symbol, start_date, end_date, vnstock)
    except Exception as e:
        print(f"❌ Error preparing features for {symbol}: {e}")
        return False
    
    if df_processed.empty:
        print(f"❌ Feature preparation failed for {symbol}. Skipping...")
        return False
    
    # 3. Get feature columns
    feature_cols = get_feature_columns(df_processed)
    X = df_processed[feature_cols]
    y = df_processed['Target']
    
    print(f"\n✓ Dataset ready for {symbol}:")
    print(f"   Total samples: {len(X)}")
    print(f"   Features: {len(feature_cols)}")
    
    # 4. Train Gradient Boosting model
    model_gb, mae_gb, rmse_gb, r2_gb = train_model(X, y, model_type='gradient_boosting')
    
    # 5. Train Linear Regression for comparison
    print("\n" + "="*60)
    print("📊 COMPARISON WITH LINEAR REGRESSION")
    print("="*60)
    model_lr, mae_lr, rmse_lr, r2_lr = train_model(X, y, model_type='linear_regression')
    
    # Compare models
    print(f"\n🏆 MODEL COMPARISON ({symbol}):")
    print(f"   {'Metric':<15} {'Gradient Boost':<18} {'Linear Reg':<18} {'Improvement':<15}")
    print(f"   {'-'*70}")
    mae_improvement = ((mae_lr - mae_gb) / mae_lr) * 100
    rmse_improvement = ((rmse_lr - rmse_gb) / rmse_lr) * 100
    r2_improvement = ((r2_gb - r2_lr) / abs(r2_lr)) * 100 if r2_lr != 0 else 0
    
    print(f"   {'MAE':<15} {mae_gb:<18.2f} {mae_lr:<18.2f} {mae_improvement:+.1f}%")
    print(f"   {'RMSE':<15} {rmse_gb:<18.2f} {rmse_lr:<18.2f} {rmse_improvement:+.1f}%")
    print(f"   {'R² Score':<15} {r2_gb:<18.4f} {r2_lr:<18.4f} {r2_improvement:+.1f}%")
    
    # 6. Save models
    current_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(current_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    model_path_gb = os.path.join(models_dir, f"model_{symbol}_advanced.pkl")
    model_path_lr = os.path.join(models_dir, f"model_{symbol}_simple.pkl")
    
    joblib.dump(model_gb, model_path_gb)
    joblib.dump(model_lr, model_path_lr)
    
    # Save feature columns for later use
    feature_path = os.path.join(models_dir, f"features_{symbol}.pkl")
    joblib.dump(feature_cols, feature_path)
    
    print(f"\n💾 Models saved for {symbol}:")
    print(f"   ✓ {model_path_gb}")
    print(f"   ✓ {model_path_lr}")
    print(f"   ✓ {feature_path}")
    
    # 7. Make prediction for latest data
    print(f"\n🔮 PREDICTION FOR NEXT DAY ({symbol}):")
    print(f"   {'-'*40}")
    
    latest_features = X.iloc[-1:].values
    prediction_gb = model_gb.predict(latest_features)[0]
    prediction_lr = model_lr.predict(latest_features)[0]
    latest_close = df_processed.iloc[-1]['close']
    
    print(f"   Latest Close Price: {latest_close:,.0f} VND")
    print(f"   Gradient Boosting:  {prediction_gb:,.0f} VND ({((prediction_gb - latest_close) / latest_close * 100):+.2f}%)")
    print(f"   Linear Regression:  {prediction_lr:,.0f} VND ({((prediction_lr - latest_close) / latest_close * 100):+.2f}%)")
    
    return True

if __name__ == "__main__":
    # Create models directory
    # os.makedirs("models", exist_ok=True) # Handled inside function now
    
    print("=" * 60)
    print("🚀 ADVANCED STOCK PREDICTION MODEL")
    print("=" * 60)
    
    # Load libraries
    print("\n⏳ Loading libraries...")
    try:
        pd, np, GBR, LR, tts, cvs, mae_fn, mse_fn, r2_fn, scaler_cls, joblib = get_ml_libs()
        print("✓ Libraries loaded successfully")
    except Exception as e:
        print(f"❌ Error loading libraries: {e}")
        sys.exit(1)
    
    # Import feature engineering
    try:
        from feature_engineering import prepare_features, get_feature_columns
        print("✓ Feature engineering module imported")
    except ImportError as e:
        print(f"❌ Error importing feature_engineering: {e}")
        print("   Make sure feature_engineering.py is in the same directory")
        sys.exit(1)
    
    # Check for command line arguments
    if len(sys.argv) > 1:
        # Train specific symbol(s)
        target_symbols = [s.upper() for s in sys.argv[1:]]
        print(f"\n🎯 Training mode: Specific symbols ({', '.join(target_symbols)})")
        
        for symbol in target_symbols:
             train_and_save_model(symbol)
             
    else:
        # Default batch training
        # Settings
        # Danh sách các mã cổ phiếu phổ biến (Top VN30)
        symbols = [
            # Top 10 by market cap
            "VCB", "FPT", "HPG", "VIC", "VNM", "TCB", "MSN", "VPB", "MBB", "ACB",
            # Additional VN30 stocks
            "VHM", "GAS", "CTG", "BID", "VRE", "PLX", "POW", "SSI", "GVR", "SAB"
        ] 
        
        print(f"\n🎯 Training mode: Batch (Top 20 VN30)")
        print(f"   Symbols to train: {', '.join(symbols)}")

        for symbol in symbols:
            train_and_save_model(symbol)
        
    print(f"\n{'='*60}")
    print("✅ TRAINING PROCESS COMPLETED!")
    print(f"{'='*60}\n")
