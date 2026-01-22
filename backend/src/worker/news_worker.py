import sys
import os
import json

# Add project root and ai folder to path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "../../.."))
sys.path.append(project_root)
sys.path.append(os.path.join(project_root, "ai"))

from ai.news_scraper import get_news_data

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No symbol provided"}))
        return

    symbol = sys.argv[1].upper()
    result = get_news_data(symbol)
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()
