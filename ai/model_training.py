import os
import sys
from datetime import datetime, timedelta

# Heavy imports delayed to avoid deadlock on Python 3.14
def get_ml_libs():
    import pandas as pd
    import numpy as np
    from sklearn.linear_model import LinearRegression
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error, mean_squared_error
    import joblib
    import vnstock
    return pd, np, LinearRegression, train_test_split, mean_absolute_error, mean_squared_error, joblib, vnstock

def fetch_data(symbol, start_date, end_date, vnstock):
    """
    Fetch historical data using vnstock 3.x API
    """
    print(f"Fetching data for {symbol} from {start_date} to {end_date}...")
    # Use vnstock 3.x API with Quote class
    quote = vnstock.Quote(symbol=symbol, source='VCI')
    df = quote.history(start=start_date, end=end_date, interval='1D')
    return df

def preprocess_data(df, pd):
    """
    Simple preprocessing for Linear Regression
    We'll predict tomorrow's Close price based on:
    - Current Close
    - 5-day SMA
    - 20-day SMA
    """
    # vnstock 3.x uses lowercase column names
    df = df.sort_values('time')
    df['SMA5'] = df['close'].rolling(window=5).mean()
    df['SMA20'] = df['close'].rolling(window=20).mean()
    
    # Target: Tomorrow's Close price
    df['Target'] = df['close'].shift(-1)
    
    # Drop rows with NaN (due to rolling and shift)
    df = df.dropna()
    
    features = ['close', 'SMA5', 'SMA20']
    X = df[features]
    y = df['Target']
    
    return X, y, df

def train_model(X, y, LinearRegression, train_test_split, mean_absolute_error, mean_squared_error, np):
    """
    Train a simple Linear Regression model
    """
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=False)
    
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    # Evaluate
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    
    print(f"Model trained successfully!")
    print(f"MAE: {mae:.2f}")
    print(f"RMSE: {rmse:.2f}")
    
    return model

if __name__ == "__main__":
    # Create models directory if not exists
    os.makedirs("models", exist_ok=True)
    
    print("Loading libraries...")
    try:
        pd, np, LR, tts, mae, mse, joblib, vnstock = get_ml_libs()
    except Exception as e:
        print(f"Error loading libraries: {e}")
        sys.exit(1)
        
    # Settings
    symbol = "VCB" # Default symbol
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=365*2)).strftime('%Y-%m-%d') # 2 years of data
    
    # 1. Fetch
    df_raw = fetch_data(symbol, start_date, end_date, vnstock)
    
    if df_raw.empty:
        print("No data fetched. Check symbol or internet connection.")
    else:
        # 2. Preprocess
        X, y, df_processed = preprocess_data(df_raw, pd)
        
        # 3. Train
        model = train_model(X, y, LR, tts, mae, mse, np)
        
        # 4. Save
        model_path = f"models/model_{symbol}.pkl"
        joblib.dump(model, model_path)
        print(f"Model saved to {model_path}")
        
        # Example prediction for latest data
        latest_features = X.iloc[-1:].values
        prediction = model.predict(latest_features)[0]
        print(f"Latest Close: {X.iloc[-1]['close']:.2f}")
        print(f"Predicted Next Close: {prediction:.2f}")
