import pandas as pd

INPUT_FILE = "llm dataset/parsed_dataset.csv"
OUTPUT_FILE = "llm dataset/llm_test_900.csv"

TARGET_NORMAL = 60
TARGET_ANOMALY = 40

def prepare_mini_dataset(input_path, output_path):
    df = pd.read_csv(input_path)
    
    anomalies = df[df["Label"] == "Anomaly"]
    normal = df[df["Label"] == "Normal"]
    
    if len(anomalies) < TARGET_ANOMALY or len(normal) < TARGET_NORMAL:
        print(f"Klaida: Nepakanka duomenų! Turime {len(anomalies)} anom. ir {len(normal)} norm.")
        return

    anomalies_sample = anomalies.sample(n=TARGET_ANOMALY, random_state=123)
    normal_sample = normal.sample(n=TARGET_NORMAL, random_state=123)
    
    final_df = pd.concat([anomalies_sample, normal_sample]).sample(frac=1, random_state=123)
    
    final_df.to_csv(output_path, index=False)
    
    print("-" * 30)
    print(f"Sėkmingai paruoštas mini rinkinys: {output_path}")
    print(f"Sudėtis: {TARGET_ANOMALY} Anom. + {TARGET_NORMAL} Norm. (Viso: 100)")

prepare_mini_dataset(INPUT_FILE, OUTPUT_FILE)