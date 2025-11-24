
import sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]  # .../backend
p = str(ROOT)
if p not in sys.path:
    sys.path.insert(0, p)
