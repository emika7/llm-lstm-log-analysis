# Kubernetes Log Monitoring System

An AI-powered Kubernetes cluster monitoring system that combines a Large Language Model (LLM) and a Long Short-Term Memory (LSTM) neural network to continuously analyse application logs for health assessment and security anomaly detection.

## Repository Structure

## Components

### `/app` – Monitoring Backend
The main running system. A NestJS backend application that:
- Connects to a Kubernetes cluster via `kubectl proxy`
- Retrieves pod logs periodically every 2 minutes
- Forwards logs to the LLM service for health assessment (HEALTHY/UNHEALTHY)
- Forwards logs to the LSTM service for security anomaly detection (NORMAL/ANOMALY)
- Exposes results via a REST API

### `/LSTM` – LSTM Model and Dataset
Contains everything related to the LSTM security anomaly detection model:
- Training dataset of labelled Nginx access logs (normal, grey zone, anomalous)
- Python scripts for dataset parsing and preparation
- Trained model weights and fitted scaler
- FastAPI inference microservice (`lstm_api.py`)
- Google Colab notebook for model training

### `/k6-scripts` – Traffic Generation
k6 load testing scripts used to generate synthetic HTTP traffic for dataset construction:
- `normal-traffic.js` – normal user browsing behaviour (30 VUs)
- `grey-traffic.js` – mixed normal and mildly suspicious traffic (40 VUs)
- `anomaly-traffic.js` – DDoS, directory scanning, and malicious request simulation

### `/llm dataset` – LLM Evaluation Dataset
Datasets used for comparing and evaluating Large Language Model performance on log classification tasks. (the only one missing is parsed dataset, but it was too big to commit)

### `/llm model results` – LLM Model Results
Evaluation results and classification metrics from LLM model comparison experiments, including results from Qwen 2.5, Mistral, and LLaMA models.

### `/llm scripts` – LLM Testing Scripts
Python scripts used for LLM model testing and comparison, including prompt engineering and structured output parsing.

## Prerequisites

- Node.js v20+
- Python 3.10+
- Docker Desktop
- Minikube
- kubectl
- LM Studio (for local LLM inference)
- k6 (for traffic generation)

## Setup and Running

### 1. Start Minikube
```bash
minikube start --driver=docker
```

### 2. Deploy weather-app to Minikube
```bash
kubectl apply -f weather-app-deployment.yaml
kubectl get pods
```

### 3. Start kubectl proxy
```bash
kubectl proxy --port=8001 --address=0.0.0.0 --accept-hosts=.*
```

### 4. Start LSTM inference service
```bash
cd LSTM
pip install fastapi uvicorn tensorflow scikit-learn
uvicorn lstm_api:app --host 0.0.0.0 --port 8002
```

### 5. Start LM Studio
- Open LM Studio
- Load the Qwen 2.5 7B Instruct model
- Start the local server on port 1234

### 6. Configure environment variables
Create a `.env` file in the `/app` directory:
