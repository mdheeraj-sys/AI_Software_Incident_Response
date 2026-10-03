#!/usr/bin/env python3
"""
=============================================================================
  🛡️ VICTIM CLOUD APP LAUNCHER (FastAPI on Port 8000)
=============================================================================
  Runs the College Portal / Victim API backend with real-time canonical
  telemetry, SQLite database, and active firewall middleware.
=============================================================================
"""

import sys
import uvicorn
from pathlib import Path

# Ensure root path is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

def main():
    print("\n" + "="*70)
    print("  🛡️  STARTING VICTIM CLOUD APPLICATION (PORT 8000)")
    print("="*70)
    print("  Endpoints:")
    print("  • Brute Force Target : POST /login")
    print("  • SQLi Target        : GET  /search?q=...")
    print("  • Remediate Block IP : POST /internal/remediate/block_ip?ip=...")
    print("  • Remediate Unblock  : POST /internal/remediate/unblock_ip?ip=...")
    print("  • Logs Location      : victim_app/logs/access.log")
    print("="*70 + "\n")

    uvicorn.run("victim_app.main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()
