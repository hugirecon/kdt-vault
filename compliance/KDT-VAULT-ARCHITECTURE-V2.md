# KDT Vault — Definitive Architecture Document v2

**Classification:** CUI // NOFORN  
**Document Owner:** Knight Division Tactical  
**Last Updated:** 2026-04-06  
**Status:** AUTHORITATIVE — Single Source of Truth  

---

## ⛔ IRON RULES (Non-Negotiable)

These rules override every other decision in this document. No exceptions. No waivers. No "just this once."

### IRON RULE 1: NO CHINESE HARDWARE OR SOFTWARE — EVER

No Huawei, ZTE, Hikvision, Dahua, Hytera, Lenovo server components, TikTok, WeChat, or any software/hardware from companies headquartered in or majority-owned by entities in the People's Republic of China. This includes sub-components, chipsets, firmware, and any element of the supply chain.

All hardware must comply with **NDAA Section 889** (Parts A & B).

**How to verify:**
1. Check the manufacturer's headquarters country on SEC filings or official corporate registration
2. Cross-reference the FCC ID on every device at [fcc.gov/oet/ea/fccid](https://www.fcc.gov/oet/ea/fccid)
3. Check serial numbers against manufacturer databases to verify country of origin
4. Review the Department of Commerce Entity List and the FCC Covered List
5. For ICs/chipsets, verify the fab location (TSMC Taiwan, Samsung South Korea, Intel USA, GlobalFoundries USA — all acceptable)
6. Maintain a hardware provenance log for every device purchased

**Banned vendors (non-exhaustive):** Huawei, ZTE, Hikvision, Dahua, Hytera, China Telecom, China Mobile, China Unicom, Kaspersky, TP-Link (China-headquartered models), any subsidiary or rebrand of the above.

### IRON RULE 2: NO OPENAI — EVER

No OpenAI APIs, models, services, embeddings, or dependencies anywhere in the stack. Not for search. Not for summarization. Not for features. Not for testing. Not for anything. This is permanent and unconditional.

### IRON RULE 3: NO ANTHROPIC — AFTER BUILD PHASE

Anthropic tools (Claude) may be used during development and build phases only. Once the system enters production deployment, all Anthropic dependencies must be removed. The running system must contain zero references to Anthropic services.

### IRON RULE 4: ZERO AI SERVICE DEPENDENCIES IN PRODUCTION

The production system must function with **ZERO** external AI API calls. All application logic is deterministic code — conditionals, queries, RBAC rules, search indexes. No LLM APIs, no cloud AI services, no ML inference endpoints. If it can't run on a machine with no internet connection, it doesn't ship.

### IRON RULE 5: PHYSICALLY AND LOGICALLY SEPARATE

KDT Vault operates on its own dedicated machine, its own network segment, its own credentials, and its own data stores. Zero shared databases, zero shared authentication tokens, zero shared secrets with any non-compliant KDT system. Complete isolation.

### IRON RULE 6: QUANTUM-RESISTANT CRYPTOGRAPHY

Implement NIST Post-Quantum Cryptography standards NOW in hybrid mode:
- **ML-KEM / Kyber** for key encapsulation
- **ML-DSA / Dilithium** for digital signatures
- **SLH-DSA / SPHINCS+** for hash-based signatures

Use hybrid mode (classical + post-quantum) until PQC-only is proven safe for production. When KDT's blockchain quantum-lock becomes available, integrate it as an additional encryption layer (defense in depth).

### IRON RULE 7: COMPLIANCE FIRST

Every architectural decision must reference the NIST SP 800-171 control family it satisfies. If a feature doesn't serve compliance, it doesn't ship. Compliance is not a checkbox — it is the product.

---

## 1. Executive Summary

### What KDT Vault Is

KDT Vault is a self-hosted, compliance-first document management system purpose-built for handling Controlled Unclassified Information (CUI) under U.S. Department of Defense contracts. It replaces Google Drive, SharePoint, and all third-party cloud document storage with a system KDT fully owns, operates, and controls.

### Why Self-Hosted

| Concern | Cloud (Google/Microsoft/Box) | KDT Vault |
|---|---|---|
| Data sovereignty | Third-party servers, unknown jurisdiction | KDT-owned hardware, KDT-controlled location |
| Supply chain risk | Unknown subprocessors, data sharing | Full hardware/software provenance |
| Compliance burden | Shared responsibility model, limited visibility | Full control, full auditability |
| AI processing risk | Vendors may use data for training | Zero AI dependencies — impossible to leak |
| Third-party breach risk | Single breach exposes all tenants | Isolated, single-tenant, air-gap capable |

**There is no compliant cloud alternative that matches the control profile of self-hosting.** FedRAMP IL4/IL5 environments exist but introduce third-party risk that KDT eliminates by owning the stack.

### Target Compliance

- **Primary:** CMMC Level 2 — all 110 practices derived from NIST SP 800-171 Rev 2
- **Architecture supports:** CMMC Level 3 readiness (NIST SP 800-172 enhanced controls)
- **Regulatory:** DFARS 252.204-7012 (Safeguarding Covered Defense Information)
- **Supplementary:** NIST SP 800-53 Rev 5 (selected controls), FIPS 140-3 (cryptographic modules), FIPS 199 (security categorization)

### Strategy

KDT's only customer is the United States government. Competitors cut corners on compliance. KDT does not. Every architectural decision in this document exists to make KDT Vault the most provably compliant document management system an assessor has ever reviewed. Compliance is the competitive moat.

---

## 2. Supply Chain Security (NDAA Section 889 Compliance)

**NIST 800-171 Controls:** 3.4.1, 3.4.2, 3.4.8, 3.11.2, 3.11.3

### 2.1 Approved Hardware Vendors

| Vendor | Country | Components |
|---|---|---|
| Apple | USA (designed), TSMC Taiwan (fabricated) | Mac Studio, M-series chips |
| Intel | USA | CPUs (if x86 needed) |
| AMD | USA | CPUs, GPUs (if needed) |
| Samsung | South Korea | SSDs, RAM, external storage |
| Western Digital | USA | HDDs, SSDs |
| Seagate | USA | HDDs, SSDs |
| Crucial / Micron | USA | RAM, SSDs |
| OWC (Other World Computing) | USA | External storage, docks |
| APC (Schneider Electric) | USA/France | UPS systems |
| CyberPower | USA | UPS systems |
| Ubiquiti | USA | Network equipment |
| Cisco | USA | Network equipment |
| Axis Communications | Sweden | Security cameras |
| Verkada | USA | Security cameras |
| Rhombus | USA | Security cameras |
| Yubico | Sweden/USA | YubiKey hardware tokens |

### 2.2 Banned Vendors (Comprehensive)

**Permanently banned — no exceptions, no components, no firmware:**

- Huawei Technologies (and all subsidiaries: HiSilicon, Honor post-2020)
- ZTE Corporation
- Hikvision (Hangzhou Hikvision Digital Technology)
- Dahua Technology
- Hytera Communications
- China Telecom, China Mobile, China Unicom
- Lenovo (server components only — consumer products case-by-case, but default deny)
- TP-Link (China-headquartered; use Ubiquiti instead)
- Kaspersky Lab (Russian; banned by DHS Binding Operational Directive 17-01)
- Any company appearing on the FCC Covered List (47 CFR § 1.50002)
- Any company on the Department of Commerce Entity List with PRC nexus

### 2.3 Hardware Verification Checklist

For **every** piece of hardware purchased for KDT Vault:

- [ ] **Manufacturer verification:** Confirm headquarters location via SEC filings or official registration
- [ ] **FCC ID lookup:** Check [fcc.gov/oet/ea/fccid](https://www.fcc.gov/oet/ea/fccid) — verify grantee is not a banned entity
- [ ] **Component origin:** For network equipment, verify chipsets are not sourced from banned vendors (check teardown reports if available)
- [ ] **Entity List check:** Search [commerce.gov/bis/entity-list](https://www.bis.doc.gov/index.php/policy-guidance/lists-of-parties-of-concern/entity-list) for the manufacturer
- [ ] **FCC Covered List check:** Verify at [fcc.gov/supplychain/coveredlist](https://www.fcc.gov/supplychain/coveredlist)
- [ ] **Serial number recorded:** Log serial number, purchase date, vendor, and model in the Hardware Provenance Register
- [ ] **Receipt retained:** Keep purchase receipt for 7 years (evidence for assessors)
- [ ] **Photograph:** Photo of device labels showing serial, model, and FCC ID — stored in Vault's compliance evidence folder

### 2.4 Software Supply Chain

**Dependency Scanning (every build, every release):**

```bash
# Node.js dependencies
npm audit --audit-level=high
npx socket scan              # Socket.dev deep analysis
npx snyk test                # Snyk vulnerability scan

# Docker images
docker scout cves <image>    # Docker Scout vulnerability scan
trivy image <image>          # Trivy container scanner

# SBOM generation (SPDX format for NIST compliance)
npx @cyclonedx/cyclonedx-npm --output-file sbom.json
```

**SBOM Requirements:**
- Generate a Software Bill of Materials (SBOM) in CycloneDX or SPDX format for every release
- SBOM must include: all npm packages, Docker base images, system libraries, and their versions
- SBOM is stored alongside the release artifact and included in compliance evidence
- Review SBOM for any package with maintainers or organizations in banned countries

**Dependency Rules:**
- No packages with known critical CVEs in production
- No packages from banned-country maintainers (verify via npm registry metadata)
- Pin all dependency versions (no `^` or `~` in package.json for production)
- Use `package-lock.json` with integrity hashes verified on every install
- Audit new dependencies before adding: check maintainer history, download stats, funding sources

---

## 3. Network Architecture — Air-Gap Ready

**NIST 800-171 Controls:** 3.1.3, 3.1.12, 3.1.13, 3.1.14, 3.13.1, 3.13.2, 3.13.5, 3.13.6, 3.13.8

### 3.1 Network Topology

```
                    ┌─────────────────────────────────────────┐
                    │            INTERNET                      │
                    └─────────────┬───────────────────────────┘
                                  │
                    ┌─────────────▼───────────────────────────┐
                    │     Ubiquiti Dream Machine Pro           │
                    │     (Firewall / Router / IDS/IPS)        │
                    │     ─────────────────────────            │
                    │     WAN: ISP uplink                      │
                    │     LAN: 192.168.1.0/24 (general)       │
                    │     VLAN 100: 10.100.0.0/24 (VAULT)     │
                    └──────┬──────────────┬───────────────────┘
                           │              │
              ┌────────────▼──┐    ┌──────▼───────────────────┐
              │  General LAN  │    │     VLAN 100 (VAULT)      │
              │  192.168.1.0  │    │     10.100.0.0/24         │
              │               │    │                            │
              │  KDT Macs     │    │  ┌──────────────────────┐ │
              │  Workstations │    │  │   Mac Studio          │ │
              │  Printers     │    │  │   10.100.0.10         │ │
              │               │    │  │   (KDT Vault Server)  │ │
              │  NO ACCESS    │    │  │   Wired Ethernet ONLY │ │
              │  TO VLAN 100  │    │  └──────────────────────┘ │
              └───────────────┘    │                            │
                                   │  Firewall Rules:           │
                                   │  ✅ 443 inbound (Tailscale)│
                                   │  ✅ DNS to filtered resolver│
                                   │  ❌ All other inbound       │
                                   │  ❌ Direct internet outbound│
                                   └────────────────────────────┘
                                              │
                                   ┌──────────▼─────────────────┐
                                   │      Tailscale Mesh VPN     │
                                   │      (WireGuard-based)      │
                                   │      End-to-end encrypted   │
                                   │                             │
                                   │  Authorized devices only    │
                                   │  ACLs restrict by user+role │
                                   └─────────────────────────────┘
```

### 3.2 Firewall Rules (VLAN 100)

| Direction | Port | Protocol | Source | Destination | Action | Purpose |
|---|---|---|---|---|---|---|
| Inbound | 443 | TCP | Tailscale subnet | Mac Studio | ALLOW | HTTPS access via Tailscale |
| Inbound | * | * | General LAN | VLAN 100 | DENY | Isolate Vault from office network |
| Outbound | 53 | UDP/TCP | Mac Studio | Controlled DNS (Pi-hole/NextDNS) | ALLOW | Filtered DNS resolution |
| Outbound | 443 | TCP | Mac Studio | Update proxy only | ALLOW | Controlled software updates |
| Outbound | * | * | Mac Studio | Internet | DENY | No direct internet access |

### 3.3 DNS Filtering

- Run Pi-hole or NextDNS on VLAN 100 as the sole DNS resolver
- Whitelist only: Tailscale coordination servers, ClamAV update servers, OS update servers
- Block all other outbound DNS — any unexpected DNS query triggers an alert
- Log all DNS queries for audit purposes

### 3.4 Tailscale Configuration

```
# tailscale ACL policy (tailscale admin console)
{
  "acls": [
    {
      "action": "accept",
      "src": ["group:vault-admins"],
      "dst": ["tag:vault-server:443"]
    },
    {
      "action": "accept",
      "src": ["group:vault-users"],
      "dst": ["tag:vault-server:443"]
    }
  ],
  "tagOwners": {
    "tag:vault-server": ["group:vault-admins"]
  },
  "groups": {
    "group:vault-admins": ["michael@kdt.com"],
    "group:vault-users": ["user1@kdt.com", "user2@kdt.com"]
  }
}
```

- Tailscale account must be **separate** from any personal or other KDT Tailscale accounts
- Enable Tailscale MagicDNS for internal name resolution
- Disable Tailscale SSH (use Vault's web interface only)
- Enable key expiry (90 days) — forces re-authentication

### 3.5 Air-Gap Mode (Optional — Maximum Security)

For highest-classification scenarios, KDT Vault can operate fully air-gapped:

1. Disconnect all network cables from the Mac Studio
2. Disable Wi-Fi and Bluetooth in macOS System Settings (Wi-Fi should already be unused)
3. Updates delivered via encrypted USB (sneakernet):
   - Download updates on a clean machine
   - Verify checksums (SHA-256 + PQC signature)
   - Transfer to FIPS-encrypted USB drive
   - Walk the USB to the Vault server
   - Scan USB with ClamAV before importing
4. Backups exported via encrypted USB to secure offsite storage
5. User access is local-only (physical presence required)

---

## 4. Authentication — Authentik Integration

**NIST 800-171 Controls:** 3.1.1, 3.1.2, 3.1.4, 3.1.5, 3.1.7, 3.1.8, 3.5.1, 3.5.2, 3.5.3, 3.5.4, 3.5.5, 3.5.6, 3.5.7, 3.5.8, 3.5.9, 3.5.10, 3.5.11

### 4.1 Architecture

Authentik runs as a separate Docker service on the Mac Studio with its own dedicated PostgreSQL instance (separate from the Vault database). Communication between KDT Vault and Authentik uses OIDC (OpenID Connect) over the Docker internal network.

```
┌─────────────────┐     OIDC      ┌──────────────────┐
│   KDT Vault     │◄────────────►│    Authentik      │
│   (Application) │               │    (IdP)          │
└────────┬────────┘               └────────┬──────────┘
         │                                  │
         ▼                                  ▼
┌─────────────────┐               ┌──────────────────┐
│  postgres-vault  │               │ postgres-authentik│
│  (Vault data)   │               │ (Auth data)       │
└─────────────────┘               └──────────────────┘
```

### 4.2 Multi-Factor Authentication (Mandatory — No Exceptions)

| Classification Level | Label | MFA Requirement |
|---|---|---|
| Level 1 | UNCLASSIFIED | TOTP (authenticator app — Authy, Google Authenticator, or Microsoft Authenticator) |
| Level 2 | CUI | TOTP + device trust (registered device with Authentik device enrollment) |
| Level 3 | CONFIDENTIAL | Hardware security key required (YubiKey 5 series / FIDO2) |
| Level 4 | SECRET | Hardware key + biometric verification + IP whitelist restriction |

**MFA enrollment is mandatory at account creation.** No user may access KDT Vault without completing MFA setup. Backup codes are generated at enrollment and must be stored securely by the user (not in KDT Vault itself).

### 4.3 Conditional Access Policies

| Policy | Implementation | NIST Control |
|---|---|---|
| **Geofencing** | Block all login attempts from non-US IP addresses. Use MaxMind GeoIP2 database (updated weekly). | 3.1.1, 3.1.2 |
| **Device trust** | Only approved devices (registered in Authentik) can access CUI and above. Device trust established via client certificate or Authentik outpost agent. | 3.1.1, 3.1.2 |
| **Impossible travel** | If two logins occur from locations >500 miles apart within 1 hour, block the second and alert admins. | 3.1.7 |
| **Session binding** | Session cookie bound to originating IP + geo-region. IP change = session invalidated. | 3.1.8 |
| **Time-of-day** | Optional per-role: restrict SECRET access to business hours (0800-1800 ET) unless override granted by admin. | 3.1.1 |

### 4.4 Password Policy (NIST SP 800-63B Compliant)

```
Minimum length:        12 characters
Maximum length:        128 characters (no arbitrary limits)
Complexity rules:      NONE (NIST 800-63B explicitly discourages complexity rules)
Forced rotation:       NONE (NIST 800-63B explicitly discourages periodic rotation)
Breach check:          REQUIRED — check against HaveIBeenPwned via k-anonymity API
                       (only first 5 chars of SHA-1 hash sent — no password exposure)
Blocked passwords:     Dictionary of 100,000+ common passwords blocked at enrollment
Unicode support:       Full UTF-8 — users may use any characters
Storage:               Argon2id with minimum: memory 64MB, iterations 3, parallelism 4
```

### 4.5 Account Lockout (Progressive)

| Failed Attempts | Lockout Duration | Action |
|---|---|---|
| 3 | Alert sent to admin (no lockout yet) | Monitoring |
| 5 | 5 minutes | Auto-unlock after timer |
| 10 | 15 minutes | Auto-unlock after timer |
| 15 | 1 hour | Auto-unlock after timer |
| 20 | Permanent until admin unlock | Admin notification + incident log |

All lockout events are recorded in the audit log with timestamp, source IP, and user agent.

### 4.6 Session Timeouts

| Classification | Idle Timeout | Absolute Timeout |
|---|---|---|
| UNCLASSIFIED | 2 hours | 12 hours |
| CUI | 1 hour | 8 hours |
| CONFIDENTIAL | 30 minutes | 4 hours |
| SECRET | 15 minutes | 2 hours |

Session timeout applies to the highest classification level the user accessed during the session, not their assigned clearance level.

### 4.7 Authentik Group-to-Role Mapping

| Authentik Group | KDT Vault Role | Clearance Level | Permissions |
|---|---|---|---|
| `vault-admins` | System Administrator | SECRET | Full system access, user management, config |
| `vault-managers` | Document Manager | CONFIDENTIAL | Upload, classify, manage documents in their unit |
| `vault-users` | Standard User | CUI | View/download documents at or below their clearance |
| `vault-auditors` | Auditor | SECRET (read-only) | Read-only access to all documents + full audit logs |
| `vault-readonly` | Read-Only | UNCLASSIFIED | View UNCLASSIFIED documents only |

### 4.8 User Provisioning / Deprovisioning

**Provisioning (New User):**
1. HR/manager submits access request (documented, signed)
2. Admin creates Authentik account with appropriate group membership
3. User completes MFA enrollment (in-person preferred for CUI+)
4. User acknowledges Acceptable Use Policy (AUP) — digitally signed, stored in Vault
5. Admin verifies device registration for device-trust policies
6. Access granted — first login recorded in audit log

**Deprovisioning (User Departure):**
1. HR/manager submits deprovisioning request
2. Admin disables Authentik account immediately (within 1 hour of notification)
3. All active sessions terminated
4. All API tokens revoked
5. User's device trust entries removed
6. Review audit log for any anomalous activity in final 30 days
7. Account retained (disabled) for 90 days for investigation purposes, then deleted
8. Deprovisioning completion logged in audit trail

### 4.9 Emergency Access (Break-Glass)

- Two break-glass accounts exist with full admin privileges
- Credentials stored in sealed envelopes in a physical safe (two-person access required)
- Break-glass login triggers immediate alert to all admins via email and SMS
- Every action taken under break-glass is logged with enhanced detail
- Post-incident review mandatory within 24 hours of break-glass use
- Break-glass credentials rotated after every use

---

## 5. Quantum-Resistant Cryptography

**NIST 800-171 Controls:** 3.13.8, 3.13.11, 3.13.16

### 5.1 Current Classical Implementation

| Purpose | Algorithm | Key Size | Standard |
|---|---|---|---|
| Encryption at rest | AES-256-GCM | 256-bit | FIPS 197, SP 800-38D |
| Encryption in transit | TLS 1.3 with X25519 | 256-bit equivalent | RFC 8446 |
| Digital signatures | Ed25519 | 256-bit | RFC 8032 |
| Password hashing | Argon2id | 256-bit output | RFC 9106 |
| File hashing | SHA-256 + SHA-3-256 | 256-bit | FIPS 180-4, FIPS 202 |

### 5.2 Post-Quantum Additions (Hybrid Mode)

**Hybrid mode = classical algorithm + PQC algorithm running in parallel.** Both must validate for the operation to succeed. This ensures security even if one algorithm is broken.

| Purpose | Classical | Post-Quantum | Combined |
|---|---|---|---|
| Key exchange | X25519 | ML-KEM-768 (Kyber) | X25519 + ML-KEM-768 hybrid |
| Document signatures | Ed25519 | ML-DSA-65 (Dilithium) | Ed25519 + ML-DSA-65 hybrid |
| Archive integrity | SHA-256 | SLH-DSA-SHA2-128s (SPHINCS+) | Dual-signed for long-term proof |
| Symmetric encryption | AES-256-GCM | N/A (quantum-safe at 256-bit) | AES-256-GCM (unchanged) |

**Why AES-256 is already quantum-safe:** Grover's algorithm reduces symmetric key search from 2^256 to 2^128 operations. A 128-bit quantum security level is still computationally infeasible.

### 5.3 Implementation Libraries

```bash
# Open Quantum Safe (liboqs) — C library with Node.js bindings
# https://openquantumsafe.org/

# Option A: oqs-provider for OpenSSL 3.x (system-level integration)
brew install liboqs
# Configure OpenSSL to use oqs-provider for TLS PQC cipher suites

# Option B: Node.js native bindings (application-level)
npm install liboqs-node    # If available, or use FFI bindings to liboqs

# Option C: PQClean reference implementations (audited, minimal)
# https://github.com/PQClean/PQClean — compile and link as needed
```

### 5.4 KDT Blockchain Quantum-Lock Integration

When KDT's blockchain quantum-lock technology becomes available:

1. **Integration point:** Additional encryption/verification layer on top of existing hybrid crypto
2. **Architecture:** Quantum-lock wraps the existing AES-256-GCM + ML-KEM encrypted blob
3. **Verification:** Documents can be verified against both the local PQC signature AND the blockchain quantum-lock
4. **Defense in depth:** Three layers — classical, PQC, blockchain quantum-lock
5. **API contract:** KDT Vault exposes a `POST /api/documents/:id/quantum-lock` endpoint that triggers blockchain registration

### 5.5 Migration Path

| Phase | Timeline | Action |
|---|---|---|
| Phase 1 (NOW) | 2026 Q2 | Deploy hybrid mode (classical + PQC) for all new documents |
| Phase 2 | 2026 Q4 | Retroactively sign all existing documents with PQC signatures |
| Phase 3 | 2027+ | Monitor NIST PQC standard finalization; begin PQC-only testing |
| Phase 4 | 2028+ | Transition to PQC-only when NIST and CNSA 2.0 confirm readiness |

### 5.6 CNSA 2.0 Alignment

NSA's Commercial National Security Algorithm Suite 2.0 timeline:

| Algorithm | CNSA 2.0 Deadline | KDT Vault Status |
|---|---|---|
| ML-KEM (Kyber) for key establishment | Prefer by 2025, require by 2030 | ✅ Hybrid mode in Phase 1 |
| ML-DSA (Dilithium) for signatures | Prefer by 2025, require by 2030 | ✅ Hybrid mode in Phase 1 |
| AES-256 for symmetric encryption | Already compliant | ✅ In use |
| SHA-384+ for hashing | Already compliant | ✅ SHA-256 + SHA-3 (exceeds) |
| XMSS/LMS for firmware signing | Prefer by 2025, require by 2030 | 📋 Planned for Phase 3 |

### 5.7 Annual Crypto Review

Every January, the designated Security Officer must:
1. Review NIST PQC announcements for algorithm changes or deprecations
2. Review NSA CNSA 2.0 updates
3. Assess published quantum computing milestones (IBM, Google, etc.)
4. Determine if PQC-only transition should accelerate
5. Document findings in the annual compliance report

---

## 6. Data Architecture

**NIST 800-171 Controls:** 3.1.1, 3.1.2, 3.1.3, 3.4.1, 3.4.2, 3.8.1, 3.8.2, 3.13.8, 3.13.16

### 6.1 Database Configuration

- **Engine:** PostgreSQL 16 with `pgcrypto` extension (FIPS-capable mode)
- **Instances:** Two completely separate PostgreSQL instances
  - `postgres-vault` — all Vault application data (documents, metadata, audit logs)
  - `postgres-authentik` — all Authentik identity data (users, groups, sessions, policies)
- **No cross-database queries, no shared roles, no shared connections**

### 6.2 Database Schema

```sql
-- ============================================================
-- KDT VAULT DATABASE SCHEMA
-- PostgreSQL 16 with pgcrypto
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE classification_level AS ENUM (
  'UNCLASSIFIED',
  'CUI',
  'CONFIDENTIAL',
  'SECRET'
);

CREATE TYPE user_role AS ENUM (
  'system_admin',
  'document_manager',
  'standard_user',
  'auditor',
  'read_only'
);

CREATE TYPE audit_action AS ENUM (
  'auth_login',
  'auth_logout',
  'auth_failed',
  'auth_mfa_failed',
  'auth_lockout',
  'auth_break_glass',
  'file_upload',
  'file_download',
  'file_view',
  'file_update',
  'file_delete',
  'file_classify',
  'file_declassify',
  'file_share',
  'perm_grant',
  'perm_revoke',
  'perm_change',
  'user_create',
  'user_disable',
  'user_delete',
  'user_role_change',
  'admin_config_change',
  'admin_backup',
  'admin_restore',
  'search_query',
  'bulk_download',
  'classification_downgrade'
);

-- ============================================================
-- USERS (synced from Authentik via OIDC claims)
-- ============================================================

CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  authentik_id      TEXT UNIQUE NOT NULL,          -- OIDC subject claim
  email             TEXT UNIQUE NOT NULL,
  display_name      TEXT NOT NULL,
  role              user_role NOT NULL DEFAULT 'read_only',
  clearance_level   classification_level NOT NULL DEFAULT 'UNCLASSIFIED',
  is_active         BOOLEAN NOT NULL DEFAULT true,
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deactivated_at    TIMESTAMPTZ
);

CREATE INDEX idx_users_authentik_id ON users(authentik_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- ============================================================
-- FOLDERS
-- ============================================================

CREATE TABLE folders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  parent_id           UUID REFERENCES folders(id) ON DELETE CASCADE,
  classification      classification_level NOT NULL DEFAULT 'UNCLASSIFIED',
  owner_id            UUID NOT NULL REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(parent_id, name)
);

CREATE INDEX idx_folders_parent ON folders(parent_id);
CREATE INDEX idx_folders_owner ON folders(owner_id);
CREATE INDEX idx_folders_classification ON folders(classification);

-- ============================================================
-- DOCUMENTS (metadata — actual files in content-addressed storage)
-- ============================================================

CREATE TABLE documents (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename              TEXT NOT NULL,
  mime_type             TEXT NOT NULL,
  file_size_bytes       BIGINT NOT NULL,
  sha256_hash           TEXT NOT NULL,           -- SHA-256 of plaintext
  sha3_256_hash         TEXT NOT NULL,           -- SHA-3-256 of plaintext (quantum resistance)
  encrypted_storage_key TEXT NOT NULL,           -- Path/key in content-addressed store
  classification        classification_level NOT NULL DEFAULT 'UNCLASSIFIED',
  folder_id             UUID REFERENCES folders(id) ON DELETE SET NULL,
  uploaded_by           UUID NOT NULL REFERENCES users(id),
  version               INTEGER NOT NULL DEFAULT 1,
  parent_version_id     UUID REFERENCES documents(id),  -- version chain
  is_deleted            BOOLEAN NOT NULL DEFAULT false,
  deleted_at            TIMESTAMPTZ,
  deleted_by            UUID REFERENCES users(id),

  -- PQC signature columns
  classical_signature   TEXT NOT NULL,           -- Ed25519 signature of file hash
  pqc_signature         TEXT,                    -- ML-DSA-65 (Dilithium) signature of file hash
  pqc_signature_algo    TEXT DEFAULT 'ML-DSA-65',
  archive_signature     TEXT,                    -- SLH-DSA (SPHINCS+) for long-term integrity
  archive_signature_algo TEXT DEFAULT 'SLH-DSA-SHA2-128s',

  -- Blockchain quantum-lock (future)
  quantum_lock_hash     TEXT,                    -- Blockchain reference hash (when available)
  quantum_lock_at       TIMESTAMPTZ,

  -- ClamAV scan
  av_scan_result        TEXT NOT NULL DEFAULT 'CLEAN',
  av_scan_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_folder ON documents(folder_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_classification ON documents(classification);
CREATE INDEX idx_documents_sha256 ON documents(sha256_hash);
CREATE INDEX idx_documents_sha3 ON documents(sha3_256_hash);
CREATE INDEX idx_documents_not_deleted ON documents(is_deleted) WHERE is_deleted = false;

-- ============================================================
-- DOCUMENT PERMISSIONS
-- ============================================================

CREATE TABLE document_permissions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  can_read        BOOLEAN NOT NULL DEFAULT false,
  can_write       BOOLEAN NOT NULL DEFAULT false,
  can_delete      BOOLEAN NOT NULL DEFAULT false,
  can_share       BOOLEAN NOT NULL DEFAULT false,
  granted_by      UUID NOT NULL REFERENCES users(id),
  granted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,
  UNIQUE(document_id, user_id)
);

CREATE INDEX idx_doc_perms_document ON document_permissions(document_id);
CREATE INDEX idx_doc_perms_user ON document_permissions(user_id);

-- ============================================================
-- AUDIT LOG (append-only — see Section 8)
-- ============================================================

CREATE TABLE audit_log (
  id                      BIGSERIAL PRIMARY KEY,
  timestamp_utc           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id                 UUID REFERENCES users(id),
  session_id              TEXT,
  action                  audit_action NOT NULL,
  resource_type           TEXT,                    -- 'document', 'folder', 'user', 'system'
  resource_id             UUID,
  resource_classification classification_level,
  source_ip               INET NOT NULL,
  user_agent              TEXT,
  result                  TEXT NOT NULL DEFAULT 'success',  -- 'success' or 'failure'
  details_json            JSONB,
  previous_hash           TEXT NOT NULL,            -- Hash of the previous log entry (chain integrity)
  entry_hash              TEXT NOT NULL             -- SHA-256 hash of this entry (including previous_hash)
);

CREATE INDEX idx_audit_timestamp ON audit_log(timestamp_utc);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_classification ON audit_log(resource_classification);
CREATE INDEX idx_audit_result ON audit_log(result) WHERE result = 'failure';

-- ============================================================
-- SESSIONS
-- ============================================================

CREATE TABLE sessions (
  id              TEXT PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL,
  source_ip       INET NOT NULL,
  user_agent      TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  max_classification classification_level NOT NULL DEFAULT 'UNCLASSIFIED'
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_active ON sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ============================================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Users can only see documents at or below their clearance level
CREATE POLICY documents_classification_policy ON documents
  FOR SELECT
  USING (
    classification <= (
      SELECT clearance_level FROM users WHERE id = current_setting('app.current_user_id')::UUID
    )
    AND is_deleted = false
  );

-- Users can only see folders at or below their clearance level
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY folders_classification_policy ON folders
  FOR SELECT
  USING (
    classification <= (
      SELECT clearance_level FROM users WHERE id = current_setting('app.current_user_id')::UUID
    )
  );

-- ============================================================
-- AUDIT LOG PROTECTION
-- ============================================================

-- Create a restricted role for the audit log
CREATE ROLE vault_audit_writer;
GRANT INSERT ON audit_log TO vault_audit_writer;
GRANT USAGE ON SEQUENCE audit_log_id_seq TO vault_audit_writer;
-- NO UPDATE OR DELETE grants — append-only by design

-- Revoke dangerous permissions from application role
REVOKE UPDATE, DELETE ON audit_log FROM vault_app;
REVOKE TRUNCATE ON audit_log FROM vault_app;
```

### 6.3 Encryption Configuration

**Filesystem-level (macOS):**
- FileVault enabled on the Mac Studio's internal SSD (AES-256-XTS)
- Additional encrypted APFS volume for file storage (`diskutil apfs addVolume`)

**Application-level:**
- Every document encrypted with AES-256-GCM before writing to disk
- Encryption key derived per-document using HKDF-SHA-256 from a master key
- Master key stored in macOS Keychain (hardware-backed on Apple Silicon via Secure Enclave)
- Database connections use mutual TLS (client certificate + server certificate)

**Transparent Data Encryption (PostgreSQL):**
- Use filesystem-level encryption via encrypted APFS volume (PostgreSQL data directory on encrypted volume)
- All WAL (Write-Ahead Log) files also on encrypted volume
- pg_hba.conf requires `hostssl` for all connections — no unencrypted connections permitted

### 6.4 Query Security

- **ALL** queries use parameterized statements (prepared statements or query builder with parameter binding)
- Zero string concatenation in SQL queries — enforced by code review and linting
- Database user `vault_app` has minimum required privileges (no SUPERUSER, no CREATEDB)
- Connection pooling via PgBouncer with TLS, if needed for performance

---

## 7. File Storage & Encryption

**NIST 800-171 Controls:** 3.1.3, 3.8.1, 3.8.2, 3.8.3, 3.8.4, 3.8.5, 3.8.6, 3.8.7, 3.8.8, 3.8.9, 3.13.8, 3.13.10, 3.13.11, 3.13.16

### 7.1 Content-Addressed Storage

Files are stored by their content hash, not by filename. This enables deduplication, integrity verification, and efficient versioning.

```
Storage path: /vault/storage/<sha256_prefix_2>/<sha256_prefix_4>/<sha256_full>.enc

Example:
/vault/storage/a3/a3f2/a3f2b4c8d9e1f0a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5.enc
```

- Dual-hash: SHA-256 (storage path) + SHA-3-256 (integrity verification)
- If hashes diverge during retrieval, the file is flagged as potentially corrupted and quarantined

### 7.2 File Upload Pipeline

```
Client Upload
      │
      ▼
┌─────────────┐
│  1. RECEIVE  │  Validate file size (<500MB default), MIME type whitelist
│              │  NIST: 3.13.8 (transmission confidentiality)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  2. SCAN     │  ClamAV antivirus scan — reject if infected
│  (ClamAV)   │  NIST: 3.14.1, 3.14.2 (malicious code protection)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  3. HASH     │  Compute SHA-256 + SHA-3-256 of plaintext
│              │  NIST: 3.14.1 (system integrity)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  4. CLASSIFY │  Apply classification based on folder, user input, or policy
│              │  NIST: 3.8.1, 3.8.2 (media protection)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  5. ENCRYPT  │  AES-256-GCM encryption with per-document derived key
│              │  NIST: 3.13.11 (cryptographic protection)
└──────┬──────┘
       │
       ▼
┌──────────────┐
│  6. SIGN     │  Ed25519 + ML-DSA-65 (Dilithium) hybrid signature
│  (PQC)       │  NIST: 3.13.11, future-proofing per CNSA 2.0
└──────┬───────┘
       │
       ▼
┌─────────────┐
│  7. STORE    │  Write encrypted blob to content-addressed storage
│              │  NIST: 3.8.1 (media protection)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  8. INDEX    │  Add metadata to Meilisearch (filename, tags — NOT content)
│ (Meilisearch)│  NIST: 3.8.2 (media access)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  9. AUDIT    │  Write audit log entry with file hash, user, timestamp
│   LOG        │  NIST: 3.3.1, 3.3.2 (audit events)
└─────────────┘
```

### 7.3 File Download Pipeline

```
Download Request
      │
      ▼
┌──────────────┐
│ 1. AUTH CHECK │  Verify session is valid, user is authenticated
│               │  NIST: 3.5.1, 3.5.2
└──────┬───────┘
       │
       ▼
┌───────────────┐
│ 2. CLEARANCE  │  Verify user clearance >= document classification
│    CHECK      │  NIST: 3.1.1, 3.1.2
└──────┬────────┘
       │
       ▼
┌───────────────┐
│ 3. PERMISSION │  Verify explicit permission (RLS + document_permissions)
│    CHECK      │  NIST: 3.1.3
└──────┬────────┘
       │
       ▼
┌───────────────┐
│ 4. AUDIT LOG  │  Record download attempt (before serving — even if it fails later)
│               │  NIST: 3.3.1
└──────┬────────┘
       │
       ▼
┌──────────────┐
│ 5. DECRYPT   │  AES-256-GCM decryption with document's derived key
│              │  NIST: 3.13.11
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 6. VERIFY    │  Verify SHA-256 + SHA-3 hashes match stored values
│   INTEGRITY  │  Verify Ed25519 + ML-DSA-65 signatures
│              │  NIST: 3.14.1
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 7. WATERMARK │  For CONFIDENTIAL+: embed invisible digital watermark
│  (optional)  │  containing user ID, timestamp, document ID
│              │  NIST: 3.1.7 (accountability)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 8. STREAM    │  Stream decrypted file to client over TLS
│              │  NIST: 3.13.8
└──────────────┘
```

### 7.4 Digital Watermarking

For CONFIDENTIAL and above documents:
- **Invisible watermark** embedded in PDFs using steganographic techniques (e.g., subtle spacing/font adjustments)
- **Watermark payload:** `{user_id}:{document_id}:{timestamp_utc}:{session_id}`
- **Purpose:** If a classified document leaks, the watermark identifies who downloaded it and when
- **Implementation:** Use a Node.js PDF manipulation library (pdf-lib) to embed invisible metadata and micro-adjustments

### 7.5 Data Loss Prevention (DLP)

| Classification | DLP Controls |
|---|---|
| UNCLASSIFIED | No restrictions |
| CUI | Download logging, watermark optional |
| CONFIDENTIAL | Mandatory watermark, clipboard interception via web viewer, print warning |
| SECRET | Mandatory watermark, no download (view-only in secure web viewer), print disabled, screenshot warning via CSS |

**Web Viewer for SECRET documents:**
- Documents rendered server-side as images (not PDFs) and streamed to a secure viewer
- No right-click context menu, no browser print dialog
- CSS to discourage screenshots: `user-select: none; -webkit-user-select: none;`
- Canvas-based rendering (harder to scrape than DOM text)
- Note: Client-side DLP is not foolproof (users can photograph screens) — the watermark provides traceability

---

## 8. Audit & Accountability (NIST AU Family)

**NIST 800-171 Controls:** 3.3.1, 3.3.2, 3.3.3, 3.3.4, 3.3.5, 3.3.6, 3.3.7, 3.3.8, 3.3.9

### 8.1 Append-Only Audit Log

The audit log is the most critical compliance artifact. It must be:
- **Append-only:** The `vault_audit_writer` PostgreSQL role has INSERT only — no UPDATE, DELETE, or TRUNCATE
- **Hash-chained:** Each entry includes the SHA-256 hash of the previous entry, creating an immutable chain
- **Complete:** Every security-relevant action is logged without exception

### 8.2 Auditable Events

| Category | Events Logged |
|---|---|
| **Authentication** | Login success, login failure, MFA failure, logout, session timeout, account lockout, break-glass activation |
| **File Operations** | Upload, download, view, update, delete (soft), restore, share, unshare |
| **Classification** | Classify, reclassify, upgrade, downgrade (requires justification) |
| **Permissions** | Grant access, revoke access, change role, change clearance level |
| **Administration** | Config change, user create/disable/delete, backup initiated, restore initiated |
| **Search** | Every search query (with results count, not content) |
| **Anomalies** | Bulk download detected, after-hours access, impossible travel, unusual file access patterns |

### 8.3 Log Entry Structure

```json
{
  "id": 12847,
  "timestamp_utc": "2026-04-06T14:23:17.842Z",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "session_id": "sess_abc123def456",
  "action": "file_download",
  "resource_type": "document",
  "resource_id": "d4e5f6a7-b8c9-0123-4567-89abcdef0123",
  "resource_classification": "CUI",
  "source_ip": "100.64.0.15",
  "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
  "result": "success",
  "details_json": {
    "filename": "contract-2026-Q1-review.pdf",
    "file_size_bytes": 2847361,
    "watermark_applied": true,
    "download_method": "browser"
  },
  "previous_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "entry_hash": "a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a"
}
```

### 8.4 Hash Chain Integrity

```javascript
// Pseudocode for hash chain generation
function createAuditEntry(entry) {
  const previousEntry = getLastAuditEntry();
  entry.previous_hash = previousEntry ? previousEntry.entry_hash : GENESIS_HASH;
  
  const entryData = JSON.stringify({
    timestamp_utc: entry.timestamp_utc,
    user_id: entry.user_id,
    session_id: entry.session_id,
    action: entry.action,
    resource_type: entry.resource_type,
    resource_id: entry.resource_id,
    resource_classification: entry.resource_classification,
    source_ip: entry.source_ip,
    result: entry.result,
    details_json: entry.details_json,
    previous_hash: entry.previous_hash
  });
  
  entry.entry_hash = sha256(entryData);
  
  // INSERT only — no UPDATE possible
  await db.query('INSERT INTO audit_log (...) VALUES (...)', entry);
}
```

**Daily integrity verification:**
```bash
# Cron job runs at 02:00 UTC daily
# Walks the entire hash chain and verifies each entry
# If any entry's hash doesn't match, alert immediately
# Script: /vault/scripts/verify-audit-chain.sh
```

### 8.5 Log Retention

| Retention Period | Requirement |
|---|---|
| **Minimum: 3 years** | NIST 800-171 requirement (3.3.1) |
| **Recommended: 7 years** | Aligns with federal record retention schedules |
| **Daily export** | Encrypted (GPG + PQC signed) export to separate storage |
| **Monthly archive** | Compressed, encrypted monthly archive to offsite storage |

### 8.6 Real-Time Alerting

| Trigger | Threshold | Alert Method | NIST Control |
|---|---|---|---|
| Failed authentication | > 3 attempts in 5 minutes | Email + SMS to admins | 3.3.5 |
| Classification downgrade | Any occurrence | Email to Security Officer + admins | 3.3.5 |
| Bulk download | > 10 files in 5 minutes by single user | Email + SMS to admins | 3.3.5 |
| Admin account usage | Any admin login | Email to Security Officer | 3.3.5 |
| After-hours SECRET access | SECRET doc accessed outside 0800-1800 ET | Email + SMS to Security Officer | 3.3.5 |
| Break-glass activation | Any occurrence | Email + SMS + phone call to all admins | 3.3.5 |
| Hash chain integrity failure | Any occurrence | Email + SMS + phone call — treat as incident | 3.3.5 |
| New device login | User logs in from unregistered device | Email to user + admin notification | 3.3.5 |

**Alert implementation:** Node.js sends alerts via:
- **Email:** SMTP to a KDT-controlled mail server (not Gmail/Outlook)
- **SMS:** Twilio API (US-based, SOC 2 compliant) or Amazon SNS
- **Webhook:** POST to a KDT-internal monitoring endpoint

### 8.7 SIEM Integration

Audit logs can be exported in syslog format (RFC 5424) for integration with enterprise SIEM platforms:
- Splunk
- Elastic Stack (ELK)
- Wazuh (open-source, self-hosted)

```
# Syslog output format
<134>1 2026-04-06T14:23:17.842Z kdt-vault vault-audit - - [meta action="file_download" user="michael@kdt.com" resource="d4e5f6a7" classification="CUI" result="success"]
```

---

## 9. Backup & Disaster Recovery

**NIST 800-171 Controls:** 3.8.9, 3.12.3, 3.13.11

### 9.1 Backup Strategy

| Component | Method | Frequency | Encryption | Retention |
|---|---|---|---|---|
| PostgreSQL (Vault) | `pg_dump` → GPG encrypt → PQC sign | Daily at 01:00 UTC | AES-256 (GPG) + ML-DSA-65 | 30 daily, 12 monthly, 7 yearly |
| PostgreSQL (Authentik) | `pg_dump` → GPG encrypt → PQC sign | Daily at 01:15 UTC | AES-256 (GPG) + ML-DSA-65 | 30 daily, 12 monthly, 7 yearly |
| File storage | `rsync` to encrypted external SSD | Daily at 02:00 UTC | AES-256 (APFS encrypted volume) | Mirror + 30-day incremental |
| Audit logs | Separate encrypted export | Daily at 03:00 UTC | AES-256 (GPG) + ML-DSA-65 | 7 years |
| Docker configs | `tar` of compose + env files → encrypt | Weekly | AES-256 (GPG) | 12 monthly |
| Meilisearch index | `meilisearch` dump endpoint → encrypt | Daily at 01:30 UTC | AES-256 (GPG) | 7 daily |

### 9.2 Backup Script

```bash
#!/bin/bash
# /vault/scripts/backup.sh
# Runs daily via launchd (macOS) or cron

set -euo pipefail

BACKUP_DATE=$(date -u +%Y-%m-%d)
BACKUP_DIR="/vault/backups/daily/${BACKUP_DATE}"
OFFSITE_MOUNT="/Volumes/KDT-Vault-Backup"  # Encrypted external SSD
GPG_RECIPIENT="vault-backup@kdt.com"

mkdir -p "${BACKUP_DIR}"

# 1. PostgreSQL Vault backup
echo "[$(date -u)] Starting PostgreSQL Vault backup..."
docker exec postgres-vault pg_dump -U vault_user vault_db | \
  gpg --encrypt --recipient "${GPG_RECIPIENT}" --output "${BACKUP_DIR}/vault-db.sql.gpg"

# 2. PostgreSQL Authentik backup  
echo "[$(date -u)] Starting PostgreSQL Authentik backup..."
docker exec postgres-authentik pg_dump -U authentik authentik | \
  gpg --encrypt --recipient "${GPG_RECIPIENT}" --output "${BACKUP_DIR}/authentik-db.sql.gpg"

# 3. File storage rsync to encrypted external SSD
echo "[$(date -u)] Syncing file storage..."
rsync -av --delete /vault/storage/ "${OFFSITE_MOUNT}/storage/"

# 4. Audit log export
echo "[$(date -u)] Exporting audit logs..."
docker exec postgres-vault psql -U vault_user vault_db -c \
  "COPY (SELECT * FROM audit_log WHERE timestamp_utc >= NOW() - INTERVAL '1 day') TO STDOUT WITH CSV HEADER" | \
  gpg --encrypt --recipient "${GPG_RECIPIENT}" --output "${BACKUP_DIR}/audit-log-${BACKUP_DATE}.csv.gpg"

# 5. Generate SHA-256 checksums
echo "[$(date -u)] Generating checksums..."
cd "${BACKUP_DIR}" && sha256sum * > checksums.sha256

# 6. Sign checksums with PQC (ML-DSA-65)
# /vault/scripts/pqc-sign.sh "${BACKUP_DIR}/checksums.sha256"

# 7. Cleanup old backups (retain 30 daily)
find /vault/backups/daily -maxdepth 1 -type d -mtime +30 -exec rm -rf {} +

echo "[$(date -u)] Backup complete: ${BACKUP_DIR}"
```

### 9.3 Recovery Targets

| Metric | Target | Justification |
|---|---|---|
| **RTO (Recovery Time Objective)** | 4 hours | Time to restore full service from backup |
| **RPO (Recovery Point Objective)** | 24 hours | Maximum acceptable data loss (daily backups) |

### 9.4 Offsite Backup

- **Primary offsite:** Encrypted external SSD stored in a second physical location (another KDT office, or bank safe deposit box)
- **Rotation:** Two external SSDs in rotation — one at offsite location, one connected for backup. Swap weekly.
- **Transport:** SSDs transported in tamper-evident bags with chain of custody documented
- **Media:** Samsung T7 Shield or OWC Envoy Pro FX — encrypted SSDs, not HDDs (faster, more shock-resistant, more reliable)

### 9.5 Monthly Restoration Test

**Every first Monday of the month:**
1. Take the current offsite backup SSD
2. On a separate test machine (NOT the production Vault): restore the backup
3. Verify PostgreSQL data integrity (run queries, check row counts)
4. Verify file storage integrity (check SHA-256 checksums)
5. Verify audit log hash chain integrity
6. Document results in restoration test log (pass/fail, issues found, time to restore)
7. Log signed and filed in compliance evidence folder

---

## 10. Physical Security Requirements

**NIST 800-171 Controls:** 3.10.1, 3.10.2, 3.10.3, 3.10.4, 3.10.5, 3.10.6

### 10.1 The Mac Studio

| Specification | Requirement | Notes |
|---|---|---|
| **Model** | Apple Mac Studio | US-designed, TSMC-fabricated (allied nation) |
| **Chip** | M4 Max or higher | Apple Silicon — Secure Enclave for key storage |
| **RAM** | 64GB minimum | 128GB recommended for Docker workloads |
| **Storage** | 2TB internal SSD minimum | 4TB recommended — encrypted APFS |
| **External Storage** | OWC Envoy Pro FX or Samsung T7 Shield (x2) | Encrypted backup SSDs |
| **UPS** | APC Back-UPS Pro or CyberPower PFC | US-made, minimum 30 min runtime at full load |
| **WiFi** | DISABLED | Wired Ethernet only — no WiFi, no Bluetooth |
| **Display** | None required (headless server) | Connect monitor only for initial setup and maintenance |

**Why Mac Studio:**
- Apple Silicon Secure Enclave provides hardware-backed key storage
- macOS FileVault provides FIPS 140-2 validated full-disk encryption
- APFS encryption is transparent and performant
- M-series chips are US-designed with known, auditable supply chain (TSMC Taiwan)
- Native Docker support via Apple Virtualization framework
- Low power consumption (important for 24/7 server)

### 10.2 The Room

| Requirement | Specification | NIST Control |
|---|---|---|
| **Dedicated space** | Locked room or locked server cabinet — not shared with non-Vault equipment | 3.10.1 |
| **Access control** | Electronic badge reader or keypad with audit trail (e.g., Kisi, Brivo, or Verkada access control) | 3.10.1, 3.10.5 |
| **Windows** | None, or frosted/blocked. No line of sight to the server from outside. | 3.10.1 |
| **Climate** | 65-75°F (18-24°C), humidity 40-60% — HVAC or portable unit | 3.10.3 |
| **Fire protection** | Smoke detector + fire extinguisher (CO2 or clean agent — NOT water) | 3.10.3 |
| **Surveillance** | Security camera on the room door — Axis, Verkada, or Rhombus (NOT Chinese-made) | 3.10.2 |
| **Visitor log** | Physical sign-in sheet or electronic log for anyone who enters | 3.10.3, 3.10.4 |
| **Escort policy** | Non-cleared visitors must be escorted at all times in the server room | 3.10.4 |

### 10.3 Network Equipment

| Equipment | Approved Vendors | NOT Approved |
|---|---|---|
| **Router / Firewall** | Ubiquiti Dream Machine Pro, pfSense (on US-made hardware) | TP-Link, Netgear (China-assembled models), any NDAA-banned |
| **Managed Switch** | Ubiquiti UniFi Switch Pro, Cisco Catalyst | TP-Link, any unmanaged switch |
| **Ethernet Cabling** | Cat6a minimum, dedicated run to Mac Studio | Shared runs with general office |
| **WiFi** | NOT APPLICABLE — Vault is wired only | Any WiFi adapter on the Vault server |

### 10.4 Michael's Hardware Procurement Checklist

**Priority: HIGH — Purchase before deployment begins**

- [ ] **Mac Studio** purchased and unboxed
  - Verify: M4 Max or higher, 64GB+ RAM, 2TB+ SSD
  - Verify: Check Apple serial number at [checkcoverage.apple.com](https://checkcoverage.apple.com)
  - Record: Serial number, purchase date, Apple receipt → Hardware Provenance Register
- [ ] **Encrypted external SSDs (x2 minimum)**
  - OWC Envoy Pro FX or Samsung T7 Shield (1TB+)
  - One stays onsite (daily backup), one goes offsite (weekly swap)
- [ ] **UPS**
  - APC Back-UPS Pro 1500VA or CyberPower CP1500PFCLCD
  - Test: Verify 30+ min runtime at expected load
  - Record: Serial number → Hardware Provenance Register
- [ ] **Dedicated room or locked cabinet identified**
  - Must lock, must have controlled access
  - If cabinet: rated server cabinet with keyed lock (e.g., Tripp Lite SR42UB)
- [ ] **Electronic access control installed on room/cabinet**
  - Kisi, Brivo, or Verkada — with access logging
  - Minimum: keypad with PIN + audit trail
- [ ] **Security camera installed (non-Chinese)**
  - Axis M3085-V, Verkada CD52, or Rhombus R100
  - Covers room door, records 24/7, retained 30 days minimum
- [ ] **Dedicated VLAN configured (VLAN 100)**
  - On Ubiquiti Dream Machine Pro or equivalent
  - Firewall rules per Section 3.2 applied
  - Tested: confirm VLAN 100 cannot reach general LAN
- [ ] **Dedicated Ethernet run to Mac Studio**
  - Cat6a cable, direct from managed switch
  - Not shared with other devices
  - Labeled "VAULT — DO NOT DISCONNECT"
- [ ] **Tailscale account created**
  - Separate from any personal Tailscale accounts
  - SSO via KDT email domain (when available)
  - ACLs configured per Section 3.4
- [ ] **YubiKeys purchased (minimum 2 per admin)**
  - YubiKey 5 NFC or YubiKey 5C NFC
  - Primary key + backup key per person
  - Backup keys stored in a physical safe
- [ ] **Fire extinguisher in or near room**
  - CO2 or clean agent (Halotron) — NOT water, NOT dry chemical
  - Inspected annually

---

## 11. Deployment Architecture (Docker Compose)

**NIST 800-171 Controls:** 3.4.1, 3.4.2, 3.4.6, 3.4.7, 3.4.8, 3.4.9, 3.13.1, 3.13.2

### 11.1 Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network: vault-net              │
│                    (isolated, no internet)                │
│                                                          │
│  ┌──────────┐   ┌──────────────┐   ┌───────────────┐   │
│  │  Caddy    │──▶│  vault-app   │──▶│ postgres-vault│   │
│  │  :443     │   │  (Express)   │   │  :5432        │   │
│  └──────────┘   └──────┬───────┘   └───────────────┘   │
│       │                 │                                 │
│       │          ┌──────▼───────┐   ┌───────────────┐   │
│       │          │  meilisearch │   │    redis       │   │
│       │          │  :7700       │   │    :6379       │   │
│       │          └──────────────┘   └───────────────┘   │
│       │                                                  │
│       │          ┌──────────────┐   ┌───────────────────┐│
│       │          │   clamav     │   │ postgres-authentik ││
│       │          │   :3310      │   │ :5433             ││
│       │          └──────────────┘   └─────────┬─────────┘│
│       │                                       │          │
│       │          ┌──────────────┐   ┌─────────▼─────────┐│
│       └─────────▶│  authentik   │   │ authentik-worker  ││
│                  │  -server     │   │                   ││
│                  │  :9000       │   └───────────────────┘│
│                  └──────────────┘                        │
└─────────────────────────────────────────────────────────┘
```

### 11.2 Docker Compose Configuration

```yaml
# docker-compose.yml — KDT Vault Production Deployment
# Version: 2.0
# COMPLIANCE: NIST 800-171, CMMC Level 2

version: "3.9"

networks:
  vault-net:
    driver: bridge
    internal: true          # NO internet access for containers
    ipam:
      config:
        - subnet: 172.30.0.0/24

  caddy-external:
    driver: bridge           # Caddy needs limited external access for Tailscale

volumes:
  vault-postgres-data:
  authentik-postgres-data:
  redis-data:
  meilisearch-data:
  clamav-data:
  vault-storage:
  caddy-data:
  caddy-config:
  authentik-media:
  authentik-templates:

services:
  # ============================================================
  # CADDY — Reverse Proxy & TLS Termination
  # ============================================================
  caddy:
    image: caddy:2-alpine
    container_name: kdt-vault-caddy
    restart: unless-stopped
    ports:
      - "443:443"
    networks:
      - caddy-external
      - vault-net
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-data:/data
      - caddy-config:/config
      - ./frontend/out:/srv/frontend:ro   # Static Next.js export
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 256M
    healthcheck:
      test: ["CMD", "caddy", "validate", "--config", "/etc/caddy/Caddyfile"]
      interval: 30s
      timeout: 5s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"

  # ============================================================
  # VAULT-APP — Node.js/Express Backend
  # ============================================================
  vault-app:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: kdt-vault-app
    restart: unless-stopped
    networks:
      - vault-net
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://vault_user:${VAULT_DB_PASSWORD}@postgres-vault:5432/vault_db?sslmode=require
      - REDIS_URL=redis://redis:6379/0
      - MEILISEARCH_URL=http://meilisearch:7700
      - MEILISEARCH_KEY=${MEILISEARCH_MASTER_KEY}
      - CLAMAV_HOST=clamav
      - CLAMAV_PORT=3310
      - AUTHENTIK_ISSUER=https://auth.vault.kdt.local
      - AUTHENTIK_CLIENT_ID=${AUTHENTIK_CLIENT_ID}
      - AUTHENTIK_CLIENT_SECRET=${AUTHENTIK_CLIENT_SECRET}
      - STORAGE_PATH=/vault/storage
      - ENCRYPTION_MASTER_KEY=${ENCRYPTION_MASTER_KEY}
      - AUDIT_GENESIS_HASH=${AUDIT_GENESIS_HASH}
    volumes:
      - vault-storage:/vault/storage
    depends_on:
      postgres-vault:
        condition: service_healthy
      redis:
        condition: service_healthy
      meilisearch:
        condition: service_healthy
      clamav:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 2G
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', r => { process.exit(r.statusCode === 200 ? 0 : 1) })"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 30s
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "10"

  # ============================================================
  # POSTGRES-VAULT — Vault Database
  # ============================================================
  postgres-vault:
    image: postgres:16-alpine
    container_name: kdt-vault-postgres
    restart: unless-stopped
    networks:
      - vault-net
    environment:
      - POSTGRES_DB=vault_db
      - POSTGRES_USER=vault_user
      - POSTGRES_PASSWORD=${VAULT_DB_PASSWORD}
    volumes:
      - vault-postgres-data:/var/lib/postgresql/data
      - ./database/init-vault.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
      - ./database/ssl:/var/lib/postgresql/ssl:ro
    command: >
      postgres
        -c ssl=on
        -c ssl_cert_file=/var/lib/postgresql/ssl/server.crt
        -c ssl_key_file=/var/lib/postgresql/ssl/server.key
        -c log_connections=on
        -c log_disconnections=on
        -c log_statement=all
        -c log_duration=on
        -c shared_preload_libraries=pgcrypto
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 4G
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vault_user -d vault_db"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 15s
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "10"

  # ============================================================
  # POSTGRES-AUTHENTIK — Authentik Database (SEPARATE INSTANCE)
  # ============================================================
  postgres-authentik:
    image: postgres:16-alpine
    container_name: kdt-vault-postgres-authentik
    restart: unless-stopped
    networks:
      - vault-net
    environment:
      - POSTGRES_DB=authentik
      - POSTGRES_USER=authentik
      - POSTGRES_PASSWORD=${AUTHENTIK_DB_PASSWORD}
    volumes:
      - authentik-postgres-data:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 1G
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U authentik -d authentik"]
      interval: 10s
      timeout: 5s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"

  # ============================================================
  # REDIS — Session Cache + Authentik
  # ============================================================
  redis:
    image: redis:7-alpine
    container_name: kdt-vault-redis
    restart: unless-stopped
    networks:
      - vault-net
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ============================================================
  # MEILISEARCH — Search Index
  # ============================================================
  meilisearch:
    image: getmeili/meilisearch:v1.7
    container_name: kdt-vault-meilisearch
    restart: unless-stopped
    networks:
      - vault-net
    environment:
      - MEILI_MASTER_KEY=${MEILISEARCH_MASTER_KEY}
      - MEILI_ENV=production
      - MEILI_NO_ANALYTICS=true
    volumes:
      - meilisearch-data:/meili_data
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 1G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7700/health"]
      interval: 15s
      timeout: 5s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"

  # ============================================================
  # CLAMAV — Antivirus Scanning
  # ============================================================
  clamav:
    image: clamav/clamav:stable
    container_name: kdt-vault-clamav
    restart: unless-stopped
    networks:
      - vault-net
    volumes:
      - clamav-data:/var/lib/clamav
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 2G
    healthcheck:
      test: ["CMD", "clamdcheck"]
      interval: 60s
      timeout: 10s
      retries: 3
      start_period: 120s    # ClamAV takes time to load signatures
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ============================================================
  # AUTHENTIK — Identity Provider
  # ============================================================
  authentik-server:
    image: ghcr.io/goauthentik/server:2024.2
    container_name: kdt-vault-authentik
    restart: unless-stopped
    command: server
    networks:
      - vault-net
    environment:
      - AUTHENTIK_REDIS__HOST=redis
      - AUTHENTIK_REDIS__PASSWORD=${REDIS_PASSWORD}
      - AUTHENTIK_POSTGRESQL__HOST=postgres-authentik
      - AUTHENTIK_POSTGRESQL__USER=authentik
      - AUTHENTIK_POSTGRESQL__NAME=authentik
      - AUTHENTIK_POSTGRESQL__PASSWORD=${AUTHENTIK_DB_PASSWORD}
      - AUTHENTIK_SECRET_KEY=${AUTHENTIK_SECRET_KEY}
      - AUTHENTIK_ERROR_REPORTING__ENABLED=false
      - AUTHENTIK_DISABLE_UPDATE_CHECK=true
      - AUTHENTIK_AVATARS=none
    volumes:
      - authentik-media:/media
      - authentik-templates:/templates
    depends_on:
      postgres-authentik:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 1G
    healthcheck:
      test: ["CMD", "ak", "healthcheck"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"

  authentik-worker:
    image: ghcr.io/goauthentik/server:2024.2
    container_name: kdt-vault-authentik-worker
    restart: unless-stopped
    command: worker
    networks:
      - vault-net
    environment:
      - AUTHENTIK_REDIS__HOST=redis
      - AUTHENTIK_REDIS__PASSWORD=${REDIS_PASSWORD}
      - AUTHENTIK_POSTGRESQL__HOST=postgres-authentik
      - AUTHENTIK_POSTGRESQL__USER=authentik
      - AUTHENTIK_POSTGRESQL__NAME=authentik
      - AUTHENTIK_POSTGRESQL__PASSWORD=${AUTHENTIK_DB_PASSWORD}
      - AUTHENTIK_SECRET_KEY=${AUTHENTIK_SECRET_KEY}
      - AUTHENTIK_ERROR_REPORTING__ENABLED=false
    depends_on:
      postgres-authentik:
        condition: service_healthy
      redis:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 1G
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"
```

### 11.3 Environment Variables (.env)

```bash
# .env — KDT Vault Production Environment
# ⚠️ THIS FILE CONTAINS SECRETS — DO NOT COMMIT TO GIT
# Store in macOS Keychain or HashiCorp Vault for production

# PostgreSQL - Vault
VAULT_DB_PASSWORD=<generate-64-char-random>

# PostgreSQL - Authentik
AUTHENTIK_DB_PASSWORD=<generate-64-char-random>

# Redis
REDIS_PASSWORD=<generate-64-char-random>

# Meilisearch
MEILISEARCH_MASTER_KEY=<generate-64-char-random>

# Authentik
AUTHENTIK_SECRET_KEY=<generate-64-char-random>
AUTHENTIK_CLIENT_ID=<from-authentik-oidc-provider-setup>
AUTHENTIK_CLIENT_SECRET=<from-authentik-oidc-provider-setup>

# Vault App
ENCRYPTION_MASTER_KEY=<generate-from-macos-keychain-backed-key>
AUDIT_GENESIS_HASH=0000000000000000000000000000000000000000000000000000000000000000
```

**Generate secrets:**
```bash
# Generate cryptographically secure random strings
openssl rand -hex 32    # 64-character hex string for each secret
```

### 11.4 Container Security

- **No container runs as root.** All application containers use non-root users.
- **Read-only root filesystem** where possible (`read_only: true` in compose)
- **No privileged mode.** No `--privileged` flag on any container.
- **No capability escalation:** `security_opt: [no-new-privileges:true]`
- **Docker socket not mounted** in any container
- **Image pinning:** Use digest-pinned images (`image: postgres:16-alpine@sha256:...`) for production

---

## 12. Compliance Verification Checklist

**NIST 800-171 Controls:** All 14 families, all 110 controls

### 12.1 Pre-Deployment Verification

| # | NIST Family | Control Area | Verification Step | Evidence Required |
|---|---|---|---|---|
| 1 | **3.1 Access Control** | AC-1 through AC-22 | Verify RBAC enforced, clearance-based access working, session timeouts configured | Screenshots of Authentik policies, role mappings, timeout configs |
| 2 | **3.2 Awareness & Training** | AT-1 through AT-4 | Verify all users completed security awareness training | Signed training acknowledgments |
| 3 | **3.3 Audit & Accountability** | AU-1 through AU-9 | Verify audit log captures all events, hash chain intact, retention configured | Sample audit log entries, hash chain verification output |
| 4 | **3.4 Configuration Management** | CM-1 through CM-9 | Verify Docker configs baselined, SBOM generated, change management process documented | docker-compose.yml, SBOM file, change log |
| 5 | **3.5 Identification & Authentication** | IA-1 through IA-11 | Verify MFA enforced, password policy set, Authentik OIDC working | Authentik policy screenshots, test login with MFA |
| 6 | **3.6 Incident Response** | IR-1 through IR-8 | Verify incident response plan documented, contacts listed, 72-hour notification process defined | INCIDENT-RESPONSE-PLAN.md, contact list |
| 7 | **3.7 Maintenance** | MA-1 through MA-6 | Verify maintenance procedures documented, remote maintenance via Tailscale only | Maintenance log template, Tailscale ACL config |
| 8 | **3.8 Media Protection** | MP-1 through MP-9 | Verify encryption at rest (FileVault + app-level), secure disposal procedures | FileVault status, encryption config, disposal checklist |
| 9 | **3.9 Personnel Security** | PS-1 through PS-8 | Verify user provisioning/deprovisioning checklists, background check requirements documented | HR process docs, provisioning checklist |
| 10 | **3.10 Physical Protection** | PE-1 through PE-6 | Verify locked room, access control, camera, visitor log | Photos of room, access control config, camera footage sample |
| 11 | **3.11 Risk Assessment** | RA-1 through RA-3 | Verify risk assessment conducted, vulnerabilities identified and tracked | Risk assessment report, vulnerability scan results |
| 12 | **3.12 Security Assessment** | CA-1 through CA-3 | Verify self-assessment completed, POA&M created for any gaps | Self-assessment scorecard, POA&M document |
| 13 | **3.13 System & Comm Protection** | SC-1 through SC-16 | Verify TLS 1.3, PQC hybrid crypto, network segmentation, DNS filtering | TLS config, crypto config, VLAN config, firewall rules |
| 14 | **3.14 System & Info Integrity** | SI-1 through SI-7 | Verify ClamAV running, file integrity checks, security alerts configured | ClamAV status, integrity check logs, alert config |

### 12.2 Self-Assessment Scorecard

```
NIST 800-171 Self-Assessment Scorecard
Date: _______________
Assessor: _______________

Total Controls: 110
Controls Met: _____ / 110
Controls Partially Met: _____ / 110
Controls Not Met: _____ / 110

SPRS Score: _____ / 110
(Methodology: start at 110, subtract weighted values for unmet controls per DoD Assessment Methodology)

Family Breakdown:
  3.1  Access Control (22 controls):           _____ / 22
  3.2  Awareness & Training (3 controls):      _____ / 3
  3.3  Audit & Accountability (9 controls):    _____ / 9
  3.4  Configuration Management (9 controls):  _____ / 9
  3.5  Identification & Authentication (11):   _____ / 11
  3.6  Incident Response (3 controls):         _____ / 3
  3.7  Maintenance (6 controls):               _____ / 6
  3.8  Media Protection (9 controls):          _____ / 9
  3.9  Personnel Security (2 controls):        _____ / 2
  3.10 Physical Protection (6 controls):       _____ / 6
  3.11 Risk Assessment (3 controls):           _____ / 3
  3.12 Security Assessment (4 controls):       _____ / 4
  3.13 System & Comm Protection (16 controls): _____ / 16
  3.14 System & Info Integrity (7 controls):   _____ / 7
```

### 12.3 Evidence Collection Guide

For each control family, collect and store the following evidence in the Vault's `/compliance-evidence/` folder:

| Evidence Type | Format | Retention |
|---|---|---|
| Configuration screenshots | PNG/PDF | Until next assessment |
| Policy documents | PDF (signed) | 7 years |
| Audit log samples | CSV (encrypted) | 7 years |
| Network diagrams | PDF | Until next assessment |
| Training records | PDF (signed) | 7 years |
| Vulnerability scan reports | PDF | 3 years |
| Penetration test reports | PDF | 3 years |
| Backup restoration test logs | PDF | 3 years |
| Hardware provenance register | PDF/spreadsheet | Life of equipment + 3 years |
| Incident response records | PDF | 7 years |

### 12.4 POA&M Schedule

| Activity | Frequency | Owner |
|---|---|---|
| POA&M review and update | Monthly | Security Officer |
| New POA&M items from vulnerability scans | After each scan | Security Officer |
| POA&M items from self-assessment | Annually (or after assessment) | Security Officer |
| POA&M closure verification | Within 30 days of remediation | Security Officer + Admin |

### 12.5 Annual Assessment Calendar

| Month | Activity |
|---|---|
| **January** | Annual crypto algorithm review (quantum threat assessment) |
| **February** | Hardware supply chain re-verification |
| **March** | Full CMMC self-assessment begins |
| **April** | Self-assessment completion, SPRS score update |
| **May** | Penetration test (Q2) |
| **June** | Mid-year policy review |
| **July** | User access review (comprehensive) |
| **August** | Penetration test (Q3) |
| **September** | Architecture review |
| **October** | Training refresher for all users |
| **November** | Penetration test (Q4) |
| **December** | Annual compliance report, prepare for January cycle |

---

## 13. Incident Response (Summary)

**NIST 800-171 Controls:** 3.6.1, 3.6.2, 3.6.3

> **Full incident response procedures are documented in [INCIDENT-RESPONSE-PLAN.md](./INCIDENT-RESPONSE-PLAN.md)**

### 13.1 Critical Requirement: 72-Hour DoD Notification

Per **DFARS 252.204-7012**, KDT must report cyber incidents involving CUI to the DoD within **72 hours** of discovery.

**Reporting URL:** https://dibnet.dod.mil  
**Reporting steps:**
1. Preserve all evidence (do NOT modify or delete anything)
2. Isolate affected systems (disconnect network if necessary)
3. Document timeline of events
4. File report on DIBNet within 72 hours
5. Preserve forensic images for 90 days minimum
6. Cooperate with DoD Cyber Crime Center (DC3) investigation

### 13.2 Incident Response Team (Template)

| Role | Name | Phone | Email | Backup |
|---|---|---|---|---|
| Incident Commander | Michael Schulz | _________ | michael@kdt.com | _________ |
| Security Officer | _________ | _________ | _________ | _________ |
| System Administrator | _________ | _________ | _________ | _________ |
| Legal Counsel | _________ | _________ | _________ | _________ |
| Communications Lead | _________ | _________ | _________ | _________ |

### 13.3 Evidence Preservation Checklist

When an incident is detected:

- [ ] **DO NOT** power off the Mac Studio (volatile memory may contain evidence)
- [ ] Screenshot all active terminal sessions and open applications
- [ ] Capture full audit log export immediately
- [ ] Record the exact time of detection (UTC)
- [ ] Disconnect the Mac Studio from the network (pull Ethernet cable)
- [ ] Create a forensic disk image of the system drive (if possible without powering off)
- [ ] Export all Docker container logs: `docker compose logs > incident-logs-$(date -u +%Y%m%d%H%M%S).txt`
- [ ] Photograph the physical server room (check for unauthorized devices)
- [ ] Check access control logs for the room door
- [ ] Review Tailscale connection logs
- [ ] Document every action taken, by whom, and at what time
- [ ] Seal all evidence in tamper-evident bags if physical
- [ ] Retain all evidence for minimum 90 days (DFARS requirement)

---

## 14. Continuous Monitoring Plan

**NIST 800-171 Controls:** 3.12.1, 3.12.3, 3.14.1, 3.14.2, 3.14.3, 3.14.6, 3.14.7

### 14.1 Daily (Automated)

| Check | Method | Alert On Failure |
|---|---|---|
| Backup verification | `backup.sh` exit code + checksum verification | Email to admin |
| Audit log hash chain integrity | `verify-audit-chain.sh` | Email + SMS to Security Officer |
| ClamAV definition update | Docker healthcheck on clamav container | Email to admin |
| Disk space check | `df -h` thresholds (alert at 80%, critical at 90%) | Email to admin |
| Docker container health | `docker compose ps` — all containers healthy | Email to admin |
| TLS certificate expiry | Check cert expiry date (alert at 30 days) | Email to admin |
| Failed authentication count | Query audit log for auth_failed events in last 24h | Email if > 10 |

### 14.2 Weekly

| Check | Method | Owner |
|---|---|---|
| Failed auth review | Review all failed auth events, investigate patterns | Security Officer |
| Access anomaly review | Review unusual access patterns (after-hours, bulk, new devices) | Security Officer |
| Disk space trending | Review storage growth, project when capacity will be reached | Admin |
| Docker image vulnerability check | `docker scout cves` on all images | Admin |
| Tailscale connection review | Review Tailscale admin console for unauthorized devices | Admin |

### 14.3 Monthly

| Check | Method | Owner |
|---|---|---|
| Full backup restoration test | Restore to test environment, verify integrity | Admin |
| Dependency audit | `npm audit`, `snyk test`, `socket scan` | Admin |
| User access review | Verify all users still require their access level, disable unused accounts | Security Officer |
| macOS security updates | Check and apply pending OS updates (via controlled proxy) | Admin |
| UPS battery test | Run UPS self-test, verify runtime | Admin |
| Physical security inspection | Check lock, camera, visitor log, fire extinguisher | Security Officer |

### 14.4 Quarterly

| Check | Method | Owner |
|---|---|---|
| Penetration test | Self-conducted or contracted (using Vault's Tailscale endpoint) | Security Officer |
| Policy review | Review all security policies for relevance and completeness | Security Officer |
| Training refresher | Security awareness reminder for all users | Security Officer |
| SBOM regeneration | Regenerate full SBOM and compare against previous quarter | Admin |
| Firewall rule review | Verify VLAN 100 firewall rules, test isolation | Admin |

### 14.5 Annually

| Check | Method | Owner |
|---|---|---|
| Full CMMC self-assessment | Complete 110-control assessment, update SPRS score | Security Officer |
| Architecture review | Review this document against current threat landscape | Security Officer + Admin |
| Crypto algorithm review | Assess quantum computing milestones, review CNSA 2.0 updates | Security Officer |
| Hardware supply chain re-verification | Re-check all hardware against current Entity List and FCC Covered List | Admin |
| Incident response plan exercise | Tabletop exercise simulating a CUI breach | Full IR Team |
| Disaster recovery exercise | Full DR test — restore from offsite backup to new hardware | Admin |

---

## 15. Future-Proofing

### 15.1 KDT Blockchain Quantum-Lock Integration

**Integration architecture:**

```
Document Upload
      │
      ▼
  [Existing Pipeline: scan → hash → classify → encrypt → PQC sign → store]
      │
      ▼
  POST /api/documents/:id/quantum-lock
      │
      ▼
  ┌───────────────────────────────┐
  │  KDT Blockchain Service       │
  │  (separate service, separate  │
  │   network, API-only access)   │
  │                               │
  │  Input: document hash + PQC   │
  │         signature             │
  │  Output: blockchain tx hash   │
  │          + quantum-lock proof │
  └───────────────────────────────┘
      │
      ▼
  Store quantum_lock_hash + quantum_lock_at
  in documents table
      │
      ▼
  Verification: document can be verified against
  three independent proofs:
    1. Classical signature (Ed25519)
    2. PQC signature (ML-DSA-65)
    3. Blockchain quantum-lock
```

**Integration requirements:**
- KDT Blockchain service runs on a SEPARATE machine (not on the Vault server)
- Communication via authenticated API (mutual TLS)
- Quantum-lock is additive — it does NOT replace existing crypto, it adds a third verification layer
- If blockchain service is unavailable, documents are still protected by dual classical+PQC signatures
- Vault stores only the blockchain reference hash — no blockchain state on the Vault server

### 15.2 CMMC Level 3 Readiness

CMMC Level 3 adds NIST SP 800-172 enhanced security requirements. Key additions KDT Vault's architecture already supports or can easily extend to:

| 800-172 Enhanced Requirement | KDT Vault Readiness |
|---|---|
| Dual authorization for critical actions | ✅ Architecture supports (add approval workflow for classification changes) |
| Threat hunting capabilities | 📋 Add log analysis tooling (Wazuh SIEM) |
| Adversary-triggered incident response | 📋 Enhance IR plan with adversary TTPs |
| Supply chain risk management | ✅ Full NDAA Section 889 compliance |
| Cross-domain solution (if needed) | 📋 Mac Studio supports Parallels/UTM for VM isolation |
| Penetration testing by accredited third party | 📋 Contract with CMMC-accredited assessor |

### 15.3 FedRAMP Path

If KDT ever needs FedRAMP authorization (e.g., offering Vault as SaaS to other government contractors):

1. **Current state:** Self-hosted, single-tenant — FedRAMP not required
2. **If multi-tenant SaaS:** Would need FedRAMP Moderate (IL2) or FedRAMP High (IL4/IL5)
3. **Path forward:**
   - Engage a FedRAMP 3PAO (Third Party Assessment Organization)
   - Deploy to GovCloud (AWS GovCloud or Azure Government)
   - Achieve FedRAMP Authority to Operate (ATO)
   - Timeline: 12-18 months from decision to authorization
4. **Architecture advantage:** KDT Vault's compliance-first design means most FedRAMP controls are already met

### 15.4 Integration with KDT Super App

KDT Vault and the KDT Super App can share a single identity provider (Authentik) for SSO:

```
                   ┌───────────────┐
                   │   Authentik    │
                   │   (Shared IdP) │
                   └───┬───────┬───┘
                       │       │
              OIDC     │       │    OIDC
                       │       │
              ┌────────▼─┐  ┌──▼──────────┐
              │ KDT Vault │  │ KDT Super   │
              │ (CUI)     │  │ App (General)│
              └───────────┘  └─────────────┘
              Separate DB     Separate DB
              Separate Net    Separate Net
              VLAN 100        General LAN
```

**Rules for integration:**
- Authentik can be shared, but Vault's data and network remain completely isolated
- A user authenticated via shared SSO still needs explicit Vault role assignment
- SSO session in the Super App does NOT automatically grant Vault access
- Vault enforces its own MFA requirements regardless of Super App session state
- Zero data flows from Vault to Super App — information flows are one-way (identity only)

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| **CUI** | Controlled Unclassified Information — government information requiring safeguarding per 32 CFR Part 2002 |
| **CMMC** | Cybersecurity Maturity Model Certification — DoD's framework for assessing contractor cybersecurity |
| **DFARS** | Defense Federal Acquisition Regulation Supplement |
| **FIPS** | Federal Information Processing Standards |
| **ML-KEM** | Module-Lattice-based Key-Encapsulation Mechanism (formerly Kyber) — NIST PQC standard |
| **ML-DSA** | Module-Lattice-based Digital Signature Algorithm (formerly Dilithium) — NIST PQC standard |
| **SLH-DSA** | Stateless Hash-based Digital Signature Algorithm (formerly SPHINCS+) — NIST PQC standard |
| **NDAA** | National Defense Authorization Act |
| **OIDC** | OpenID Connect — authentication protocol built on OAuth 2.0 |
| **PQC** | Post-Quantum Cryptography |
| **RLS** | Row-Level Security — PostgreSQL feature for row-based access control |
| **SBOM** | Software Bill of Materials |
| **SPRS** | Supplier Performance Risk System — DoD's portal for contractor self-assessment scores |
| **CNSA 2.0** | Commercial National Security Algorithm Suite 2.0 — NSA's post-quantum algorithm guidance |

## Appendix B: Document Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-04-06 | KDT Engineering | Initial architecture document |
| 2.0 | 2026-04-06 | KDT Engineering | Complete rewrite: added Iron Rules, PQC cryptography, NDAA compliance, supply chain security, physical security requirements, Docker Compose deployment, comprehensive compliance checklists |

---

**END OF DOCUMENT**

*This document is classified CUI and must be handled in accordance with 32 CFR Part 2002. Distribution is limited to KDT personnel with a need-to-know for KDT Vault development, deployment, and assessment.*
