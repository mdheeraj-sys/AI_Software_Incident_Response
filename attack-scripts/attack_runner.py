"""
Attack Catalog & Ground-Truth Test Runner.
Autonomous AI Incident Response Testbed.

Simulates:
1. Credential Brute Force attack on /login
2. SQL Injection probing on /search
3. Directory Scanning / Path Fuzzing
4. Traffic Flood / Request Spike
5. Bad Deploy Fault Trigger
"""

import time
import requests
import csv
from datetime import datetime, timezone
from pathlib import Path
from attack_scripts.cloud_attacker import get_real_public_ip

VICTIM_URL = "http://127.0.0.1:8000"
GROUND_TRUTH_LOG = Path(__file__).resolve().parent / "ground_truth.csv"

def get_iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()

def record_ground_truth(attack_type: str, start_time: str, end_time: str, source_ip: str, endpoint: str, tool: str):
    file_exists = GROUND_TRUTH_LOG.exists()
    with open(GROUND_TRUTH_LOG, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["attack_type", "start_time", "end_time", "source_ip", "endpoint", "tool"])
        writer.writerow([attack_type, start_time, end_time, source_ip, endpoint, tool])

# 1. Credential Brute Force
def run_brute_force(target_user: str = "admin", attempts: int = 25, source_ip: str = None):
    source_ip = source_ip or get_real_public_ip()
    print(f"\n[!] Launching Credential Brute Force against {target_user} from IP {source_ip}...")
    start_time = get_iso_now()
    session = requests.Session()
    headers = {"X-Forwarded-For": source_ip, "User-Agent": "Hydra/9.5 (Kali Linux)"}

    wordlist = [f"pass_{i}" for i in range(attempts)]
    for pwd in wordlist:
        try:
            resp = session.post(f"{VICTIM_URL}/login", json={"user": target_user, "password": pwd}, headers=headers, timeout=2)
            print(f"    [-] {target_user}:{pwd} -> HTTP {resp.status_code}")
            if resp.status_code == 403:
                print("    [+] ATTACK BLOCKED BY FIREWALL! Gating works.")
                break
        except Exception as e:
            print(f"    [x] Connection refused/dropped: {e}")
            break
        time.sleep(0.08)

    end_time = get_iso_now()
    record_ground_truth("brute_force", start_time, end_time, source_ip, "/login", "hydra_sim")

# 2. SQL Injection Attempt
def run_sqli_attack(source_ip: str = None):
    source_ip = source_ip or get_real_public_ip()
    print(f"\n[!] Launching SQL Injection Probes against /search from IP {source_ip}...")
    start_time = get_iso_now()
    session = requests.Session()
    headers = {"X-Forwarded-For": source_ip, "User-Agent": "sqlmap/1.8#stable"}

    payloads = [
        "test' OR 1=1 --",
        "' UNION SELECT id, username, password, role, status FROM users --",
        "1' AND SLEEP(3)--",
        "admin' /*",
        "' UNION SELECT null, null, null, null, null--"
    ]
    for p in payloads:
        try:
            resp = session.get(f"{VICTIM_URL}/search", params={"q": p}, headers=headers, timeout=3)
            print(f"    [-] Payload: {p} -> HTTP {resp.status_code}")
            if resp.status_code == 403:
                print("    [+] ATTACK BLOCKED BY FIREWALL!")
                break
        except Exception as e:
            print(f"    [x] Request error: {e}")
        time.sleep(0.1)

    end_time = get_iso_now()
    record_ground_truth("sqli_attempt", start_time, end_time, source_ip, "/search", "sqlmap_sim")

# 3. Path / Directory Scanning
def run_directory_scan(source_ip: str = None):
    source_ip = source_ip or get_real_public_ip()
    print(f"\n[!] Launching Directory Enumeration Scan from IP {source_ip}...")
    start_time = get_iso_now()
    session = requests.Session()
    headers = {"X-Forwarded-For": source_ip, "User-Agent": "gobuster/3.6"}

    paths = [
        "/admin", "/.env", "/wp-login.php", "/api/v1/config", "/backup.zip",
        "/server-status", "/phpmyadmin", "/.git/HEAD", "/secret", "/keys.json"
    ]
    for p in paths:
        try:
            resp = session.get(f"{VICTIM_URL}{p}", headers=headers, timeout=2)
            print(f"    [-] Path: {p} -> HTTP {resp.status_code}")
            if resp.status_code == 403 and "Access Denied" in resp.text:
                print("    [+] ATTACK BLOCKED BY FIREWALL!")
                break
        except Exception:
            pass
        time.sleep(0.05)

    end_time = get_iso_now()
    record_ground_truth("scanning", start_time, end_time, source_ip, "/*", "gobuster_sim")

# 4. Trigger Fault / Bad Deploy
def trigger_bad_deploy():
    print("\n[!] Triggering Bad Deploy Fault Injection...")
    resp = requests.post(f"{VICTIM_URL}/admin/fault/bad_deploy", params={"active": True})
    print(f"    [-] Server response: {resp.json()}")

if __name__ == "__main__":
    import sys
    arg = sys.argv[1] if len(sys.argv) > 1 else "brute"
    if arg == "brute":
        run_brute_force()
    elif arg == "sqli":
        run_sqli_attack()
    elif arg == "scan":
        run_directory_scan()
    elif arg == "deploy":
        trigger_bad_deploy()
    else:
        print("Usage: python attack_runner.py [brute|sqli|scan|deploy]")
