"""
Feature Engineering Module for Stock Prediction
Thêm technical indicators, financial ratios, và macro data
"""

import pandas as pd
import numpy as np
import sys
import os
import json
import time
import requests
from datetime import datetime
from contextlib import redirect_stdout
from ta.trend import MACD, EMAIndicator
from ta.momentum import RSIIndicator
from ta.volatility import BollingerBands
from ta.volume import VolumeWeightedAveragePrice

# Custom logger to stderr
def log(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)


def add_technical_indicators(df):
    """
    Thêm các chỉ báo kỹ thuật vào DataFrame
    
    Args:
        df: DataFrame với columns: time, open, high, low, close, volume
        
    Returns:
        DataFrame với technical indicators
    """
    df = df.copy()
    
    # 1. RSI (Relative Strength Index)
    rsi = RSIIndicator(close=df['close'], window=14)
    df['RSI'] = rsi.rsi()
    
    # 2. MACD (Moving Average Convergence Divergence)
    macd = MACD(close=df['close'])
    df['MACD'] = macd.macd()
    df['MACD_signal'] = macd.macd_signal()
    df['MACD_diff'] = macd.macd_diff()
    
    # 3. Bollinger Bands
    bollinger = BollingerBands(close=df['close'], window=20, window_dev=2)
    df['BB_high'] = bollinger.bollinger_hband()
    df['BB_mid'] = bollinger.bollinger_mavg()
    df['BB_low'] = bollinger.bollinger_lband()
    df['BB_width'] = df['BB_high'] - df['BB_low']
    df['BB_position'] = (df['close'] - df['BB_low']) / (df['BB_high'] - df['BB_low'])
    
    # 4. EMA (Exponential Moving Average)
    ema_12 = EMAIndicator(close=df['close'], window=12)
    ema_26 = EMAIndicator(close=df['close'], window=26)
    df['EMA_12'] = ema_12.ema_indicator()
    df['EMA_26'] = ema_26.ema_indicator()
    
    # 5. Volume indicators
    df['volume_sma'] = df['volume'].rolling(window=20).mean()
    df['volume_ratio'] = df['volume'] / df['volume_sma']
    
    # VWAP (Volume Weighted Average Price)
    if 'high' in df.columns and 'low' in df.columns:
        vwap = VolumeWeightedAveragePrice(
            high=df['high'], 
            low=df['low'], 
            close=df['close'], 
            volume=df['volume']
        )
        df['VWAP'] = vwap.volume_weighted_average_price()
    
    # 6. Price momentum
    df['momentum_1d'] = df['close'].pct_change(1)
    df['momentum_5d'] = df['close'].pct_change(5)
    df['momentum_10d'] = df['close'].pct_change(10)
    
    # 7. Simple Moving Averages (giữ lại từ model cũ)
    df['SMA5'] = df['close'].rolling(window=5).mean()
    df['SMA20'] = df['close'].rolling(window=20).mean()
    df['SMA50'] = df['close'].rolling(window=50).mean()
    
    return df


def add_financial_ratios(df, symbol, vnstock):
    """
    Thêm các chỉ số tài chính từ vnstock
    
    Args:
        df: DataFrame
        symbol: Mã cổ phiếu
        vnstock: vnstock module
        
    Returns:
        DataFrame với financial ratios
    """
    try:
        # Sử dụng vnstock để lấy financial ratios
        from vnstock import Company
        company = Company(symbol=symbol, source='VCI')
        
        # Lấy financial ratios
        ratios = company.finance.ratio()
        
        if not ratios.empty:
            # Lấy ratios mới nhất
            latest_ratios = ratios.iloc[-1]
            
            # Thêm vào DataFrame (broadcast cho tất cả rows)
            if 'eps' in latest_ratios:
                df['EPS'] = latest_ratios['eps']
            if 'pe' in latest_ratios:
                df['PE'] = latest_ratios['pe']
            if 'pb' in latest_ratios:
                df['PB'] = latest_ratios['pb']
            if 'roe' in latest_ratios:
                df['ROE'] = latest_ratios['roe']
            if 'roa' in latest_ratios:
                df['ROA'] = latest_ratios['roa']
                
        log("✓ Financial ratios added successfully")
        
    except Exception as e:
        log(f"⚠ Could not fetch financial ratios: {e}")
        # Add default values if fetch fails
        df['EPS'] = 0
        df['PE'] = 0
        df['PB'] = 0
        df['ROE'] = 0
        df['ROA'] = 0
    
    return df


def get_usd_vnd_rate(cache_hours: int = 24) -> float:
    """
    Lấy tỷ giá USD/VND từ open.er-api.com với cơ chế cache
    """
    cache_dir = "ai/.cache"
    os.makedirs(cache_dir, exist_ok=True)
    cache_file = os.path.join(cache_dir, "usd_vnd_rate.json")
    
    # 1. Kiểm tra cache
    if os.path.exists(cache_file):
        try:
            with open(cache_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            cached_time = data.get('timestamp', 0)
            if time.time() - cached_time < cache_hours * 3600:
                rate = data.get('rate')
                log(f"   ✓ Using cached USD/VND rate: {rate:,.0f} (age: {(time.time() - cached_time)/3600:.1f}h)")
                return float(rate)
        except Exception as e:
            log(f"   ⚠ Cache read error: {e}")

    # 2. Fetch mới từ API
    log("   🌐 Fetching latest USD/VND rate from API...")
    try:
        url = "https://open.er-api.com/v6/latest/USD"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            result = response.json()
            rate = result.get('rates', {}).get('VND')
            
            if rate:
                # Lưu vào cache
                with open(cache_file, 'w', encoding='utf-8') as f:
                    json.dump({
                        'rate': rate,
                        'timestamp': time.time(),
                        'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    }, f, indent=2)
                
                log(f"   ✓ New USD/VND rate fetched: {rate:,.0f}")
                return float(rate)
        
        log(f"   ⚠ API returned status code {response.status_code}")
    except Exception as e:
        log(f"   ⚠ Error fetching exchange rate: {e}")

    # 3. Fallback
    fallback_rate = 25400  # Cập nhật giá trị gần nhất thay vì 24000
    log(f"   ⚠ Using fallback USD/VND rate: {fallback_rate:,.0f}")
    return float(fallback_rate)


def add_macro_data(df, start_date, end_date, vnstock):
    """
    Thêm dữ liệu vĩ mô (VN-Index, tỷ giá)
    
    Args:
        df: DataFrame
        start_date: Ngày bắt đầu
        end_date: Ngày kết thúc
        vnstock: vnstock module
        
    Returns:
        DataFrame với macro data
    """
    try:
        # Lấy VN-Index data
        from vnstock import Quote
        vnindex = Quote(symbol='VNINDEX', source='VCI')
        vnindex_data = vnindex.history(start=start_date, end=end_date, interval='1D')
        
        if not vnindex_data.empty:
            # Merge VN-Index vào df chính
            vnindex_data = vnindex_data[['time', 'close']].rename(columns={'close': 'VNINDEX'})
            df = pd.merge(df, vnindex_data, on='time', how='left')
            df['VNINDEX'] = df['VNINDEX'].fillna(method='ffill').fillna(method='bfill')
            
            log("✓ VN-Index data added successfully")
        
    except Exception as e:
        log(f"⚠ Could not fetch VN-Index: {e}")
        df['VNINDEX'] = df['close'].mean()  # Default to average price
    
    # Tỷ giá USD/VND - sử dụng API thực tế
    try:
        usd_vnd = get_usd_vnd_rate()
        df['USD_VND'] = usd_vnd
    except Exception as e:
        log(f"   ⚠ Exchange rate processing error: {e}")
        df['USD_VND'] = 25400
    
    return df


def add_market_sentiment(df, symbol):
    """
    Thêm sentiment analysis từ tin tức
    Sử dụng news scraper để crawl và phân tích tin tức thực tế
    """
    try:
        from news_scraper import get_stock_sentiment_score
        
        # Get real sentiment score (cached for 24 hours)
        sentiment = get_stock_sentiment_score(symbol, cache_hours=24)
        df['news_sentiment'] = sentiment
        
        # Print sentiment interpretation
        if sentiment < 0.4:
            mood = "📉 Tiêu cực"
        elif sentiment > 0.6:
            mood = "📈 Tích cực"
        else:
            mood = "😐 Trung lập"
        
        log(f"✓ News sentiment: {sentiment:.3f} {mood}")
        
    except Exception as e:
        log(f"⚠ Could not fetch news sentiment: {e}")
        log("  Using neutral sentiment fallback")
        df['news_sentiment'] = 0.5  # Neutral fallback
    
    return df


def prepare_features(df, symbol, start_date, end_date, vnstock):
    """
    Pipeline hoàn chỉnh để chuẩn bị tất cả features
    
    Args:
        df: Raw DataFrame từ vnstock
        symbol: Mã cổ phiếu
        start_date: Ngày bắt đầu
        end_date: Ngày kết thúc
        vnstock: vnstock module
        
    Returns:
        DataFrame với tất cả features
    """
    log("\n📊 Adding features...")
    
    # 1. Technical Indicators
    log("1️⃣ Calculating technical indicators...")
    df = add_technical_indicators(df)
    
    # 2. Financial Ratios
    log("2️⃣ Fetching financial ratios...")
    df = add_financial_ratios(df, symbol, vnstock)
    
    # 3. Macro Data
    log("3️⃣ Adding macro economic data...")
    df = add_macro_data(df, start_date, end_date, vnstock)
    
    # 4. Market Sentiment (placeholder)
    log("4️⃣ Adding market sentiment...")
    df = add_market_sentiment(df, symbol)
    
    # 5. Target variable (giá ngày mai)
    df['Target'] = df['close'].shift(-1)
    
    # 6. Drop NaN values
    initial_rows = len(df)
    df = df.dropna()
    dropped_rows = initial_rows - len(df)
    log(f"\n✓ Features prepared! Dropped {dropped_rows} rows with NaN values")
    log(f"✓ Total features: {len(df.columns) - 1} (excluding Target)")
    
    return df


def get_feature_columns(df):
    """
    Lấy danh sách các cột features (exclude time, Target)
    """
    exclude_cols = ['time', 'Target', 'open', 'high', 'low', 'volume']
    feature_cols = [col for col in df.columns if col not in exclude_cols]
    return feature_cols
