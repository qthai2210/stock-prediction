import sys
import time
print("Starting script...")
print(f"Python version: {sys.version}")
time.sleep(1)
try:
    print("Importing vnstock...")
    import vnstock
    print("vnstock version:", vnstock.__version__)
except Exception as e:
    print(f"Failed to import vnstock: {e}")
