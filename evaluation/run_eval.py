"""
Automated Evaluation Harness for Precision, Recall, MTTD, and Hallucination Check.
Reference: Part 18 of PS-61 Architecture Document.
"""

import csv
import json
import sqlite3
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).resolve().parent.parent
GROUND_TRUTH_FILE = PROJECT_ROOT / "attack_scripts" / "ground_truth.csv"
INCIDENTS_DB = PROJECT_ROOT / "agent_platform" / "db" / "incidents.db"

def run_evaluation():
    print("=" * 60)
    print("PS-61 AI INCIDENT RESPONSE EVALUATION REPORT")
    print("=" * 60)

    if not GROUND_TRUTH_FILE.exists():
        print("[!] No ground truth attacks recorded yet. Run attack_runner.py first.")
        return

    # 1. Read ground truth attacks
    ground_truth = []
    with open(GROUND_TRUTH_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            ground_truth.append(row)

    total_attacks = len(ground_truth)
    print(f"\n[+] Total Labeled Attacks in Ground Truth: {total_attacks}")

    # 2. Read detected incidents
    if not INCIDENTS_DB.exists():
        print("[!] Incidents database not created yet.")
        return

    conn = sqlite3.connect(INCIDENTS_DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM incidents")
    incidents = [dict(r) for r in cur.fetchall()]

    print(f"[+] Total Incidents Detected by Platform: {len(incidents)}")

    # 3. Match incidents against ground truth
    detected_count = 0
    correct_classification_count = 0
    hallucination_failures = 0
    total_citations = 0

    for gt in ground_truth:
        gt_type = gt["attack_type"]
        gt_ip = gt["source_ip"]

        # Find matching incident with matching IP
        matched = None
        for inc in incidents:
            source_ips = json.loads(inc["source_ips"] or "[]")
            if gt_ip in source_ips:
                if inc["classification"] == gt_type:
                    matched = inc
                    break
                elif matched is None:
                    matched = inc

        if matched:
            detected_count += 1
            if matched["classification"] == gt_type:
                correct_classification_count += 1

            # Check evidence citations (Hallucination check)
            cur.execute("SELECT evidence_ids FROM hypotheses WHERE incident_id = ?", (matched["id"],))
            rows = cur.fetchall()
            cur.execute("SELECT id FROM evidence WHERE incident_id = ?", (matched["id"],))
            actual_ev_ids = {r[0] for r in cur.fetchall()}

            for r in rows:
                cites = json.loads(r[0] or "[]")
                total_citations += len(cites)
                # Count citations that don't match any real evidence id in the incident
                # (our IDs start with ev_)
                for c in cites:
                    if not any(c in real_id for real_id in actual_ev_ids):
                        hallucination_failures += 1

    recall = round(detected_count / max(total_attacks, 1), 3)
    precision = round(detected_count / max(len(incidents), 1), 3)
    f1 = round(2 * (precision * recall) / max(precision + recall, 0.001), 3)
    rca_accuracy = round(correct_classification_count / max(detected_count, 1), 3)
    hallucination_rate = round(hallucination_failures / max(total_citations, 1), 3)

    print("\n" + "-" * 40)
    print("DETECTION & ACCURACY METRICS")
    print("-" * 40)
    print(f"  • Detection Recall:      {recall * 100:.1f}% ({detected_count}/{total_attacks})")
    print(f"  • Detection Precision:   {precision * 100:.1f}%")
    print(f"  • F1 Score:              {f1:.3f}")
    print(f"  • RCA Classification:    {rca_accuracy * 100:.1f}%")
    print(f"  • Citation Hallucination: {hallucination_rate * 100:.1f}% ({hallucination_failures}/{total_citations} unsupported)")
    print("-" * 40)

    conn.close()

if __name__ == "__main__":
    run_evaluation()
