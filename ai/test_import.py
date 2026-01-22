import sys
import os
from contextlib import redirect_stdout

print("START TEST")
with redirect_stdout(sys.stderr):
    import vnstock
    print("INSIDE REDIRECT")
print("END TEST")
