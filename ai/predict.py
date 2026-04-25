import joblib
import os
import sys
from datetime import datetime, timedelta
from contextlib import redirect_stdout, redirect_stderr
from io import StringIO

# Suppress vnstock output by redirecting to stderr
import io
with redirect_stdout(sys.stderr):
    import vnstock

try:
    import xgboost as xgb
except ImportError:
    xgb = None
from feature_engineering import prepare_features

# Custom logger to stderr
def log(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

def predict_stock(symbol='VCB'):
    """
    Dự đoán giá cổ phiếu cho ngày mai
    """
    log("\n" + "="*60)
    log(f"🔮 DỰ ĐOÁN GIÁ CỔ PHI ẾU {symbol}")
    log("="*60)
    
    # 1. Load model
    try:
        model = joblib.load(f'models/model_{symbol}_advanced.pkl')
        features_list = joblib.load(f'models/features_{symbol}.pkl')
        log(f"✓ Loaded advanced model with {len(features_list)} features")
    except Exception as e:
        log(f"❌ Error: {e}")
        log(f"   Please train the model first: python ai/model_training_advanced.py")
        return
    
    # 2. Fetch latest data
    log(f"\n📥 Fetching latest data...")
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
    
    quote = vnstock.Quote(symbol=symbol, source='VCI')
    df_raw = quote.history(start=start_date, end=end_date, interval='1D')
    
    if df_raw.empty:
        log("❌ No data available")
        return
    
    # 3. Prepare features
    log(f"🔧 Calculating technical indicators...")
    df_processed = prepare_features(df_raw, symbol, start_date, end_date, vnstock)
    
    # 4. Get latest features
    X = df_processed[features_list]
    latest_features = X.iloc[-1:].values
    
    # 5. Make prediction
    prediction = model.predict(latest_features)[0]
    latest_close = df_processed.iloc[-1]['close']
    change = prediction - latest_close
    change_pct = (change / latest_close) * 100
    
    # 6. Display results
    latest_date = df_processed.iloc[-1]['time']
    # 6. Display results
    latest_date = df_processed.iloc[-1]['time']
    log(f"\n📊 KẾT QUẢ DỰ ĐOÁN:")
    log(f"   {'-'*50}")
    log(f"   Ngày gần nhất:      {latest_date}")
    log(f"   Giá đóng cửa:       {latest_close:,.0f} VND")
    log(f"   Dự đoán ngày mai:   {prediction:,.0f} VND")
    log(f"   Thay đổi dự kiến:   {change:+,.0f} VND ({change_pct:+.2f}%)")
    
    if change_pct > 2:
        log(f"   Xu hướng:           📈 TĂNG MẠNH")
    elif change_pct > 0:
        log(f"   Xu hướng:           📈 Tăng nhẹ")
    elif change_pct > -2:
        log(f"   Xu hướng:           📉 Giảm nhẹ")
    else:
        log(f"   Xu hướng:           📉 GIẢM MẠNH")
    
    # 7. Show some key indicators
    log(f"\n📈 CHỈ SỐ KỸ THUẬT HIỆN TẠI:")
    log(f"   {'-'*50}")
    latest_row = df_processed.iloc[-1]
    
    if 'RSI' in df_processed.columns:
        rsi = latest_row['RSI']
        rsi_signal = "Quá mua" if rsi > 70 else "Quá bán" if rsi < 30 else "Trung lập"
        log(f"   RSI:                {rsi:.2f} ({rsi_signal})")
    
    if 'MACD' in df_processed.columns:
        macd = latest_row['MACD']
        macd_signal = latest_row.get('MACD_signal', 0)
        trend = "Tích cực" if macd > macd_signal else "Tiêu cực"
        log(f"   MACD:               {macd:.2f} ({trend})")
    
    if 'BB_position' in df_processed.columns:
        bb_pos = latest_row['BB_position']
        bb_status = "Trên dải" if bb_pos > 0.8 else "Dưới dải" if bb_pos < 0.2 else "Giữa dải"
        log(f"   Bollinger Bands:    {bb_pos:.2f} ({bb_status})")
    
    if 'EMA_12' in df_processed.columns and 'EMA_26' in df_processed.columns:
        ema_diff = latest_row['EMA_12'] - latest_row['EMA_26']
        ema_trend = "Xu hướng tăng" if ema_diff > 0 else "Xu hướng giảm"
        log(f"   EMA Cross:          {ema_diff:+.2f} ({ema_trend})")
    
    # 8. Feature importance
    if hasattr(model, 'feature_importances_'):
        log(f"\n🔍 YẾU TỐ QUAN TRỌNG NHẤT:")
        log(f"   {'-'*50}")
        importance = sorted(
            zip(features_list, model.feature_importances_),
            key=lambda x: x[1],
            reverse=True
        )
        for i, (feature, imp) in enumerate(importance[:5], 1):
            log(f"   {i}. {feature:<20} ({imp*100:.1f}%)")
    
    log(f"\n{'='*60}\n")
    return

def get_prediction_data(symbol='VCB'):
    """
    Lấy dữ liệu dự đoán dưới dạng dictionary cho Backend
    With intelligent caching to improve performance
    """
    try:
        # Check cache first
        current_dir = os.path.dirname(os.path.abspath(__file__))
        cache_dir = os.path.join(current_dir, 'cache')
        os.makedirs(cache_dir, exist_ok=True)
        cache_file = os.path.join(cache_dir, f'prediction_{symbol}.json')
        
        # Cache TTL: 30 minutes
        cache_ttl = 30 * 60  # seconds
        
        if os.path.exists(cache_file):
            cache_age = datetime.now().timestamp() - os.path.getmtime(cache_file)
            if cache_age < cache_ttl:
                # Cache is fresh, return it
                log(f"✓ Using cached prediction for {symbol} (age: {int(cache_age/60)}min)")
                import json
                with open(cache_file, 'r', encoding='utf-8') as f:
                    cached_result = json.load(f)
                    cached_result['cached'] = True
                    cached_result['cache_age_minutes'] = int(cache_age / 60)
                    return cached_result
        
        # Load model and features
        model_path = os.path.join(current_dir, 'models', f'model_{symbol}_advanced.pkl')
        features_path = os.path.join(current_dir, 'models', f'features_{symbol}.pkl')
        
        if not os.path.exists(model_path):
             # Try to train on demand
             try:
                return {"status": "training_required", "symbol": symbol}
                 
             except Exception as train_error:
                 return {"error": f"Model not found and training failed: {train_error}", "training": True}

        model = joblib.load(model_path)
        features_list = joblib.load(features_path)
        
        # Fetch data
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
        quote = vnstock.Quote(symbol=symbol, source='VCI')
        df_raw = quote.history(start=start_date, end=end_date, interval='1D')
        
        if df_raw.empty:
            return {"error": "No data available"}
            
        # Process features
        df_processed = prepare_features(df_raw, symbol, start_date, end_date, vnstock)
        latest_row = df_processed.iloc[-1]
        
        # Predict
        X = df_processed[features_list]
        latest_features = X.iloc[-1:].values
        prediction = model.predict(latest_features)[0]
        latest_close = latest_row['close']
        
        # Get historical data for chart (last 30 points)
        history_df = df_processed.tail(30).reset_index()
        history_data = []
        for _, row in history_df.iterrows():
            history_data.append({
                "date": str(row['time']).split(' ')[0], # Format: YYYY-MM-DD
                "price": float(row['close'])
            })
        
        # Format result
        result = {
            "symbol": symbol,
            "latest_date": str(latest_row['time']),
            "latest_close": float(latest_close),
            "prediction": float(prediction),
            "change": float(prediction - latest_close),
            "change_pct": float(((prediction - latest_close) / latest_close) * 100),
            "indicators": {
                "rsi": float(latest_row.get('RSI', 0)),
                "macd": float(latest_row.get('MACD', 0)),
                "macd_signal": float(latest_row.get('MACD_signal', 0)),
                "bb_pos": float(latest_row.get('BB_position', 0)),
                "bb_upper": float(latest_row.get('BB_high', 0)),
                "bb_lower": float(latest_row.get('BB_low', 0)),
                "sma20": float(latest_row.get('SMA20', 0)),
                "sma50": float(latest_row.get('SMA50', 0)),
                "ema12": float(latest_row.get('EMA_12', 0)),
                "ema26": float(latest_row.get('EMA_26', 0)),
                "volume_ratio": float(latest_row.get('volume_ratio', 0))
            },
            "history": history_data
        }
        
        # Top importance
        if hasattr(model, 'feature_importances_'):
            importance = sorted(
                zip(features_list, model.feature_importances_),
                key=lambda x: x[1],
                reverse=True
            )
            result["top_features"] = [
                {"feature": f, "importance": float(i)} for f, i in importance[:5]
            ]
        
        # Save to cache
        result['cached'] = False
        import json
        try:
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            log(f"✓ Cached prediction for {symbol}")
        except Exception as cache_err:
            log(f"⚠ Failed to save cache: {cache_err}")
            
        return result
        
    except Exception as e:
        return {"error": str(e)}

def get_market_overview():
    """
    Get market overview data (Indices + Top Stocks)
    """
    # Use StringIO to capture any accidental stdout and redirect it to stderr
    with redirect_stdout(sys.stderr):
        try:
            # 1. Get Indices
            indices = ['VNINDEX', 'HNXINDEX', 'UPINDEX']
            indices_data = []
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d')
            
            log(f"📊 Fetching market overview indices...")
            for idx in indices:
                try:
                    quote = vnstock.Quote(symbol=idx, source='VCI')
                    hist = quote.history(start=start_date, end=end_date, interval='1D')
                    if not hist.empty:
                        latest = hist.iloc[-1]
                        prev = hist.iloc[-2] if len(hist) > 1 else latest
                        
                        indices_data.append({
                            "symbol": idx,
                            "price": float(latest['close']),
                            "change": float(latest['close'] - prev['close']),
                            "change_pct": float(((latest['close'] - prev['close']) / prev['close']) * 100)
                        })
                except Exception as e:
                    log(f"⚠ Warning: Failed to fetch index {idx}: {e}")
                    pass

            # 2. Get Top Stocks (VN30 representative)
            top_symbols = ['VCB', 'VHM', 'VIC', 'HPG', 'FPT', 'MSN', 'MWG', 'VPB', 'TCB', 'VNM']
            stocks_data = []
            
            log(f"🏢 Fetching top stocks data...")
            for sym in top_symbols:
                try:
                    quote = vnstock.Quote(symbol=sym, source='VCI')
                    hist = quote.history(start=start_date, end=end_date, interval='1D')
                    if not hist.empty:
                        latest = hist.iloc[-1]
                        prev = hist.iloc[-2] if len(hist) > 1 else latest
                        
                        stocks_data.append({
                            "symbol": sym,
                            "price": float(latest['close']),
                            "change": float(latest['close'] - prev['close']),
                            "change_pct": float(((latest['close'] - prev['close']) / prev['close']) * 100),
                            "volume": int(latest.get('volume', 0))
                        })
                except Exception as e:
                    log(f"⚠ Warning: Failed to fetch stock {sym}: {e}")
                    pass
                    
            return {
                "indices": indices_data,
                "top_stocks": stocks_data,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            log(f"❌ Critical error in get_market_overview: {e}")
            return {"error": str(e)}

if __name__ == "__main__":
    import sys
    
    # Lấy symbol từ command line hoặc dùng VCB mặc định
    symbol = sys.argv[1].upper() if len(sys.argv) > 1 else 'VCB'
    
    predict_stock(symbol)
