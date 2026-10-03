import os
import json
import time
import asyncio
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Request, Response, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Directories and paths
BASE_DIR = Path(__file__).resolve().parent
LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(exist_ok=True, parents=True)

ACCESS_LOG_FILE = LOGS_DIR / "access.log"
APP_LOG_FILE = LOGS_DIR / "app.log"
AUTH_LOG_FILE = LOGS_DIR / "auth.log"
DEPLOY_LOG_FILE = LOGS_DIR / "deploy.log"
DB_FILE = BASE_DIR / "victim.db"

# State toggles for fault injection
FAULT_STATE = {
    "slow_query_ms": 0,
    "bad_deploy_active": False,
    "memory_leak_chunks": [],
    "db_pool_exhausted": False,
    "rate_limited_ips": {},  # ip -> expiry_timestamp
    "blocked_ips": set(),    # set of blocked IPs
    "disabled_users": set(),  # set of disabled usernames
}

app = FastAPI(title="Victim Application (Shop & Service API)", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Database Initialization -----------------
def init_db():
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT,
            status TEXT DEFAULT 'active'
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            category TEXT,
            price REAL,
            stock INTEGER
        )
    """)
    # Seed initial test users and products if empty
    cur.execute("SELECT COUNT(*) FROM users")
    if cur.fetchone()[0] == 0:
        cur.executemany("INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)", [
            ("admin", "admin123", "admin", "active"),
            ("alice", "alicepassword", "user", "active"),
            ("bob", "bobpassword", "user", "active"),
            ("operator", "supersecret99", "admin", "active"),
        ])
    cur.execute("SELECT COUNT(*) FROM products")
    if cur.fetchone()[0] == 0:
        cur.executemany("INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)", [
            ("CyberShield Firewall", "Security", 499.99, 25),
            ("Encrypted USB Drive 128GB", "Hardware", 49.99, 100),
            ("Network Anomaly Monitor Pro", "Software", 899.00, 10),
            ("Smart Incident Responder", "Software", 1250.00, 5),
            ("ZeroTrust Gateway Appliance", "Hardware", 2400.00, 3),
        ])
    conn.commit()
    conn.close()

init_db()

# ----------------- Structured Logging Helper -----------------
def get_iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()

def log_json_line(filepath: Path, data: dict):
    with open(filepath, "a", encoding="utf-8") as f:
        f.write(json.dumps(data) + "\n")

# ----------------- Middleware: Canonical Logging & Security Gating -----------------
@app.middleware("http")
async def telemetry_and_firewall_middleware(request: Request, call_next):
    start_time = time.time()
    client_ip = request.client.host if request.client else "127.0.0.1"

    # Forwarded header support if behind reverse proxy
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()

    # Check if blocked by our auto-mitigation or human action
    if client_ip in FAULT_STATE["blocked_ips"]:
        duration_ms = round((time.time() - start_time) * 1000, 2)
        log_json_line(ACCESS_LOG_FILE, {
            "timestamp": get_iso_now(),
            "source": "nginx_access",
            "service": "web",
            "raw": f"{client_ip} - - [{get_iso_now()}] \"{request.method} {request.url.path}\" 403 0 (BLOCKED_BY_FIREWALL)",
            "fields": {
                "ip": client_ip,
                "method": request.method,
                "path": request.url.path,
                "status": 403,
                "response_time_ms": duration_ms,
                "user_agent": request.headers.get("user-agent", "-")
            }
        })
        return JSONResponse(status_code=403, content={"error": "Access Denied: Your IP address is blocked."})

    # Check rate limit
    if client_ip in FAULT_STATE["rate_limited_ips"]:
        expiry = FAULT_STATE["rate_limited_ips"][client_ip]
        if time.time() < expiry:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            log_json_line(ACCESS_LOG_FILE, {
                "timestamp": get_iso_now(),
                "source": "nginx_access",
                "service": "web",
                "raw": f"{client_ip} - - [{get_iso_now()}] \"{request.method} {request.url.path}\" 429 0 (RATE_LIMITED)",
                "fields": {
                    "ip": client_ip,
                    "method": request.method,
                    "path": request.url.path,
                    "status": 429,
                    "response_time_ms": duration_ms
                }
            })
            return JSONResponse(status_code=429, content={"error": "Too Many Requests: Rate limit active."})
        else:
            del FAULT_STATE["rate_limited_ips"][client_ip]

    # Inject bad deploy if active (simulate 500 server error)
    if FAULT_STATE["bad_deploy_active"] and not request.url.path.startswith("/admin/fault"):
        duration_ms = round((time.time() - start_time) * 1000, 2)
        log_json_line(APP_LOG_FILE, {
            "timestamp": get_iso_now(),
            "source": "app",
            "service": "api",
            "raw": f"[CRITICAL] Unhandled NullPointer/500 error in release v2.4.1 for {request.url.path}",
            "fields": {
                "ip": client_ip,
                "path": request.url.path,
                "status": 500,
                "error": "DeployRegressionError: release v2.4.1 regression"
            }
        })
        log_json_line(ACCESS_LOG_FILE, {
            "timestamp": get_iso_now(),
            "source": "nginx_access",
            "service": "web",
            "raw": f"{client_ip} - - [{get_iso_now()}] \"{request.method} {request.url.path}\" 500 0",
            "fields": {
                "ip": client_ip,
                "method": request.method,
                "path": request.url.path,
                "status": 500,
                "response_time_ms": duration_ms
            }
        })
        return JSONResponse(status_code=500, content={"error": "Internal Server Error: Service failure following deploy."})

    # Artificial slow query latency injection
    if FAULT_STATE["slow_query_ms"] > 0 and "/search" in request.url.path:
        await asyncio.sleep(FAULT_STATE["slow_query_ms"] / 1000.0)

    try:
        response = await call_next(request)
        status_code = response.status_code
    except Exception as exc:
        status_code = 500
        response = JSONResponse(status_code=500, content={"error": str(exc)})

    duration_ms = round((time.time() - start_time) * 1000, 2)

    # Log to canonical access log
    log_json_line(ACCESS_LOG_FILE, {
        "timestamp": get_iso_now(),
        "source": "nginx_access",
        "service": "web",
        "raw": f"{client_ip} - - [{get_iso_now()}] \"{request.method} {request.url.path}\" {status_code} {duration_ms}ms",
        "fields": {
            "ip": client_ip,
            "method": request.method,
            "path": request.url.path,
            "status": status_code,
            "response_time_ms": duration_ms,
            "user_agent": request.headers.get("user-agent", "-")
        }
    })

    return response

# ----------------- Public & Application Endpoints -----------------

@app.get("/")
def home():
    return {"service": "Victim Application API", "status": "online", "docs": "/docs"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": get_iso_now(),
        "faults": {
            "slow_query_ms": FAULT_STATE["slow_query_ms"],
            "bad_deploy_active": FAULT_STATE["bad_deploy_active"],
            "pool_exhausted": FAULT_STATE["db_pool_exhausted"],
            "blocked_ips_count": len(FAULT_STATE["blocked_ips"]),
        }
    }

class LoginRequest(BaseModel):
    user: str
    password: str

@app.post("/login")
def login(creds: LoginRequest, request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"

    # Check if user account was disabled by remediation action
    if creds.user in FAULT_STATE["disabled_users"]:
        log_json_line(AUTH_LOG_FILE, {
            "timestamp": get_iso_now(),
            "source": "auth",
            "service": "auth",
            "raw": f"Login refused: account '{creds.user}' is disabled by admin. IP: {client_ip}",
            "fields": {"ip": client_ip, "user": creds.user, "status": 403, "success": False, "reason": "ACCOUNT_DISABLED"}
        })
        raise HTTPException(status_code=403, detail="Account is disabled.")

    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT id, username, role FROM users WHERE username = ? AND password = ?", (creds.user, creds.password))
    row = cur.fetchone()
    conn.close()

    if row:
        log_json_line(AUTH_LOG_FILE, {
            "timestamp": get_iso_now(),
            "source": "auth",
            "service": "auth",
            "raw": f"Successful authentication for user '{creds.user}' from IP {client_ip}",
            "fields": {"ip": client_ip, "user": creds.user, "status": 200, "success": True, "role": row[2]}
        })
        return {"message": "Login successful", "user": row[1], "role": row[2]}
    else:
        log_json_line(AUTH_LOG_FILE, {
            "timestamp": get_iso_now(),
            "source": "auth",
            "service": "auth",
            "raw": f"Authentication failed for user '{creds.user}' from IP {client_ip}: Invalid credentials",
            "fields": {"ip": client_ip, "user": creds.user, "status": 401, "success": False, "reason": "INVALID_CREDENTIALS"}
        })
        raise HTTPException(status_code=401, detail="Invalid username or password.")

@app.get("/products")
def get_products():
    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    cur.execute("SELECT id, name, category, price, stock FROM products")
    rows = cur.fetchall()
    conn.close()
    return [{"id": r[0], "name": r[1], "category": r[2], "price": r[3], "stock": r[4]} for r in rows]

# SQL Injection Target Endpoint (Intentionally vulnerable query string for security research lab)
@app.get("/search")
def search_products(q: str = "", request: Request = None):
    client_ip = request.client.host if request and request.client else "127.0.0.1"

    if FAULT_STATE["db_pool_exhausted"]:
        raise HTTPException(status_code=503, detail="Database connection pool timeout / exhausted.")

    conn = sqlite3.connect(DB_FILE)
    cur = conn.cursor()
    # Note: Intentionally unparameterized SQL query for vulnerability testing as specified in Architecture Part 3.2
    query = f"SELECT id, name, category, price, stock FROM products WHERE name LIKE '%{q}%' OR category LIKE '%{q}%'"
    try:
        cur.execute(query)
        rows = cur.fetchall()
        conn.close()
        return [{"id": r[0], "name": r[1], "category": r[2], "price": r[3], "stock": r[4]} for r in rows]
    except Exception as e:
        conn.close()
        # Log DB syntax / injection error explicitly
        log_json_line(APP_LOG_FILE, {
            "timestamp": get_iso_now(),
            "source": "db",
            "service": "db",
            "raw": f"Database query execution error for query [{query}]: {str(e)}",
            "fields": {"ip": client_ip, "query": q, "status": 500, "error": str(e)}
        })
        raise HTTPException(status_code=500, detail=f"Database syntax/execution error: {str(e)}")

@app.get("/admin/system-status")
def admin_status(request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer admin-token"):
        log_json_line(AUTH_LOG_FILE, {
            "timestamp": get_iso_now(),
            "source": "auth",
            "service": "auth",
            "raw": f"Unauthorized access attempt to /admin/system-status from IP {client_ip}",
            "fields": {"ip": client_ip, "status": 403, "endpoint": "/admin/system-status"}
        })
        raise HTTPException(status_code=403, detail="Forbidden: Admin privilege required.")
    return {"status": "ok", "system_load": "normal", "timestamp": get_iso_now()}

# ----------------- Fault Injection Hooks (Part 3.4) -----------------
# Exposed for controlled lab testing & false-positive evaluation

@app.post("/admin/fault/slow_query")
def fault_slow_query(duration_ms: int = 1500):
    FAULT_STATE["slow_query_ms"] = duration_ms
    log_json_line(DEPLOY_LOG_FILE, {
        "timestamp": get_iso_now(),
        "source": "deploy",
        "service": "db",
        "raw": f"Config change: injected slow_query delay of {duration_ms}ms into search queries",
        "fields": {"action": "inject_slow_query", "duration_ms": duration_ms}
    })
    return {"message": f"Injected {duration_ms}ms latency to search queries."}

@app.post("/admin/fault/bad_deploy")
def fault_bad_deploy(active: bool = True):
    FAULT_STATE["bad_deploy_active"] = active
    event = "Deployed release v2.4.1 (FAULTY REGRESSION)" if active else "Rolled back release v2.4.1 to v2.4.0 (STABLE)"
    log_json_line(DEPLOY_LOG_FILE, {
        "timestamp": get_iso_now(),
        "source": "deploy",
        "service": "api",
        "raw": event,
        "fields": {"action": "bad_deploy_toggle", "active": active}
    })
    return {"message": event}

@app.post("/admin/fault/pool_exhaustion")
def fault_pool_exhaustion(exhaust: bool = True):
    FAULT_STATE["db_pool_exhausted"] = exhaust
    log_json_line(DEPLOY_LOG_FILE, {
        "timestamp": get_iso_now(),
        "source": "deploy",
        "service": "db",
        "raw": f"Simulated DB connection pool exhaustion = {exhaust}",
        "fields": {"action": "pool_exhaustion_toggle", "exhausted": exhaust}
    })
    return {"message": f"DB pool exhaustion toggled to {exhaust}."}

@app.post("/admin/fault/reset")
def fault_reset():
    FAULT_STATE["slow_query_ms"] = 0
    FAULT_STATE["bad_deploy_active"] = False
    FAULT_STATE["db_pool_exhausted"] = False
    FAULT_STATE["memory_leak_chunks"].clear()
    return {"message": "All injected faults reset to normal."}

# ----------------- Remediations Applied by Agent/Human -----------------
@app.post("/internal/remediate/block_ip")
def remediate_block_ip(ip: str):
    FAULT_STATE["blocked_ips"].add(ip)
    return {"message": f"IP {ip} successfully added to firewall blocklist."}

@app.post("/internal/remediate/unblock_ip")
def remediate_unblock_ip(ip: str):
    FAULT_STATE["blocked_ips"].discard(ip)
    return {"message": f"IP {ip} removed from firewall blocklist."}

@app.post("/internal/remediate/rate_limit_ip")
def remediate_rate_limit(ip: str, duration_seconds: int = 600):
    FAULT_STATE["rate_limited_ips"][ip] = time.time() + duration_seconds
    return {"message": f"IP {ip} rate limited for {duration_seconds}s."}

@app.post("/internal/remediate/disable_account")
def remediate_disable_account(user: str):
    FAULT_STATE["disabled_users"].add(user)
    return {"message": f"User account '{user}' disabled."}
