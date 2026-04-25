import sys
import os
import requests
import pandas as pd
from datetime import datetime, timedelta

# Avoid complex imports that might cause deadlocks
import vnstock
from feature_engineering import add_technical_indicators

def backtest_strategy(symbol='VCB', days=100):
    print(f"🔍 Đang tiến hành Backtest cho {symbol} trong {days} ngày qua...")
    
    # 1. Lấy dữ liệu
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=days+60)).strftime('%Y-%m-%d')
    quote = vnstock.Quote(symbol=symbol, source='VCI')
    df = quote.history(start=start_date, end=end_date, interval='1D')
    
    if df.empty:
        print("❌ Không có dữ liệu để backtest")
        return

    # 2. Tính toán chỉ báo
    df = add_technical_indicators(df)
    df = df.dropna()
    
    # 3. Định nghĩa các chiến lược (Logic giống hệt SignalService trong NestJS)
    strategies = {
        'OPTIMIZED_BOUNCE': {
            'signals': [], 'profits': [],
            'check': lambda r: 'BUY' if r['RSI'] < 40 and r['MACD'] > r['MACD_signal'] and r['volume_ratio'] > 1.2 else 'HOLD'
        },
        'AI_TREND': { # Giả lập AI Trend dựa trên momentum thực tế (vì không backtrack được AI prediction từng ngày cũ)
            'signals': [], 'profits': [],
            'check': lambda r: 'BUY' if r['momentum_5d'] > 0.05 and r['volume_ratio'] > 1.3 else 'HOLD'
        },
        'VN_EXTREME_RSI': {
            'signals': [], 'profits': [],
            'check': lambda r: 'BUY' if r['RSI'] < 25 and r['volume_ratio'] > 1.5 else 'HOLD'
        },
        'SMART_BB_BREAKOUT': {
            'signals': [], 'profits': [],
            'check': lambda r: 'BUY' if r['close'] > r['BB_high'] and r['volume_ratio'] > 1.6 else 'HOLD'
        },
        'TREND_CONFIRMATION': {
            'signals': [], 'profits': [],
            'check': lambda r: 'BUY' if r['EMA_12'] > r['EMA_26'] and r['SMA20'] > r['SMA50'] else 'HOLD'
        }
    }

    # 4. Chạy mô phỏng (Giả định giữ lệnh 3 ngày sau khi có tín hiệu BUY)
    HOLD_DAYS = 3
    for name, config in strategies.items():
        for i in range(len(df) - HOLD_DAYS):
            row = df.iloc[i]
            signal = config['check'](row)
            
            if signal == 'BUY':
                entry_price = df.iloc[i]['close']
                exit_price = df.iloc[i + HOLD_DAYS]['close']
                profit = ((exit_price - entry_price) / entry_price) * 100
                config['signals'].append(signal)
                config['profits'].append(profit)

    # 5. In kết quả
    print("\n" + "="*70)
    print(f"{'CHIẾN LƯỢC':<25} | {'SỐ LỆNH':<10} | {'TỶ LỆ THẮNG':<12} | {'LN TB (%)':<10}")
    print("-" * 70)
    
    for name, config in strategies.items():
        profits = config['profits']
        if not profits:
            print(f"{name:<25} | {'0':<10} | {'0%':<12} | {'0.00':<10}")
            continue
            
        win_rate = (len([p for p in profits if p > 0]) / len(profits)) * 100
        avg_profit = sum(profits) / len(profits)
        
        print(f"{name:<25} | {len(profits):<10} | {win_rate:>10.2f}% | {avg_profit:>8.2f}%")
    
    print("="*70)
    print("💡 Lưu ý: Backtest giả định giữ lệnh trong 3 ngày và chưa tính phí giao dịch.")

if __name__ == "__main__":
    symbol = sys.argv[1] if len(sys.argv) > 1 else 'VCB'
    backtest_strategy(symbol)
