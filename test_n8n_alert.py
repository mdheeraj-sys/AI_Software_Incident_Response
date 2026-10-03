"""
Quick Test Trigger for n8n AI Incident Response Agent.
Dispatches a realistic incident payload to your n8n webhook with header auth support.
"""

import os
import sys
import json
import urllib.request
from pathlib import Path
from dotenv import load_dotenv

# Load .env
load_dotenv(Path(__file__).resolve().parent / ".env")

try:
    from attack_scripts.cloud_attacker import get_real_public_ip
    DEFAULT_IP = get_real_public_ip()
except Exception:
    DEFAULT_IP = os.environ.get("HACKER_REAL_IP", "119.235.52.196")

WEBHOOK_URL = os.environ.get("N8N_WEBHOOK_URL", "https://craftsman.app.n8n.cloud/webhook/incident-alert")
HEADER_NAME = os.environ.get("N8N_HEADER_NAME", "")
HEADER_VALUE = os.environ.get("N8N_HEADER_VALUE", "")

def send_alert(incident_type="brute_force", endpoint="/api/v1/auth/login", source_ip=None):
    source_ip = source_ip or DEFAULT_IP
    
    # Exact JSON shape expected by n8n workflow
    payload = {
        "incident_type": incident_type,
        "source_ip": source_ip,
        "endpoint": endpoint,
        "anomaly_score": 0.93,
        "error_count": 250
    }

    print(f"\n[+] Dispatching incident alert to n8n webhook:")
    print(f"    URL:           {WEBHOOK_URL}")
    print(f"    Incident Type: {incident_type}")
    print(f"    Real Attacker: {source_ip}")
    print(f"    Endpoint:      {endpoint}")
    if HEADER_NAME and HEADER_VALUE:
        print(f"    Header Auth:   {HEADER_NAME}: ***{HEADER_VALUE[-4:] if len(HEADER_VALUE) > 4 else '***'}")
    else:
        print(f"    Header Auth:   (None configured - check .env if n8n returns 403)")

    headers = {"Content-Type": "application/json"}
    if HEADER_NAME and HEADER_VALUE:
        headers[HEADER_NAME] = HEADER_VALUE

    req = urllib.request.Request(
        WEBHOOK_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"\n[✓] SUCCESS! HTTP {resp.status} - {resp.read().decode('utf-8')}")
            print("    Check n8n executions tab and Telegram for the approval request!")
    except urllib.error.HTTPError as e:
        print(f"\n[!] HTTP Error {e.code}: {e.read().decode('utf-8')}")
        if e.code == 403:
            print("    -> 403 Forbidden: n8n rejected the request because the secret Header Auth is missing or incorrect.")
            print("       Set N8N_HEADER_NAME and N8N_HEADER_VALUE in .env and publish your workflow.")
    except Exception as e:
        print(f"\n[x] Failed to trigger webhook: {e}")

if __name__ == "__main__":
    incident = sys.argv[1] if len(sys.argv) > 1 else "brute_force"
    send_alert(incident_type=incident)
