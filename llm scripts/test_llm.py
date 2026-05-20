import pandas as pd
import requests
import time
from sklearn.metrics import classification_report, confusion_matrix

API_URL = "http://localhost:1234/v1/chat/completions"
MODEL = "qwen2.5-7b-instruct"
# MODEL = "meta-llama-3.1-8b-instruct"
#MODEL = "meta-mistral-7b-instruct-v0.3"

INPUT_FILE = "dataset/llm_test_900.csv"
OUTPUT_FILE = "llm models results/qwen_results_final_900.csv"
# OUTPUT_FILE = "llm models results/llama_results_final_900.csv"
# OUTPUT_FILE = "llm models results/mistral_final_900.csv"

df = pd.read_csv(INPUT_FILE)

y_true = []
y_pred = []
results = []

print(f"Pradedamas testavimas su {len(df)} blokais...")

for i, row in df.iterrows():
    real_label = "HEALTHY" if row["Label"] == "Normal" else "UNHEALTHY"
    
    total_lines = row.get("TotalLines", "unknown")

    prompt = f"""
You are an expert Hadoop HDFS reliability engineer.

Analyze the following HDFS log sequence.

Important HDFS knowledge:
- Block replication is normal.
- PacketResponder termination is normal.
- invalidSet operations may be normal during replication cleanup.
- Block deletion alone is NOT an anomaly.
- addStoredBlock operations are normal.
- WARN messages alone do NOT necessarily indicate failure.

Classify as UNHEALTHY ONLY if you observe:
- IOException
- Exception while serving block
- Missing metadata
- Corrupted state
- Failed replication
- BlockInfo not found
- Repeated unrecoverable failures
- Inconsistent filesystem state
- Unexpected system behavior

Respond EXACTLY in this format:
CLASSIFICATION: HEALTHY or UNHEALTHY
REASON: one short sentence

Logs:
{row["Content"]}
"""


    try:
        response = requests.post(
            API_URL,
            json={
                "model": MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2
            },
            timeout=120
        )
        
        content = response.json()["choices"][0]["message"]["content"].strip().upper()
        
        if "UNHEALTHY" in content:
            predicted = "UNHEALTHY"
        elif "HEALTHY" in content:
            predicted = "HEALTHY"
        else:
            predicted = "UNKNOWN"

    except Exception as e:
        print(f"Klaida ties {row['BlockId']}: {e}")
        predicted = "ERROR"
        content = str(e)

    y_true.append(real_label)
    y_pred.append(predicted)

    results.append({
        "BlockId": row["BlockId"],
        "Real": real_label,
        "Predicted": predicted,
        "RawAnswer": content
    })

    if (i + 1) % 10 == 0:
        print(f"Progress: {i+1}/{len(df)} | Real: {real_label} | Predicted: {predicted}")
    
    time.sleep(0.1)

results_df = pd.DataFrame(results)
results_df.to_csv(OUTPUT_FILE, index=False)

print("\n--- FINAL RESULTS ---")
print("Confusion matrix:")
print(confusion_matrix(y_true, y_pred, labels=["HEALTHY", "UNHEALTHY"]))

print("\nClassification report:")
print(classification_report(y_true, y_pred))