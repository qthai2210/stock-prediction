import sys
import os

# Thêm thư mục hiện tại vào path để import feature_engineering
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from feature_engineering import get_usd_vnd_rate
    
    print("\n" + "="*50)
    print("🧪 TESTING EXCHANGE RATE API")
    print("="*50)
    
    # 1. Test fetch (có thể từ API hoặc cache)
    print("\n1. Testing get_usd_vnd_rate()...")
    rate = get_usd_vnd_rate()
    print(f"👉 Result: {rate:,.2f} VND")
    
    if 20000 < rate < 30000:
        print("✅ SUCCESS: Rate is within reasonable range.")
    else:
        print("❌ FAILURE: Rate is outside reasonable range.")
        
    # 2. Test cache verification
    cache_path = "ai/.cache/usd_vnd_rate.json"
    if os.path.exists(cache_path):
        print(f"✅ SUCCESS: Cache file exists at {cache_path}")
    else:
        print(f"❌ FAILURE: Cache file not found.")
        
    print("\n" + "="*50)
    print("✅ TEST COMPLETED")
    print("="*50 + "\n")

except Exception as e:
    print(f"❌ TEST FAILED with error: {e}")
    sys.exit(1)
