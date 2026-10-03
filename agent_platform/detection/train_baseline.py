"""
Pre-training & Baseline Calibration Script.
Simulates a clean period of normal user traffic, extracts feature vectors,
and pre-trains the Isolation Forest model so the detector is primed from second 1.
Reference: Part 7.4 of PS-61 Architecture Document.
"""

import os
import time
import random
import requests
import joblib
import numpy as np
from pathlib import Path
from sklearn.ensemble import IsolationForest

MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_FILE = MODEL_DIR / "isolation_forest_baseline.joblib"

VICTIM_URL = "http://127.0.0.1:8000"

def generate_synthetic_baseline(num_windows: int = 60) -> np.ndarray:
    """
    Synthesizes normal operation feature vectors:
    - rps: 2.0 - 6.0
    - error_4xx_rate: 0.0 - 0.05
    - error_5xx_rate: 0.0 - 0.01
    - p95_latency_ms: 10.0 - 45.0
    - distinct_ips: 3 - 6
    - path_entropy: 3 - 5
    - failed_logins: 0 - 2
    - new_template_count: 0 - 1
    """
    matrix = []
    for _ in range(num_windows):
        row = [
            random.uniform(2.0, 6.0),         # rps
            random.uniform(0.0, 0.04),        # error_4xx_rate
            random.uniform(0.0, 0.01),        # error_5xx_rate
            random.uniform(12.0, 40.0),       # p95_latency_ms
            random.randint(3, 6),             # distinct_ips
            random.randint(3, 5),             # path_entropy
            random.randint(0, 1),             # failed_logins
            0.0 if random.random() > 0.1 else 1.0  # new_template_count
        ]
        matrix.append(row)
    return np.array(matrix)

def train_and_save_baseline():
    print("[*] Generating clean baseline traffic distribution...")
    X_baseline = generate_synthetic_baseline(num_windows=100)
    print(f"[*] Training Isolation Forest on {len(X_baseline)} clean baseline windows...")

    clf = IsolationForest(
        n_estimators=150,
        contamination=0.02,
        random_state=42
    )
    clf.fit(X_baseline)

    joblib.dump(clf, MODEL_FILE)
    print(f"[+] Successfully trained & persisted model to: {MODEL_FILE}")

if __name__ == "__main__":
    train_and_save_baseline()
