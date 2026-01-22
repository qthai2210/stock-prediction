"""
News Sentiment Analyzer for Vietnamese Stocks
Scrapes news from financial websites and analyzes sentiment
"""

import os
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Optional
import warnings
import sys
warnings.filterwarnings('ignore')

# Custom logger to stderr
def log(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

# Lazy imports
def get_libs():
    import requests
    from bs4 import BeautifulSoup
    from textblob import TextBlob
    try:
        from googletrans import Translator
        translator = Translator()
    except:
        translator = None
    return requests, BeautifulSoup, TextBlob, translator

# Cache directory
CACHE_DIR = "ai/.cache"
os.makedirs(CACHE_DIR, exist_ok=True)


def get_cache_filename(symbol: str) -> str:
    """Get cache filename for a symbol"""
    return os.path.join(CACHE_DIR, f"sentiment_{symbol}.json")


def load_cached_sentiment(symbol: str, max_age_hours: int = 24) -> Optional[float]:
    """Load sentiment from cache if fresh enough"""
    cache_file = get_cache_filename(symbol)
    
    if not os.path.exists(cache_file):
        return None
    
    try:
        with open(cache_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check if cache is still fresh
        cached_time = datetime.fromisoformat(data['timestamp'])
        age = datetime.now() - cached_time
        
        if age.total_seconds() < max_age_hours * 3600:
            log(f"   ✓ Using cached sentiment (age: {age.total_seconds()/3600:.1f}h)")
            return data['sentiment']
    except Exception as e:
        log(f"   ⚠ Cache read error: {e}")
    
    return None


def save_sentiment_cache(symbol: str, sentiment: float, headlines: list = None):
    """Save sentiment to cache"""
    cache_file = get_cache_filename(symbol)
    
    data = {
        'symbol': symbol,
        'sentiment': sentiment,
        'timestamp': datetime.now().isoformat(),
        'headlines': headlines[:5] if headlines else []  # Save top 5
    }
    
    try:
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        log(f"   ⚠ Cache write error: {e}")


def scrape_cafef_headlines(symbol: str, max_headlines: int = 5) -> list:
    """
    Scrape headlines from CafeF
    Note: This is a simplified version. Real implementation may need adjustments
    based on website structure.
    """
    requests, BeautifulSoup, _, _ = get_libs()
    headlines = []
    
    try:
        # Search URL for the symbol
        search_url = f"https://cafef.vn/tim-kiem/{symbol}.chn"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(search_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find headlines - adjust selector based on actual site structure
            title_tags = soup.find_all(['h3', 'h4', 'a'], class_=['title', 'news-title'], limit=max_headlines)
            
            for tag in title_tags:
                text = tag.get_text().strip()
                if text and len(text) > 10:  # Minimum length
                    headlines.append(text)
        
        # Rate limiting
        time.sleep(1)
        
    except Exception as e:
        log(f"   ⚠ CafeF scraping error: {e}")
    
    return headlines


def scrape_vnexpress_headlines(symbol: str, max_headlines: int = 5) -> list:
    """
    Scrape headlines from VnExpress Financial section
    """
    requests, BeautifulSoup, _, _ = get_libs()
    headlines = []
    
    try:
        search_url = f"https://vnexpress.net/tim-kiem?q={symbol}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(search_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find headlines
            title_tags = soup.find_all(['h3', 'h2'], class_='title-news', limit=max_headlines)
            
            for tag in title_tags:
                text = tag.get_text().strip()
                if text and len(text) > 10:
                    headlines.append(text)
        
        time.sleep(1)
        
    except Exception as e:
        log(f"   ⚠ VnExpress scraping error: {e}")
    
    return headlines


def analyze_sentiment_vietnamese(text: str) -> float:
    """
    Analyze sentiment of Vietnamese text
    Returns value between 0 (negative) and 1 (positive)
    """
    _, _, TextBlob, translator = get_libs()
    
    if not text:
        return 0.5
    
    try:
        # Try to translate to English for better sentiment analysis
        if translator:
            try:
                translated = translator.translate(text, src='vi', dest='en')
                text_to_analyze = translated.text
            except:
                # If translation fails, use original (may be less accurate)
                text_to_analyze = text
        else:
            text_to_analyze = text
        
        # Analyze sentiment using TextBlob
        blob = TextBlob(text_to_analyze)
        polarity = blob.sentiment.polarity  # -1 to 1
        
        # Convert to 0-1 scale
        sentiment = (polarity + 1) / 2
        
        return sentiment
        
    except Exception as e:
        log(f"   ⚠ Sentiment analysis error: {e}")
        return 0.5  # Neutral on error


def get_stock_sentiment_score(symbol: str, cache_hours: int = 24, max_headlines: int = 10) -> float:
    """
    Get sentiment score for a stock symbol
    
    Args:
        symbol: Stock symbol (e.g., 'VCB')
        cache_hours: How long to cache results (default 24 hours)
        max_headlines: Maximum number of headlines to analyze
    
    Returns:
        Sentiment score between 0 (negative) and 1 (positive)
    """
    # Check cache first
    cached = load_cached_sentiment(symbol, cache_hours)
    if cached is not None:
        return cached
    
    log(f"   📰 Scraping news for {symbol}...")
    
    # Scrape headlines from multiple sources
    all_headlines = []
    
    # Try CafeF
    cafef_headlines = scrape_cafef_headlines(symbol, max_headlines // 2)
    all_headlines.extend(cafef_headlines)
    
    # Try VnExpress
    vnexpress_headlines = scrape_vnexpress_headlines(symbol, max_headlines // 2)
    all_headlines.extend(vnexpress_headlines)
    
    if not all_headlines:
        log(f"   ⚠ No headlines found for {symbol}, using neutral sentiment")
        sentiment = 0.5
        save_sentiment_cache(symbol, sentiment, [])
        return sentiment
    
    log(f"   ✓ Found {len(all_headlines)} headlines")
    
    # Analyze sentiment of each headline
    sentiments = []
    for headline in all_headlines[:max_headlines]:
        sent = analyze_sentiment_vietnamese(headline)
        sentiments.append(sent)
    
    # Average sentiment
    if sentiments:
        avg_sentiment = sum(sentiments) / len(sentiments)
    else:
        avg_sentiment = 0.5
    
    # Save to cache
    save_sentiment_cache(symbol, avg_sentiment, all_headlines)
    
    log(f"   ✓ Sentiment score: {avg_sentiment:.3f}")
    
    log(f"   ✓ Sentiment score: {avg_sentiment:.3f}")
    
    return avg_sentiment


def get_news_data(symbol: str) -> Dict:
    """
    Get full news data including sentiment and headlines for Backend
    """
    try:
        # Check cache first
        cache_file = get_cache_filename(symbol)
        if os.path.exists(cache_file):
            with open(cache_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Check freshness (e.g. 12 hours)
            cached_time = datetime.fromisoformat(data['timestamp'])
            if (datetime.now() - cached_time).total_seconds() < 12 * 3600:
                return data
        
        # Scrape fresh if no cache or stale
        all_headlines = []
        all_headlines.extend(scrape_cafef_headlines(symbol, 5))
        all_headlines.extend(scrape_vnexpress_headlines(symbol, 5))
        
        sentiment = 0.5
        if all_headlines:
            sentiments = [analyze_sentiment_vietnamese(h) for h in all_headlines]
            sentiment = sum(sentiments) / len(sentiments)
            
        result = {
            "symbol": symbol,
            "sentiment": sentiment,
            "timestamp": datetime.now().isoformat(),
            "headlines": all_headlines
        }
        
        # Save to cache
        save_sentiment_cache(symbol, sentiment, all_headlines)
        return result
        
    except Exception as e:
        return {"error": str(e)}


def test_scraper():
    """Test the news scraper"""
    log("\n" + "="*60)
    log("Testing News Sentiment Scraper")
    log("="*60)
    
    test_symbols = ['VCB', 'HPG', 'FPT']
    
    for symbol in test_symbols:
        log(f"\n🔍 Testing {symbol}:")
        sentiment = get_stock_sentiment_score(symbol, cache_hours=0)  # Force fresh
        
        if sentiment < 0.4:
            mood = "📉 Negative"
        elif sentiment > 0.6:
            mood = "📈 Positive"
        else:
            mood = "😐 Neutral"
        
        log(f"   Result: {sentiment:.3f} {mood}")


if __name__ == "__main__":
    test_scraper()
