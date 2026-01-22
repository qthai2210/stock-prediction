import sys
import os
import json

# Thêm thư mục gốc và thư mục ai vào path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "../../.."))
sys.path.append(project_root)
sys.path.append(os.path.join(project_root, "ai"))

# Imports inside main to prevent premature stderr pollution or stdout leaks
# from ai.predict import get_prediction_data, get_market_overview

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No symbol provided"}))
        return

    symbol = sys.argv[1].upper()
    
    # Save original stdout fd to restore it later
    original_stdout_fd = os.dup(sys.stdout.fileno())
    
    try:
        # Redirect stdout (fd 1) to stderr (fd 2) for ALL low-level output
        os.dup2(sys.stderr.fileno(), 1)
        
        if symbol == 'MARKET':
            from ai.predict import get_market_overview
            result = get_market_overview()
        else:
            from ai.predict import get_prediction_data
            result = get_prediction_data(symbol)
            
        # Restore original stdout to print the final JSON
        os.dup2(original_stdout_fd, 1)
        
        # Now print exactly one JSON object
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        # Restore stdout in case of error
        os.dup2(original_stdout_fd, 1)
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
    finally:
        os.close(original_stdout_fd)

if __name__ == "__main__":
    main()
