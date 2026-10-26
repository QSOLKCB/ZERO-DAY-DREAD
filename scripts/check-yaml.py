"""Development-only YAML 1.2 reader check; never shipped to the browser."""
import json
import subprocess
from pathlib import Path
from ruamel.yaml import YAML

parser = YAML(typ="safe", pure=True)
parser.version = (1, 2)
root = Path(__file__).resolve().parents[1]
result = subprocess.run(["node", str(root / "scripts/yaml-corpus.cjs")], check=True, capture_output=True, text=True, encoding="utf-8")
count = 0
for line in result.stdout.strip().split("\n"):
    item = json.loads(line)
    actual = parser.load(item["yaml"])
    assert actual == item["record"], (repr(item["record"]["seed"]), actual)
    count += 1
print(f"PASS: {count} complete generated records round-trip through ruamel.yaml in YAML 1.2 mode")
