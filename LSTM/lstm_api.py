from fastapi import FastAPI
import numpy as np
import pickle
import re
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input
from pydantic import BaseModel

app = FastAPI()

model = Sequential([
    Input(shape=(10, 6)),
    LSTM(64, return_sequences=True),
    Dropout(0.2),
    LSTM(32, return_sequences=False),
    Dropout(0.2),
    Dense(16, activation="relu"),
    Dense(1, activation="sigmoid")
])
model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])

model.load_weights("lstm_weights.weights.h5")

with open("scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

KNOWN_PATHS = ["/", "/assets/index-DQ0ebBmb.js", "/favicon.ico", "/robots.txt"]
SUSPICIOUS_CHARS = ["'", "<", ">", "--", "DROP", "SELECT", "passwd", "cmd="]
TIMESTEPS = 10

class LogRequest(BaseModel):
    logs: str

def parse_line(line):
    pattern = r'(\d+\.\d+\.\d+\.\d+) - - \[(.+?)\] "(\w+) (.+?) HTTP/\d\.\d" (\d+) (\d+)'
    match = re.match(pattern, line)
    if match:
        path = match.group(4)
        status = int(match.group(5))
        size = int(match.group(6))
        suspicious = 1 if any(c.lower() in path.lower() for c in SUSPICIOUS_CHARS) else 0
        known = 1 if path in KNOWN_PATHS else 0
        return [0, status, size, 1, suspicious, known]
    return None

@app.post("/analyze")
async def analyze(request: LogRequest):
    lines = [l for l in request.logs.split("\n") if l.strip()]
    features = [parse_line(l) for l in lines if parse_line(l)]
    
    if len(features) < TIMESTEPS:
        return {"result": "INSUFFICIENT_DATA", "lines": len(features)}
    
    X = np.array(features[-TIMESTEPS:]).reshape(1, TIMESTEPS, 6)
    X_scaled = scaler.transform(X.reshape(-1, 6)).reshape(1, TIMESTEPS, 6)
    pred = model.predict(X_scaled)[0][0]
    result = "ANOMALY" if pred > 0.5 else "NORMAL"
    
    return {"result": result, "confidence": float(pred), "lines_analyzed": len(features)}