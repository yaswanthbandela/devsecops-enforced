# DevSecOps CI Pipeline — Security Enforcement, Not Just Reporting

A minimal Node.js API demonstrating a CI pipeline where **security tools enforce decisions** — not just generate reports.

Each tool has a defined risk model. Each risk model has a defined enforcement strategy.

---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────┐
│                  CI Security Pipeline                   │
├──────────┬──────────────┬─────────────┬─────────────────┤
│  Stage   │     Tool     │  Risk Model │   On Failure    │
├──────────┼──────────────┼─────────────┼─────────────────┤
│ Build    │ pnpm + Jest  │ Test pass   │ ❌ Blocks        │
│ Supply   │ pnpm audit   │ HIGH+       │ ❌ Blocks        │
│ SAST     │ SonarQube    │ Quality Gate│ ❌ Blocks        │
│ Image    │ Trivy        │ HIGH/CRIT   │ ❌ Blocks        │
│ DAST     │ OWASP ZAP    │ HIGH alerts │ ❌ Blocks        │
└──────────┴──────────────┴─────────────┴─────────────────┘
```

---

## Tools & Enforcement Strategy

### 1. `pnpm audit` — Supply Chain Validation

**Risk model:** Third-party dependency vulnerabilities  
**Threshold:** `--audit-level=high`  
**Enforcement:** Pipeline exits 1 on any HIGH or CRITICAL advisory

```bash
pnpm audit --audit-level=high
```

The key distinction: MODERATE advisories are logged for tracking, not delivery blockers.

---

### 2. SonarQube — Static Analysis (SAST)

**Risk model:** Code quality, security hotspots, test coverage  
**Threshold:** Quality Gate (configured in SonarQube UI)  
**Enforcement:** `sonarqube-quality-gate-action` blocks on FAILED gate

Recommended Quality Gate conditions:
- Coverage on new code < 80% → FAILED
- Security rating worse than A → FAILED
- Reliability rating worse than A → FAILED
- Security hotspots reviewed < 100% → FAILED

Configuration: [`sonar-project.properties`](./sonar-project.properties)

---

### 3. Trivy — Container & Filesystem Scanning

**Risk model:** Known CVEs in OS packages, language deps, container image layers  
**Threshold:** `HIGH,CRITICAL` only  
**Enforcement:** `exit-code: 1` on matched findings; `ignore-unfixed: true` reduces noise

Intentional exceptions go in [`.trivyignore`](./.trivyignore) with required documentation:
```
# CVE-2023-XXXXX  # Reason | Owner | Accepted date | Review date
```

---

### 4. OWASP ZAP — Dynamic Analysis (DAST)

**Risk model:** Runtime vulnerabilities against a live app instance  
**Threshold:** Per-rule enforcement via [`zap/zap-rules.conf`](./zap/zap-rules.conf)  
**Enforcement:** `FAIL` threshold blocks; `HIGH` threshold tracks; `IGNORE` suppresses (documented)

This distinction matters: not every ZAP alert is equal. XSS blocks. Some info-disclosure alerts track.

---

## Repository Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions — full pipeline definition
├── src/
│   ├── index.js                # Express app with security middleware
│   └── routes/
│       ├── health.js           # Liveness & readiness probes
│       └── users.js            # Example CRUD endpoint
├── tests/
│   └── app.test.js             # Jest test suite (coverage reported to Sonar)
├── zap/
│   └── zap-rules.conf          # Per-rule ZAP enforcement thresholds
├── .trivyignore                # Documented accepted CVEs
├── .env.example
├── Dockerfile                  # Multi-stage, non-root image
├── sonar-project.properties    # SonarQube project config
└── package.json
```

---

## Running Locally

```bash
# Install
pnpm install

# Run app
pnpm start         # http://localhost:3000

# Tests
pnpm test
pnpm test:coverage

# Supply chain audit
pnpm audit --audit-level=high
```

---

## GitHub Actions Secrets Required

| Secret | Description |
|--------|-------------|
| `SONAR_TOKEN` | SonarQube authentication token |
| `SONAR_HOST_URL` | Your SonarQube server URL (e.g. `https://sonarcloud.io`) |

Set via: **Repository → Settings → Secrets and variables → Actions**

---

## The Core Principle

> Adding security tools is easy. Defining *which risks block delivery* and *which are tracked intentionally* is the actual engineering decision.

Different tools. Different risk models. Different enforcement strategies.  
That distinction is what makes a CI pipeline a security control — not just a reporting dashboard.

---

## License

MIT
