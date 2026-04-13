# Opsera × Kissflow CTO Talks AI Hackathon — Submission

**Project:** Hardening a MERN microservices e-commerce app with Opsera AI agents
**Author:** Sanjay V
**Date submitted:** 2026-04-14
**Hackathon dates:** April 13–14, 2026 (Chennai)

---

## 🔗 Links

| Artifact | Where |
|---|---|
| **Public GitHub repo** | https://github.com/sanjay-perfecter/opsera-hackathon-ecart |
| **README (start here)** | https://github.com/sanjay-perfecter/opsera-hackathon-ecart#readme |
| **Video walkthrough (90s)** | *(uploaded to this same shared-drive folder)* |
| **Architecture report** | [`Opsera_reports/Architecture/Opsera_architeture_result.md`](https://github.com/sanjay-perfecter/opsera-hackathon-ecart/blob/main/Opsera_reports/Architecture/Opsera_architeture_result.md) |
| **Security report (with before/after)** | [`Opsera_reports/Security/Summary.md`](https://github.com/sanjay-perfecter/opsera-hackathon-ecart/blob/main/Opsera_reports/Security/Summary.md) |
| **Compliance report** | [`Opsera_reports/Compliance/Summary.md`](https://github.com/sanjay-perfecter/opsera-hackathon-ecart/blob/main/Opsera_reports/Compliance/Summary.md) |
| **SQL/Mongoose schema review** | [`Opsera_reports/SQL/Summary.md`](https://github.com/sanjay-perfecter/opsera-hackathon-ecart/blob/main/Opsera_reports/SQL/Summary.md) |
| **Architecture diagram (PNG)** | [`Opsera_reports/screenshots/Opsera_architecture.png`](https://github.com/sanjay-perfecter/opsera-hackathon-ecart/blob/main/Opsera_reports/screenshots/Opsera_architecture.png) |

---

## ✅ Submission requirements checklist (from the hackathon email)

- [x] **Public GitHub repo** with readable code → [link above]
- [x] **README** explaining what was built and how to run it → top of repo
- [x] **Agent report** showing Opsera agents actually ran on the code → 4 reports under `Opsera_reports/`
- [x] **Video walkthrough (90s)** showing problem solved + how the agent helped → uploaded to this folder
- [x] **At least one Opsera agent core to the project** → 4 agents used (Architecture, Security, Compliance, SQL-adapted)
- [x] **Open source repo** →  public
- [x] **AI tools used during development** → Co-piolet, Claude Code

---

## 🎯 What the Opsera agents found and what I shipped

| # | Finding (agent → tool) | Severity | Status |
|---|---|---|---|
| 1 | 8 Dockerfiles run as root (Security → Checkov + Semgrep) — Checkov caught 1, Semgrep caught 7 more | Critical | ✅ Fixed: `USER node` / `USER 1000:1000` on all 8 |
| 2 | `stripe/stripe-cli:latest` unpinned (Security → Hadolint `DL3007`) | Warning | ✅ Fixed: pinned to `v1.21.8` |
| 3 | 2 Critical CVEs in `axios 1.13.2` (Security → Grype) across 8 manifests | Critical | ✅ Fixed: bumped to `^1.15.0` everywhere |
| 4 | Path-traversal in product image deletion (Security → Semgrep `path-join-resolve-traversal`) | High | ✅ Fixed: `path.resolve` + containment check |
| 5 | 8 Dockerfiles missing HEALTHCHECK (Compliance → CIS Docker 4.6) | Medium | 📋 Documented + remediation snippet provided |
| 6 | NoSQL injection vector via unfiltered `req.query` operators (SQL → Mongoose review) | High | 📋 Documented + 3 mitigation paths in report |
| 7 | Password minlength = 6 (Compliance → OWASP ASVS L1 V2.1.1) | Low | 📋 Documented (1-line fix) |
| 8 | Missing indexes on hot Order/Cart query paths (SQL) | Medium | 📋 Documented |

**Total:** 4 categories of fixes shipped across 17 files; 4 categories tracked for next iteration with concrete patches.

---

## 📊 Mapping to the eval rubric

| Weight | Criterion | Where to look |
|---|---|---|
| **40%** Technical Depth | All 4 advertised Opsera agents used; raw outputs (semgrep.json, grype.json) included; before/after delta documented | `Opsera_reports/{Architecture,Security,Compliance,SQL}/` |
| **30%** Real Impact | Concrete code shipped: 8 Dockerfiles patched, 8 package.json bumps, path-traversal fix verified | `git log` on the repo, plus before/after table in [Security/Summary.md](https://github.com/sanjay-perfecter/opsera-hackathon-ecart/blob/main/Opsera_reports/Security/Summary.md) |
| **20%** Code Quality | Clean commits, dedicated `Opsera_reports/` tree, README leads with the hackathon story, `.gitignore` keeps `.env`/secrets out | repo root + commit history |
| **10%** Innovation | Adapted the SQL agent to a NoSQL stack (Mongoose schema + query review); compliance mapped to PCI-DSS SAQ-A scope (relevant for the Stripe integration) | [SQL/Summary.md](https://github.com/sanjay-perfecter/opsera-hackathon-ecart/blob/main/Opsera_reports/SQL/Summary.md), [Compliance/Summary.md](https://github.com/sanjay-perfecter/opsera-hackathon-ecart/blob/main/Opsera_reports/Compliance/Summary.md) |

---


