import time
import random
import requests
import threading
from datetime import datetime

VICTIM_URL = "http://127.0.0.1:8000"

NORMAL_USERS = [
    ("alice", "alicepassword"),
    ("bob", "bobpassword"),
    ("admin", "admin123"),
]

SEARCH_QUERIES = ["Firewall", "USB", "Monitor", "Smart", "Gateway", "Security", "Hardware", "Pro"]

NORMAL_IPS = [
    "192.168.1.101",
    "192.168.1.102",
    "192.168.1.103",
    "192.168.1.104",
    "192.168.1.105",
]

def simulate_user_session(user_id: int, stop_event: threading.Event):
    session = requests.Session()
    ip = random.choice(NORMAL_IPS)
    headers = {"X-Forwarded-For": ip, "User-Agent": f"NormalBrowser/1.0 (User-{user_id})"}

    while not stop_event.is_set():
        action = random.random()
        try:
            if action < 0.40:
                # Browse products
                session.get(f"{VICTIM_URL}/products", headers=headers, timeout=5)
            elif action < 0.70:
                # Search products
                query = random.choice(SEARCH_QUERIES)
                session.get(f"{VICTIM_URL}/search?q={query}", headers=headers, timeout=5)
            elif action < 0.90:
                # Normal login attempt
                u, p = random.choice(NORMAL_USERS)
                # 5% chance of typo in password
                if random.random() < 0.05:
                    p += "_typo"
                session.post(f"{VICTIM_URL}/login", json={"user": u, "password": p}, headers=headers, timeout=5)
            else:
                # Check root or health
                session.get(f"{VICTIM_URL}/health", headers=headers, timeout=5)
        except Exception:
            pass  # Normal occasional network timeout

        # Poisson-like arrival delay (between 0.2s and 1.5s per simulated user)
        delay = random.expovariate(1.5)
        time.sleep(min(max(delay, 0.1), 2.5))

def run_traffic_generator(num_users=6, duration_seconds=0):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Starting background traffic generator with {num_users} normal users...")
    stop_event = threading.Event()
    threads = []
    for i in range(num_users):
        t = threading.Thread(target=simulate_user_session, args=(i, stop_event), daemon=True)
        t.start()
        threads.append(t)

    try:
        if duration_seconds > 0:
            time.sleep(duration_seconds)
            stop_event.set()
        else:
            while True:
                time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping traffic generator...")
        stop_event.set()

if __name__ == "__main__":
    run_traffic_generator(num_users=6)
