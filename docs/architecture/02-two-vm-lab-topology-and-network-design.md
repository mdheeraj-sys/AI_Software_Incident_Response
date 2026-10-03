# PART 2 — TWO-VM LAB TOPOLOGY AND NETWORK DESIGN

## 2.1 Network diagram (described)

Both VMs sit on a single host-only or internal virtual network, isolated from the internet and from your host's regular LAN. No bridged networking, no port forwarding to the outside world. This is a closed lab.

```
                 Host machine (hypervisor: VirtualBox / VMware / libvirt)
  ┌───────────────────────────────────────────────────────────────────┐
  │                                                                     │
  │   Internal / Host-only network: 10.10.10.0/24                      │
  │                                                                     │
  │   ┌────────────────────┐              ┌────────────────────────┐  │
  │   │  VM-A: Attacker     │   attacks    │  VM-B: Victim + Agent  │  │
  │   │  10.10.10.11        │ ───────────► │  10.10.10.12            │  │
  │   │  Kali or Ubuntu     │              │  nginx :80              │  │
  │   │  Hydra, sqlmap,     │              │  app :8000              │  │
  │   │  nikto, hey, gobuster│             │  agent/dashboard :9000  │  │
  │   │                      │              │  (mgmt-only bind)       │  │
  │   └────────────────────┘              └────────────────────────┘  │
  │                                                                     │
  └───────────────────────────────────────────────────────────────────┘
```

## 2.2 Why the dashboard port is "management-only"

Bind the agent dashboard (port 9000) to an interface or address the attacker VM cannot reach, or at minimum put it behind a separate iptables rule that only allows your host's management IP. This matters for two reasons: it is realistic (real SOC dashboards are never exposed to the thing they are monitoring), and it protects your demo — a stray attack script should never be able to accidentally hit your own dashboard.

## 2.3 VM specs (minimum workable)

- VM-A: 2 vCPU, 2 GB RAM, Kali Linux or Ubuntu with security tools installed.
- VM-B: 4 vCPU, 8 GB RAM (the LLM calls happen over the network to an API, so local compute needs are modest; this budget is mostly for running nginx + app + Postgres + the detection pipeline + log generator concurrently).

## 2.4 Clock synchronization

Make sure both VMs are NTP-synced to the same source, or at minimum to the host clock. Your entire evaluation methodology depends on timestamp correlation between "attack launched at VM-A" and "incident detected at VM-B." A clock skew of even a few seconds will corrupt your time-to-detect measurements.

## 2.5 Snapshotting

Take a clean snapshot of both VMs after initial setup, before you start running attacks. This lets you reset to a known-good state between demo runs and between evaluation trials, which you will want to do many times.

---
