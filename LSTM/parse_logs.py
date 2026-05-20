import re
import csv
from datetime import datetime
from collections import defaultdict

SUSPICIOUS_CHARS = ["'", "<", ">", "--", "DROP", "SELECT", "UNION", "INSERT", "passwd", "etc/", "cmd=", "exec="]

KNOWN_PATHS = ["/", "/assets/index-DQ0ebBmb.js", "/favicon.ico", "/robots.txt"]

def has_suspicious(path):
    for char in SUSPICIOUS_CHARS:
        if char.lower() in path.lower():
            return 1
    return 0

def is_known(path):
    return 1 if path in KNOWN_PATHS else 0

def parse_line(line):
    access_pattern = r'(\d+\.\d+\.\d+\.\d+) - - \[(.+?)\] "(\w+) (.+?) HTTP/\d\.\d" (\d+) (\d+)'
    match = re.match(access_pattern, line)
    
    if match:
        ip = match.group(1)
        time_str = match.group(2)
        method = match.group(3)
        path = match.group(4)
        status = int(match.group(5))
        size = int(match.group(6))
        
        time_str = time_str.split(" ")[0]
        timestamp = datetime.strptime(time_str, "%d/%b/%Y:%H:%M:%S")
        
        if "[label=anomaly]" in line:
            label = 2
        elif "[label=grey]" in line:
            label = 1
        else:
            label = 0
        
        return {
            "timestamp": timestamp,
            "ip": ip,
            "method": method,
            "path": path,
            "status_code": status,
            "response_size": size,
            "has_suspicious_chars": has_suspicious(path),
            "is_known_path": is_known(path),
            "label": label
        }
    return None

print("Reading logs...")
logs = []
with open(r"C:\Users\Emilija\dataset_v2.txt", "r", encoding="utf-8") as f:
    for line in f:
        parsed = parse_line(line.strip())
        if parsed:
            logs.append(parsed)

print(f"Parsed {len(logs)} lines")

print("Calculating requests per second...")
requests_per_second = defaultdict(int)
for log in logs:
    second_key = log["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
    requests_per_second[second_key] += 1

for log in logs:
    second_key = log["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
    log["requests_per_second"] = requests_per_second[second_key]

print("Saving to CSV...")
with open(r"C:\Users\Emilija\dataset_v2.csv", "w", newline="", encoding="utf-8", errors="replace") as f:
    fieldnames = [
        "timestamp",
        "ip",
        "method",
        "status_code",
        "response_size",
        "requests_per_second",
        "has_suspicious_chars",
        "is_known_path",
        "label"
    ]
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    
    for log in logs:
        writer.writerow({
            "timestamp": log["timestamp"].strftime("%Y-%m-%d %H:%M:%S"),
            "ip": log["ip"],
            "method": log["method"],
            "status_code": log["status_code"],
            "response_size": log["response_size"],
            "requests_per_second": log["requests_per_second"],
            "has_suspicious_chars": log["has_suspicious_chars"],
            "is_known_path": log["is_known_path"],
            "label": log["label"]
        })

print(f"Done! Saved {len(logs)} rows to dataset_v2.csv")