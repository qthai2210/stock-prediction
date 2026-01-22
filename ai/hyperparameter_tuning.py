"""
Hyperparameter Tuning for Gradient Boosting Model
Uses RandomizedSearchCV for efficient parameter optimization
"""

import os
import sys
import json
import argparse
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

def get_ml_libs():
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import GradientBoostingRegressor
    from sklearn.model_selection import RandomizedSearchCV, cross_val_score
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    import joblib
    return pd, np, GradientBoostingRegressor, RandomizedSearchCV, cross_val_score, mae, mse, r2, joblib


def load_best_params(symbol: str) -> dict:
    """Load best parameters if available"""
    params_file = "ai/best_params.json"
    
    if not os.path.exists(params_file):
        return None
    
    try:
        with open(params_file, 'r') as f:
            all_params = json.load(f)
        
        if symbol in all_params:
            print(f"✓ Found saved parameters for {symbol}")
            return all_params[symbol]
    except Exception as e:
        print(f"⚠ Error loading parameters: {e}")
    
    return None


def save_best_params(symbol: str, params: dict, cv_score: float):
    """Save best parameters to JSON"""
    params_file = "ai/best_params.json"
    
    # Load existing params
    if os.path.exists(params_file):
        try:
            with open(params_file, 'r') as f:
                all_params = json.load(f)
        except:
            all_params = {}
    else:
        all_params = {}
    
    # Add new params
    all_params[symbol] = {
        **params,
        'tuned_date': datetime.now().strftime('%Y-%m-%d'),
        'cv_score': cv_score
    }
    
    # Save
    os.makedirs("ai", exist_ok=True)
    with open(params_file, 'w') as f:
        json.dump(all_params, f, indent=2)
    
    print(f"✓ Parameters saved to {params_file}")


def tune_hyperparameters(X, y, n_iter=50, cv=5, random_state=42):
    """
    Tune Gradient Boosting hyperparameters using RandomizedSearchCV
    
    Args:
        X: Features
        y: Target
        n_iter: Number of iterations (more = better but slower)
        cv: Number of cross-validation folds
        random_state: Random seed
    
    Returns:
        best_params: Dictionary of best parameters
        best_score: Best cross-validation score
    """
    from sklearn.ensemble import GradientBoostingRegressor
    from sklearn.model_selection import RandomizedSearchCV
    import numpy as np
    
    # Define parameter search space
    param_distributions = {
        'n_estimators': [50, 100, 150, 200, 300],
        'learning_rate': [0.01, 0.05, 0.1, 0.15, 0.2],
        'max_depth': [3, 4, 5, 6, 7],
        'min_samples_split': [2, 5, 10, 15],
        'min_samples_leaf': [1, 2, 4],
        'subsample': [0.8, 0.9, 1.0],
        'max_features': ['sqrt', 'log2', None]
    }
    
    print("\n🔍 Starting hyperparameter search...")
    print(f"   Search space:")
    for param, values in param_distributions.items():
        print(f"   - {param}: {len(values)} options")
    print(f"   Iterations: {n_iter}")
    print(f"   Cross-validation: {cv}-fold")
    print(f"\n⏳ This may take 10-30 minutes...\n")
    
    # Create base model
    base_model = GradientBoostingRegressor(random_state=random_state, verbose=0)
    
    # Random search
    random_search = RandomizedSearchCV(
        base_model,
        param_distributions=param_distributions,
        n_iter=n_iter,
        scoring='r2',  # Maximize R² score
        cv=cv,
        random_state=random_state,
        n_jobs=-1,  # Use all CPU cores
        verbose=1
    )
    
    # Fit
    random_search.fit(X, y)
    
    print("\n✅ Hyperparameter search completed!")
    print(f"\n📊 Best parameters found:")
    for param, value in random_search.best_params_.items():
        print(f"   {param:<20} = {value}")
    
    print(f"\n📈 Cross-validation R² score: {random_search.best_score_:.4f}")
    
    return random_search.best_params_, random_search.best_score_


def main():
    parser = argparse.ArgumentParser(description='Tune hyperparameters for stock prediction model')
    parser.add_argument('--symbol', type=str, default='VCB', help='Stock symbol')
    parser.add_argument('--n_iter', type=int, default=50, help='Number of iterations (default: 50)')
    parser.add_argument('--cv', type=int, default=5, help='Cross-validation folds (default: 5)')
    parser.add_argument('--days', type=int, default=730, help='Days of historical data (default: 730)')
    
    args = parser.parse_args()
    
    print("="*70)
    print("🎯 HYPERPARAMETER TUNING - GRADIENT BOOSTING")
    print("="*70)
    print(f"\nSymbol: {args.symbol}")
    print(f"Iterations: {args.n_iter}")
    print(f"CV Folds: {args.cv}")
    
    # Import dependencies
    sys.path.insert(0, 'ai')
    
    import vnstock
    from datetime import datetime, timedelta
    from feature_engineering import prepare_features, get_feature_columns
    from model_training_advanced import fetch_data
    
    # Prepare data
    print("\n📥 Fetching data...")
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=args.days)).strftime('%Y-%m-%d')
    
    df_raw = fetch_data(args.symbol, start_date, end_date, vnstock)
    
    if df_raw.empty:
        print("❌ No data fetched")
        return
    
    # Prepare features
    print("\n🔧 Preparing features...")
    df_processed = prepare_features(df_raw, args.symbol, start_date, end_date, vnstock)
    
    feature_cols = get_feature_columns(df_processed)
    X = df_processed[feature_cols]
    y = df_processed['Target']
    
    print(f"✓ Dataset: {len(X)} samples, {len(feature_cols)} features")
    
    # Tune hyperparameters
    best_params, best_score = tune_hyperparameters(
        X, y,
        n_iter=args.n_iter,
        cv=args.cv
    )
    
    # Save best parameters
    save_best_params(args.symbol, best_params, best_score)
    
    print("\n" + "="*70)
    print("✅ TUNING COMPLETED!")
    print("="*70)
    print(f"\nNext steps:")
    print(f"1. Run: python ai/model_training_advanced.py")
    print(f"   (It will automatically use the tuned parameters)")
    print(f"2. Compare performance with previous model")
    print()


if __name__ == "__main__":
    main()
