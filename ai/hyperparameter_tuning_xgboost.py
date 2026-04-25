"""
Hyperparameter Tuning for XGBoost Model
Uses RandomizedSearchCV for efficient parameter optimization
"""

import os
import sys
import json
import argparse
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

def tune_hyperparameters(X, y, n_iter=50, cv=5, random_state=42):
    """
    Tune XGBoost hyperparameters using RandomizedSearchCV
    """
    try:
        import xgboost as xgb
        from sklearn.model_selection import RandomizedSearchCV
        import numpy as np
    except ImportError:
        print("❌ XGBoost not installed. Please run: pip install xgboost")
        return None, 0
    
    # Define parameter search space for XGBoost
    param_distributions = {
        'n_estimators': [100, 200, 300, 500],
        'learning_rate': [0.01, 0.03, 0.05, 0.1, 0.2],
        'max_depth': [3, 4, 5, 6, 8, 10],
        'min_child_weight': [1, 3, 5, 7],
        'gamma': [0, 0.1, 0.2, 0.3, 0.4],
        'subsample': [0.6, 0.7, 0.8, 0.9, 1.0],
        'colsample_bytree': [0.6, 0.7, 0.8, 0.9, 1.0],
        'reg_alpha': [0, 0.01, 0.1, 1],
        'reg_lambda': [1, 1.5, 2, 5]
    }
    
    print("\n🔍 Starting XGBoost hyperparameter search...")
    print(f"   Iterations: {n_iter}")
    print(f"   Cross-validation: {cv}-fold")
    print(f"\n⏳ This may take some time depending on your CPU...\n")
    
    # Create base model
    base_model = xgb.XGBRegressor(
        random_state=random_state, 
        verbosity=0,
        n_jobs=-1
    )
    
    # Random search
    random_search = RandomizedSearchCV(
        base_model,
        param_distributions=param_distributions,
        n_iter=n_iter,
        scoring='r2',
        cv=cv,
        random_state=random_state,
        n_jobs=-1,
        verbose=1
    )
    
    # Fit
    random_search.fit(X, y)
    
    print("\n✅ XGBoost hyperparameter search completed!")
    print(f"\n📊 Best parameters found:")
    for param, value in random_search.best_params_.items():
        print(f"   {param:<20} = {value}")
    
    print(f"\n📈 Cross-validation R² score: {random_search.best_score_:.4f}")
    
    return random_search.best_params_, random_search.best_score_

def save_best_params(symbol, params, cv_score):
    params_file = "ai/best_params_xgboost.json"
    
    if os.path.exists(params_file):
        try:
            with open(params_file, 'r') as f:
                all_params = json.load(f)
        except:
            all_params = {}
    else:
        all_params = {}
    
    all_params[symbol] = {
        **params,
        'tuned_date': datetime.now().strftime('%Y-%m-%d'),
        'cv_score': cv_score
    }
    
    with open(params_file, 'w') as f:
        json.dump(all_params, f, indent=2)
    
    print(f"✓ Parameters saved to {params_file}")

def main():
    parser = argparse.ArgumentParser(description='Tune hyperparameters for XGBoost stock prediction model')
    parser.add_argument('--symbol', type=str, default='VCB', help='Stock symbol')
    parser.add_argument('--n_iter', type=int, default=30, help='Number of iterations')
    parser.add_argument('--cv', type=int, default=5, help='Cross-validation folds')
    
    args = parser.parse_args()
    
    sys.path.insert(0, 'ai')
    import vnstock
    from datetime import timedelta
    from feature_engineering import prepare_features, get_feature_columns
    from model_training_advanced import fetch_data
    
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=730)).strftime('%Y-%m-%d')
    
    df_raw = fetch_data(args.symbol, start_date, end_date, vnstock)
    if df_raw.empty: return
    
    df_processed = prepare_features(df_raw, args.symbol, start_date, end_date, vnstock)
    feature_cols = get_feature_columns(df_processed)
    X = df_processed[feature_cols]
    y = df_processed['Target']
    
    best_params, best_score = tune_hyperparameters(X, y, n_iter=args.n_iter, cv=args.cv)
    if best_params:
        save_best_params(args.symbol, best_params, best_score)

if __name__ == "__main__":
    main()
