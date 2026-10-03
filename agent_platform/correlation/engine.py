"""
Correlation Engine, Incident Classifier, and Severity Scorer.
Reference: Parts 8 & 10 of AI Incident Response Architecture Document.
"""

import uuid
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

def compute_severity(
    blast_radius: float,          # 0.0 to 1.0 (fraction of endpoints/users affected)
    success_indicator: float,     # 0.0 or 1.0 (e.g., 200 OK after repeated 401s or data leak)
    service_criticality: float,    # 0.0 to 1.0 (auth=1.0, db=0.9, api=0.7, web=0.5)
    volume_ratio: float           # normalized anomaly magnitude ratio (0.0 to 1.0)
) -> Dict[str, Any]:
    """
    Transparent weighted sum formula:
    0.35 * blast_radius + 0.25 * success_indicator + 0.20 * criticality + 0.20 * volume
    """
    score = (
        0.35 * min(max(blast_radius, 0.0), 1.0)
        + 0.25 * min(max(success_indicator, 0.0), 1.0)
        + 0.20 * min(max(service_criticality, 0.0), 1.0)
        + 0.20 * min(max(volume_ratio, 0.0), 1.0)
    )
    score = round(score, 3)

    if score >= 0.80:
        level = "critical"
    elif score >= 0.60:
        level = "high"
    elif score >= 0.35:
        level = "medium"
    else:
        level = "low"

    return {
        "score": score,
        "level": level,
        "breakdown": {
            "blast_radius": blast_radius,
            "success_indicator": success_indicator,
            "service_criticality": service_criticality,
            "volume_ratio": volume_ratio
        }
    }

class IncidentClassifier:
    @staticmethod
    def classify(features: Dict[str, Any], raw_events: List[Dict[str, Any]]) -> str:
        """
        Explainable rule-based classification as specified in Section 10.1:
        - credential_stuffing vs brute_force
        - sqli_attempt
        - scanning
        - flood_or_dos
        - bad_deploy
        - resource_exhaustion
        """
        # Count distinct usernames and error codes from raw records
        users_attempted = set()
        paths_hit = set()
        has_sql_chars = False
        has_deploy_event = False

        sql_patterns = ["'", "--", "/*", "UNION", "SELECT", "OR 1=1", "SLEEP(", "BENCHMARK"]

        for ev in raw_events:
            fields = ev.get("fields", {})
            raw_text = ev.get("raw", "")
            if "user" in fields:
                users_attempted.add(fields["user"])
            if "path" in fields:
                paths_hit.add(fields["path"])
            if ev.get("source") == "deploy":
                has_deploy_event = True
            for pat in sql_patterns:
                if pat.lower() in raw_text.lower():
                    has_sql_chars = True
                    break

        failed_logins = features.get("failed_logins", 0)
        rps = features.get("rps", 0)
        err_5xx = features.get("error_5xx_rate", 0)
        distinct_ips = features.get("distinct_ips", 1)

        # 1. Credential Attacks (Failed Logins)
        if failed_logins >= 3:
            if len(users_attempted) > 3:
                return "credential_stuffing"
            else:
                return "brute_force"

        # 2. SQL Injection attempt
        if has_sql_chars or ("error_5xx_rate" in features and features.get("new_template_count", 0) > 2 and err_5xx > 0.2):
            return "sqli_attempt"

        # 3. Path / Directory Scanning
        if len(paths_hit) > 8 and features.get("error_4xx_rate", 0) > 0.4:
            return "scanning"

        # 4. Bad Deploy
        if has_deploy_event or (err_5xx > 0.3 and not has_sql_chars):
            return "bad_deploy"

        # 5. Flood / DoS
        if rps > 15:
            return "flood_or_dos"

        return "unknown"

class CorrelationEngine:
    def __init__(self, time_window_seconds: int = 60):
        self.time_window_seconds = time_window_seconds
        # In-memory window of recent raw log lines and anomaly signals
        self.recent_events: List[Dict[str, Any]] = []

    def add_event(self, event: Dict[str, Any]):
        self.recent_events.append(event)
        # Retain last 300 events in memory
        if len(self.recent_events) > 300:
            self.recent_events = self.recent_events[-300:]

    def build_incident_candidate(
        self,
        anomaly_summary: Dict[str, Any],
        features: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Groups recent anomalies, classifies the pattern, and computes explainable severity.
        """
        if not anomaly_summary.get("is_anomaly", False):
            return None

        # Filter events related to this burst
        correlated_events = list(self.recent_events[-50:])
        source_ips = set()
        affected_services = set()

        for ev in correlated_events:
            ip = ev.get("fields", {}).get("ip")
            if ip and ip != "127.0.0.1":
                source_ips.add(ip)
            svc = ev.get("service")
            if svc:
                affected_services.add(svc)

        classification = IncidentClassifier.classify(features, correlated_events)

        # Calculate severity components
        service_crit = 0.5
        if "auth" in affected_services:
            service_crit = 1.0
        elif "db" in affected_services:
            service_crit = 0.9
        elif "api" in affected_services:
            service_crit = 0.7

        volume_ratio = min(features.get("rps", 1.0) / 25.0, 1.0)
        blast_radius = min(len(source_ips) / 5.0, 1.0) if len(source_ips) > 0 else 0.3
        success_indicator = 1.0 if classification == "credential_stuffing" and features.get("success_logins", 0) > 0 else 0.0

        sev = compute_severity(
            blast_radius=blast_radius,
            success_indicator=success_indicator,
            service_criticality=service_crit,
            volume_ratio=volume_ratio
        )

        incident_id = f"inc_{uuid.uuid4().hex[:8]}"

        return {
            "id": incident_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "new",
            "classification": classification,
            "severity": sev["level"],
            "severity_score": sev["score"],
            "title": f"Detected {classification.replace('_', ' ').title()} Incident",
            "source_ips": list(source_ips) if source_ips else ["127.0.0.1"],
            "affected_services": list(affected_services) if affected_services else ["web"],
            "anomaly_reason": anomaly_summary.get("reason", ""),
            "evidence_events": correlated_events[-15:],  # Top 15 key log entries as evidence
            "severity_breakdown": sev["breakdown"]
        }

