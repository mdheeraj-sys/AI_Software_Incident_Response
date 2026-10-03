import pytest
from agent_platform.parser.drain import DrainParser
from agent_platform.detection.detector import EWMATracker, AnomalyDetector
from agent_platform.db.database import compute_hash

def test_drain_parser():
    parser = DrainParser(max_depth=4, sim_threshold=0.5)
    id1, t1, is_new1 = parser.parse("401 POST /login user=admin ip=10.10.10.11")
    id2, t2, is_new2 = parser.parse("401 POST /login user=bob ip=10.10.10.12")
    # Same structure should collapse into the same template ID with wildcard
    assert id1 == id2
    assert is_new1 is True
    assert is_new2 is False
    assert "<*>" in t2 or "<IP>" in t2

def test_ewma_anomaly_tracker():
    tracker = EWMATracker(alpha=0.3, z_threshold=3.0)
    # Establish normal baseline
    for _ in range(20):
        tracker.update(5.0)
    # Inject sudden massive spike
    z_score, is_anomalous = tracker.update(50.0)
    assert is_anomalous is True
    assert z_score > 3.0

def test_hash_chaining():
    prev_hash = "GENESIS_HASH"
    entry1 = {"event": "login_failed", "ip": "1.2.3.4"}
    hash1 = compute_hash(prev_hash, entry1)
    entry2 = {"event": "ip_blocked", "ip": "1.2.3.4"}
    hash2 = compute_hash(hash1, entry2)
    assert hash1 != hash2
    assert len(hash1) == 64  # SHA-256
