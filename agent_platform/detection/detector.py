"""
Anomaly Detection Subsystem (Two-Tier Approach: EWMA/MAD + Isolation Forest).
Reference: Part 7 of PS-61 Architecture Document.
"""

import math
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
from sklearn.ensemble import IsolationForest

class EWMATracker:
    def __init__(self, alpha: float = 0.3, z_threshold: float = 3.0, epsilon: float = 1e-4):
        self.alpha = alpha
        self.z_threshold = z_threshold
        self.epsilon = epsilon
        self.ewma: Optional[float] = None
        self.deviation: Optional[float] = None

    def update(self, value: float) -> Tuple[float, bool]:
        if self.ewma is None:
            self.ewma = value
            self.deviation = 0.0
            return 0.0, False

        diff = abs(value - self.ewma)
        # Exponentially weighted mean absolute deviation
        self.deviation = self.alpha * diff + (1.0 - self.alpha) * self.deviation
        self.ewma = self.alpha * value + (1.0 - self.alpha) * self.ewma

        z_like = diff / (self.deviation + self.epsilon)
        is_anomalous = bool(z_like > self.z_threshold)
        return round(float(z_like), 2), is_anomalous

class AnomalyDetector:
    FEATURE_NAMES = [
        "rps",
        "error_4xx_rate",
        "error_5xx_rate",
        "p95_latency_ms",
        "distinct_ips",
        "path_entropy",
        "failed_logins",
        "new_template_count",
    ]

    def __init__(self, z_threshold: float = 3.0, contamination: float = 0.03):
        self.z_threshold = z_threshold
        self.contamination = contamination
        # Tier 1: EWMA trackers for each feature
        self.trackers: Dict[str, EWMATracker] = {
            f: EWMATracker(alpha=0.3, z_threshold=z_threshold) for f in self.FEATURE_NAMES
        }
        # IP-specific failed login counters
        self.ip_failed_logins: Dict[str, int] = {}
        # Tier 2: Isolation Forest
        self.iforest: Optional[IsolationForest] = None
        self.is_trained = False
        self.training_buffer: List[List[float]] = []

        # Load persisted baseline model if available
        model_file = Path(__file__).resolve().parent / "models" / "isolation_forest_baseline.joblib"
        if model_file.exists():
            try:
                import joblib
                self.iforest = joblib.load(model_file)
                self.is_trained = True
            except Exception:
                pass

    def fit_baseline(self, baseline_matrix: List[List[float]]):
        """Fit Isolation Forest on clean baseline feature vectors."""
        if len(baseline_matrix) >= 10:
            X = np.array(baseline_matrix)
            self.iforest = IsolationForest(
                n_estimators=100,
                contamination=self.contamination,
                random_state=42
            )
            self.iforest.fit(X)
            self.is_trained = True

    def detect_window(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Evaluate a single time window's feature dict across both Tier 1 and Tier 2.
        """
        tier1_flags = {}
        max_z_score = 0.0
        flagged_features = []

        # Tier 1: Statistical evaluation
        for name in self.FEATURE_NAMES:
            val = float(features.get(name, 0.0))
            z_score, is_flagged = self.trackers[name].update(val)
            tier1_flags[name] = {"z_score": z_score, "flagged": is_flagged}
            if z_score > max_z_score:
                max_z_score = z_score
            if is_flagged:
                flagged_features.append(name)

        tier1_anomalous = len(flagged_features) > 0

        # Tier 2: Isolation Forest evaluation
        feature_vector = [float(features.get(f, 0.0)) for f in self.FEATURE_NAMES]
        tier2_anomalous = False
        iforest_score = 0.0

        if self.is_trained and self.iforest is not None:
            X_new = np.array([feature_vector])
            pred = self.iforest.predict(X_new)[0]  # -1 for outlier, 1 for inlier
            iforest_score = float(self.iforest.decision_function(X_new)[0])
            tier2_anomalous = bool(pred == -1)
        else:
            # Accumulate into training buffer until baseline is ready
            self.training_buffer.append(feature_vector)
            if len(self.training_buffer) >= 15:
                self.fit_baseline(self.training_buffer)

        # Combined signal
        is_anomaly = tier1_anomalous or tier2_anomalous

        reasons = []
        if tier1_anomalous:
            reasons.append(f"Tier 1 (EWMA) flagged features: {', '.join(flagged_features)} (max z-score: {max_z_score})")
        if tier2_anomalous:
            reasons.append(f"Tier 2 (Isolation Forest) flagged multivariate anomaly (score: {round(iforest_score, 3)})")

        return {
            "is_anomaly": is_anomaly,
            "tier1_flagged": tier1_anomalous,
            "tier2_flagged": tier2_anomalous,
            "flagged_features": flagged_features,
            "max_z_score": max_z_score,
            "iforest_score": round(iforest_score, 4),
            "reason": "; ".join(reasons) if reasons else "Normal baseline traffic"
        }
