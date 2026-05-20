import pandas as pd

INPUT_FILE = "llm dataset/parsed_dataset.csv"
OUTPUT_FILE = "llm dataset/llm_test_sample.csv"

df = pd.read_csv(INPUT_FILE)

normal = df[df["Label"] == "Normal"].sample(1000, random_state=42)
anomaly = df[df["Label"] == "Anomaly"].sample(100, random_state=42)

sample = pd.concat([normal, anomaly]).sample(frac=1, random_state=42)

sample.to_csv(OUTPUT_FILE, index=False)

print(f"Saved: {OUTPUT_FILE}")
print(sample["Label"].value_counts())