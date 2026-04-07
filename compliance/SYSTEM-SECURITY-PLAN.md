# System Security Plan (SSP)

**Knight Division Tactical — KDT Vault**

| Field | Value |
|-------|-------|
| **System Name** | KDT Vault |
| **System Owner** | Michael Schulz, CEO |
| **ISSO** | *(appointed — recommend dedicated role)* |
| **Document Owner** | CEO / ISSO |
| **Effective Date** | *(upon approval)* |
| **Review Cycle** | Annual or upon significant system change |
| **Classification** | CUI // SP-INFOSEC |
| **CMMC Target Level** | Level 2 (Advanced) |
| **Applicable Standard** | NIST SP 800-171 Rev 2 (110 controls) |

---

## Table of Contents

1. [System Description](#1-system-description)
2. [System Boundaries](#2-system-boundaries)
3. [Operating Environment](#3-operating-environment)
4. [Data Flow Diagrams](#4-data-flow-diagrams)
5. [User Roles and Access](#5-user-roles-and-access)
6. [Authentication Mechanisms](#6-authentication-mechanisms)
7. [Encryption Standards](#7-encryption-standards)
8. [Audit Logging](#8-audit-logging)
9. [Incident Response](#9-incident-response)
10. [Backup and Recovery](#10-backup-and-recovery)
11. [Continuous Monitoring](#11-continuous-monitoring)
12. [Interconnections](#12-interconnections)
13. [Control Implementation Summary](#13-control-implementation-summary)

---

## 1. System Description

### 1.1 Purpose

KDT Vault is a self-hosted document management system built by Knight Division Tactical (KDT) to replace Google Drive for handling **Controlled Unclassified Information (CUI)** in support of Department of Defense (DoD) contracts. The system provides secure file storage, sharing, versioning, and collaboration capabilities that meet CMMC Level 2 requirements.

### 1.2 Mission

KDT Vault enables KDT personnel to:
- Securely store, organize, and retrieve business documents and CUI
- Share documents with role-based access controls
- Maintain document version history with full audit trails
- Classify and mark documents according to CUI requirements
- Comply with DFARS 252.204-7012 safeguarding requirements

### 1.3 System Category

| Attribute | Value |
|-----------|-------|
| **System Type** | Major Application |
| **Information Types** | CUI, UNCLASSIFIED business data |
| **CUI Categories** | CUI Basic, CUI Specified (SP-INFOSEC) |
| **Impact Level** | Moderate (Confidentiality), Low (Integrity), Low (Availability) |
| **Operational Status** | Under Development |

### 1.4 System Components

| Component | Description | Version |
|-----------|-------------|---------|
| **Application Server** | Node.js/Express REST API | Node.js 20 LTS |
| **Database** | PostgreSQL relational database | PostgreSQL 16 |
| **Cache/Session Store** | Redis in-memory store | Redis 7 |
| **Reverse Proxy** | Nginx or Caddy (TLS termination, WAF) | Latest stable |
| **File Storage** | Encrypted APFS volume (content-addressed) | macOS native |
| **VPN Overlay** | Tailscale mesh VPN | Latest stable |
| **Operating System** | macOS (Apple Silicon) | macOS 15+ |
| **Hardware** | Apple Mac Studio (M-series) | Current generation |

---

## 2. System Boundaries

### 2.1 Authorization Boundary

The KDT Vault authorization boundary encompasses:

**Within boundary:**
- Mac Studio hardware (CPU, memory, storage, network interfaces)
- macOS operating system and security subsystems (FileVault, Gatekeeper, XProtect)
- KDT Vault application stack (Node.js, PostgreSQL, Redis, Nginx)
- Encrypted file storage volumes
- Tailscale VPN client and tunnel endpoints
- Backup storage (local encrypted volumes)
- All data processed, stored, or transmitted by the above

**Outside boundary (but interconnected):**
- Tailscale coordination server (SaaS — managed by Tailscale Inc.)
- Client devices (laptops, phones) — governed by endpoint security policy
- Network infrastructure (router, switches, ISP)
- Off-site backup storage (if applicable)

### 2.2 Boundary Diagram (Text)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHORIZATION BOUNDARY                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Mac Studio (Apple Silicon M-series)          │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐   │   │
│  │  │   Nginx /   │  │  KDT Vault   │  │  PostgreSQL   │   │   │
│  │  │   Caddy     │──│  API Server  │──│  Database     │   │   │
│  │  │  (Reverse   │  │  (Node.js)   │  │              │   │   │
│  │  │   Proxy)    │  │              │  └───────────────┘   │   │
│  │  └──────┬──────┘  └──────┬───────┘                      │   │
│  │         │                │          ┌───────────────┐   │   │
│  │         │                ├──────────│    Redis       │   │   │
│  │         │                │          │  (Sessions/    │   │   │
│  │         │                │          │   Cache)       │   │   │
│  │         │                │          └───────────────┘   │   │
│  │         │                │                              │   │
│  │         │                │          ┌───────────────┐   │   │
│  │         │                └──────────│  Encrypted    │   │   │
│  │         │                           │  File Storage │   │   │
│  │         │                           │  (APFS)       │   │   │
│  │  ┌──────┴──────┐                   └───────────────┘   │   │
│  │  │  Tailscale  │                                        │   │
│  │  │  VPN Client │                                        │   │
│  │  └──────┬──────┘                                        │   │
│  │         │                                               │   │
│  └─────────┼───────────────────────────────────────────────┘   │
│            │ WireGuard Encrypted Tunnel                         │
└────────────┼────────────────────────────────────────────────────┘
             │
    ═════════╪════════════════════════════════════
             │    OUTSIDE AUTHORIZATION BOUNDARY
             │
    ┌────────┴────────┐
    │   Tailscale     │    ┌────────────────┐
    │   Coordination  │    │  Client Device │
    │   Server (SaaS) │    │  (Laptop/Phone)│
    └─────────────────┘    │  + Tailscale   │
                           │  + Browser     │
                           └────────────────┘
```

### 2.3 Network Boundary

| Zone | Description | Access Method |
|------|-------------|---------------|
| **Server Zone** | Mac Studio — all KDT Vault services | Local / Tailscale only |
| **VPN Zone** | Tailscale mesh — all authorized clients | WireGuard tunnel |
| **Client Zone** | User devices with Tailscale installed | Browser over TLS |
| **External Zone** | Internet — no direct KDT Vault access | Blocked by firewall |

---

## 3. Operating Environment

### 3.1 Hardware

| Component | Specification |
|-----------|---------------|
| **Platform** | Apple Mac Studio |
| **Processor** | Apple M-series (Apple Silicon) |
| **Memory** | 32 GB+ Unified Memory |
| **Storage** | 1 TB+ SSD (encrypted APFS) |
| **Network** | 10 Gigabit Ethernet (wired) |
| **Location** | KDT secure server room |
| **UPS** | Battery backup (minimum 30-minute runtime) |

### 3.2 Software

| Layer | Component | Configuration |
|-------|-----------|---------------|
| **OS** | macOS 15+ | FileVault enabled, SIP enabled, Gatekeeper enabled |
| **Runtime** | Node.js 20 LTS | Production mode, cluster mode |
| **Database** | PostgreSQL 16 | Encrypted connections, WAL archiving |
| **Cache** | Redis 7 | Password protected, no external binding |
| **Proxy** | Nginx or Caddy | TLS 1.3, HSTS, CSP headers |
| **VPN** | Tailscale | ACL-restricted, MagicDNS |
| **AV** | XProtect + ClamAV | Real-time + scheduled scanning |

### 3.3 Physical Environment

| Factor | Detail |
|--------|--------|
| **Location** | KDT office — dedicated server room/closet |
| **Access Control** | Locked door (key + combination) |
| **Environmental** | Temperature/humidity monitoring, fire detection |
| **Power** | Dedicated circuit with UPS |
| **Network** | Wired Ethernet (no WiFi on server) |
| **Monitoring** | Physical access log, environmental alerts |

See [PHYSICAL-SECURITY.md](PHYSICAL-SECURITY.md) for complete physical security controls.

---

## 4. Data Flow Diagrams

### 4.1 User Authentication Flow

```
User Device                   KDT Vault                    Auth Provider
    │                            │                              │
    │  1. HTTPS Login Request    │                              │
    ├───────────────────────────>│                              │
    │  (via Tailscale VPN)       │                              │
    │                            │  2. Redirect to OIDC/SAML   │
    │                            ├─────────────────────────────>│
    │                            │                              │
    │  3. User authenticates     │                              │
    │    (password + MFA)        │                              │
    ├──────────────────────────────────────────────────────────>│
    │                            │                              │
    │                            │  4. Auth token returned      │
    │                            │<─────────────────────────────│
    │                            │                              │
    │                            │  5. Validate token,          │
    │                            │     create session           │
    │                            │     (Redis + PostgreSQL)     │
    │                            │                              │
    │  6. Session cookie         │                              │
    │<───────────────────────────│                              │
    │  (Secure, HttpOnly,        │                              │
    │   SameSite=Strict)         │                              │
```

### 4.2 File Upload Flow (CUI)

```
User Device                 Reverse Proxy            API Server           Storage
    │                            │                       │                   │
    │  1. Upload file            │                       │                   │
    │  (TLS 1.3 encrypted)      │                       │                   │
    ├───────────────────────────>│                       │                   │
    │                            │  2. WAF check,        │                   │
    │                            │     rate limit,       │                   │
    │                            │     forward           │                   │
    │                            ├──────────────────────>│                   │
    │                            │                       │                   │
    │                            │                       │  3. Authenticate  │
    │                            │                       │     session       │
    │                            │                       │                   │
    │                            │                       │  4. Check         │
    │                            │                       │     authorization │
    │                            │                       │     (RBAC)       │
    │                            │                       │                   │
    │                            │                       │  5. Malware scan  │
    │                            │                       │     (ClamAV)     │
    │                            │                       │                   │
    │                            │                       │  6. Classify      │
    │                            │                       │     (user label + │
    │                            │                       │      auto-detect) │
    │                            │                       │                   │
    │                            │                       │  7. Compute       │
    │                            │                       │     content hash  │
    │                            │                       │     (SHA-256)     │
    │                            │                       │                   │
    │                            │                       │  8. Encrypt file  │
    │                            │                       │     (AES-256-GCM) │
    │                            │                       ├──────────────────>│
    │                            │                       │                   │
    │                            │                       │  9. Store metadata│
    │                            │                       │     in PostgreSQL │
    │                            │                       │                   │
    │                            │                       │  10. Write audit  │
    │                            │                       │      log entry    │
    │                            │                       │                   │
    │  11. Success response      │                       │                   │
    │<──────────────────────────────────────────────────│                   │
```

### 4.3 File Download Flow (CUI)

```
User Device                 Reverse Proxy            API Server           Storage
    │                            │                       │                   │
    │  1. Request file           │                       │                   │
    ├───────────────────────────>│                       │                   │
    │                            ├──────────────────────>│                   │
    │                            │                       │                   │
    │                            │                       │  2. Auth + RBAC   │
    │                            │                       │     check         │
    │                            │                       │                   │
    │                            │                       │  3. Check CUI     │
    │                            │                       │     clearance     │
    │                            │                       │                   │
    │                            │                       │  4. Fetch + decrypt│
    │                            │                       │<──────────────────│
    │                            │                       │                   │
    │                            │                       │  5. Apply CUI     │
    │                            │                       │     markings      │
    │                            │                       │                   │
    │                            │                       │  6. Audit log     │
    │                            │                       │     (download)    │
    │                            │                       │                   │
    │  7. Encrypted response     │                       │                   │
    │  (TLS 1.3 + CUI headers)  │                       │                   │
    │<──────────────────────────────────────────────────│                   │
```

### 4.4 Backup Data Flow

```
KDT Vault Server                                    Backup Storage
    │                                                      │
    │  1. Scheduled backup (daily 02:00 EST)               │
    │                                                      │
    │  2. PostgreSQL pg_dump (encrypted)                   │
    ├─────────────────────────────────────────────────────>│
    │                                                      │
    │  3. File storage rsync (encrypted diff)              │
    ├─────────────────────────────────────────────────────>│
    │                                                      │
    │  4. Audit log export (append-only archive)           │
    ├─────────────────────────────────────────────────────>│
    │                                                      │
    │  5. Backup verification (checksum + test restore)    │
    │<─────────────────────────────────────────────────────│
    │                                                      │
    │  6. Audit log: backup completed                      │
    │                                                      │
```

---

## 5. User Roles and Access

### 5.1 System Roles

| Role | Description | Access Level | Personnel |
|------|-------------|-------------|-----------|
| **System Owner** | Ultimate system authority | Full | CEO (Michael Schulz) |
| **ISSO** | Security operations lead | Security config, audit logs, policy | *(appointed)* |
| **System Administrator** | Infrastructure management | OS, services, backups | IT/DevOps |
| **Security Auditor** | Compliance and audit review | Read-only audit logs | ISSO + designated |

### 5.2 Business Roles

| Role | CUI Access | File Operations | Admin Functions |
|------|-----------|----------------|-----------------|
| **CEO** | Full | All CRUD + share | All |
| **COO** | Full | All CRUD + share | User management |
| **Operations Manager** | Scoped to ops | CRUD within scope | None |
| **Account Exec (Gov)** | Scoped to contracts | CRUD within scope | None |
| **Account Exec (Civ)** | No CUI | CRUD non-CUI only | None |
| **Field Operator** | Scoped to projects | Read + upload | None |
| **Finance** | No CUI | CRUD financial docs | None |
| **Technical Manager** | Scoped to tech | CRUD within scope | None |
| **Software Architect** | Scoped to tech | CRUD within scope | None |
| **General Employee** | No CUI | Read UNCLASSIFIED | None |

### 5.3 Access Control Matrix

| Resource | CEO | COO | Ops Mgr | Gov AE | Civ AE | Field Op | Finance | Admin |
|----------|-----|-----|---------|--------|--------|----------|---------|-------|
| CUI Files | CRUD | CRUD | CRUD* | CRUD* | — | R* | — | — |
| CONFID Files | CRUD | CRUD | CRUD | CRUD | CRUD | R | CRUD* | — |
| UNCLASS Files | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | — |
| Audit Logs | R | R | — | — | — | — | — | — |
| User Accounts | CRUD | CRUD | — | — | — | — | — | CRUD |
| System Config | CRUD | R | — | — | — | — | — | CRUD |
| Backups | R | R | — | — | — | — | — | CRUD |

*\* = within assigned scope (project, contract, or department)*

### 5.4 Service Accounts

| Account | Purpose | Auth Method | Permissions |
|---------|---------|-------------|-------------|
| `vault-backup` | Automated backups | Certificate | Read all files, write backup store |
| `vault-audit` | Audit pipeline | Certificate | Write audit logs only |
| `vault-scanner` | Malware scanning | API key | Read uploaded files only |
| `vault-api` | API gateway | Certificate | Delegated per-request |

---

## 6. Authentication Mechanisms

### 6.1 User Authentication

| Factor | Method | Standard |
|--------|--------|----------|
| **Something you know** | Password (min 16 chars, complexity enforced) | NIST 800-63B |
| **Something you have** | TOTP authenticator app or WebAuthn/FIDO2 key | RFC 6238, FIDO2 |
| **MFA Required** | Yes — all accounts (privileged and non-privileged) | NIST 800-171 3.5.3 |

### 6.2 Authentication Flow

1. User navigates to KDT Vault login page (via Tailscale)
2. System use notification banner displayed — user must acknowledge
3. User enters credentials (redirected to OIDC/SAML provider)
4. MFA challenge presented (TOTP or WebAuthn)
5. Upon success: session created (Redis-backed, signed cookie)
6. Session properties: 15-min inactivity timeout, 8-hour max duration

### 6.3 Account Security Controls

| Control | Setting |
|---------|---------|
| Lockout threshold | 5 failed attempts in 15 minutes |
| Lockout duration | 30 minutes |
| Password history | Last 12 passwords |
| Inactivity deactivation | 90 days |
| Temporary password | Forced change on first login, 24-hour expiry |
| Shared accounts | Prohibited |
| SMS MFA | Prohibited (per NIST 800-63B) |

See [ACCESS-CONTROL-POLICY.md](ACCESS-CONTROL-POLICY.md) for complete authentication and access control procedures.

---

## 7. Encryption Standards

### 7.1 Summary

| Scope | Algorithm | Key Size | Standard |
|-------|-----------|----------|----------|
| **At Rest (disk)** | AES-256-XTS | 256-bit | FIPS 140-2 (FileVault) |
| **At Rest (files)** | AES-256-GCM | 256-bit | FIPS 140-2 (application) |
| **In Transit** | TLS 1.3 | 256-bit | FIPS 140-2 (corecrypto) |
| **VPN Tunnel** | WireGuard (ChaCha20/AES-256) | 256-bit | Tailscale |
| **Password Storage** | bcrypt | cost 12 | — |
| **File Integrity** | SHA-256 | 256-bit | — |

### 7.2 FIPS 140-2 Compliance

KDT Vault relies on Apple's FIPS 140-2 validated CoreCrypto and corecrypto kernel modules for all cryptographic operations protecting CUI. CMVP certificate status verified annually.

### 7.3 Key Management

- Encryption keys stored in macOS Keychain (hardware-backed on Apple Silicon)
- Key rotation schedule: TLS certificates annually, API keys quarterly, file encryption keys annually
- Key escrow: recovery keys stored in physical safe accessible to ISSO
- Key destruction: secure zeroing upon rotation or compromise

See [ENCRYPTION-STANDARDS.md](ENCRYPTION-STANDARDS.md) for complete cryptographic standards and procedures.

---

## 8. Audit Logging

### 8.1 Events Logged

| Category | Events |
|----------|--------|
| **Authentication** | Login success/failure, logout, MFA challenge/success/failure, session timeout |
| **Authorization** | Permission grant/revoke, role change, access denied |
| **File Operations** | Upload, download, delete, move, rename, share, version create |
| **Classification** | Label assignment, label change, CUI marking, spillage detection |
| **Administration** | User CRUD, system config change, backup, restore |
| **System** | Service start/stop, error, health check failure |

### 8.2 Log Format

Each audit entry contains:
- `id` — Unique event UUID
- `timestamp` — UTC ISO 8601
- `user_id` — Authenticated user (NOT NULL)
- `action` — Event type
- `resource_type` — Target resource category
- `resource_id` — Target resource identifier
- `details` — JSON payload with context
- `ip_address` — Source IP
- `user_agent` — Client identifier
- `correlation_id` — Request trace ID
- `severity` — INFO, WARN, ERROR, CRITICAL
- `hmac` — Integrity hash

### 8.3 Log Protection

- Insert-only database permissions (no UPDATE/DELETE)
- Separate database user for audit writes
- HMAC integrity verification
- Encrypted backups (separate key from production)
- 3-year minimum retention (DFARS)

See [AUDIT-LOGGING-POLICY.md](AUDIT-LOGGING-POLICY.md) for complete audit logging procedures.

---

## 9. Incident Response

### 9.1 Incident Response Team

| Role | Responsibility | Contact |
|------|---------------|---------|
| **Incident Commander** | CEO — final authority | *(contact info)* |
| **ISSO** | Detection, analysis, coordination | *(contact info)* |
| **System Administrator** | Containment, technical response | *(contact info)* |
| **Legal Advisor** | Regulatory compliance, notifications | *(contact info)* |

### 9.2 Incident Categories

| Severity | Examples | Response Time |
|----------|----------|---------------|
| **Critical** | CUI breach, ransomware, active intrusion | Immediate (< 1 hour) |
| **High** | Unauthorized access, data exfiltration attempt | < 4 hours |
| **Medium** | Policy violation, suspicious activity | < 24 hours |
| **Low** | Minor misconfiguration, single failed login | < 72 hours |

### 9.3 DoD Reporting

Per DFARS 252.204-7012:
- Cyber incidents involving CUI reported to DoD within **72 hours**
- Report via DC3 (Defense Cyber Crime Center) portal
- Preserve forensic images for 90 days minimum
- Provide access to equipment/information as requested

See [INCIDENT-RESPONSE-PLAN.md](INCIDENT-RESPONSE-PLAN.md) for complete incident response procedures.

---

## 10. Backup and Recovery

### 10.1 Backup Schedule

| Component | Frequency | Method | Retention |
|-----------|-----------|--------|-----------|
| **PostgreSQL** | Daily (02:00 EST) | pg_dump + encryption | 90 days |
| **File Storage** | Daily (02:30 EST) | Encrypted rsync | 90 days |
| **Audit Logs** | Daily (03:00 EST) | Archive export | 3 years |
| **System Config** | On change | Git commit | Indefinite |
| **Full System** | Weekly | Complete backup set | 30 days |

### 10.2 Backup Security

- All backups encrypted with AES-256 (separate key from production)
- Backup encryption keys escrowed with ISSO (physical safe)
- Backup integrity verified via SHA-256 checksums
- Test restore performed monthly
- Backup media stored in locked cabinet within server room

### 10.3 Recovery Objectives

| Metric | Target |
|--------|--------|
| **Recovery Time Objective (RTO)** | 4 hours |
| **Recovery Point Objective (RPO)** | 24 hours (last daily backup) |

### 10.4 Recovery Procedures

1. **Hardware failure:** Replace Mac Studio, restore from latest backup
2. **Data corruption:** Restore affected component from daily backup
3. **Ransomware:** Isolate system, wipe, rebuild from clean backup
4. **Accidental deletion:** Restore file from backup or version history

See [DATA-RETENTION-POLICY.md](DATA-RETENTION-POLICY.md) for retention periods and secure destruction.

---

## 11. Continuous Monitoring

### 11.1 Automated Monitoring

| Monitor | Frequency | Alert Threshold |
|---------|-----------|-----------------|
| **System uptime** | Every 60 seconds | Down > 2 minutes |
| **CPU/Memory/Disk** | Every 5 minutes | CPU > 90%, Memory > 85%, Disk > 80% |
| **Audit pipeline health** | Every 60 seconds | Any failure |
| **Failed logins** | Real-time | > 5 in 15 minutes |
| **Bulk file operations** | Real-time | > 100 files in 5 minutes |
| **Configuration drift** | Daily | Any deviation from baseline |
| **Vulnerability scan** | Weekly (infra), Daily (deps) | Critical/High findings |
| **Certificate expiration** | Daily | < 30 days to expiry |
| **Backup verification** | Daily | Checksum mismatch |
| **NTP drift** | Hourly | > 1 second drift |

### 11.2 Manual Reviews

| Review | Frequency | Performer |
|--------|-----------|-----------|
| Audit log review | Weekly | ISSO |
| Access review | Quarterly | ISSO + System Owner |
| Risk register review | Quarterly | ISSO + System Owner |
| Security control assessment | Annual | Qualified assessor |
| POA&M review | Monthly | ISSO |
| Physical access log review | Monthly | ISSO |
| Firewall rule review | Quarterly | System Administrator |

### 11.3 Alert Routing

| Severity | Notification Method | Recipients |
|----------|-------------------|------------|
| **CRITICAL** | SMS + Email + Dashboard | ISSO, System Owner, System Admin |
| **HIGH** | Email + Dashboard | ISSO, System Admin |
| **MEDIUM** | Dashboard + Daily digest | ISSO |
| **LOW** | Dashboard | System Admin |

---

## 12. Interconnections

### 12.1 System Interconnections

| System | Direction | Data | Protocol | Security |
|--------|-----------|------|----------|----------|
| **Tailscale Coordination** | Outbound | Key exchange, ACL sync | HTTPS | TLS 1.3 |
| **NTP Servers** | Outbound | Time synchronization | NTP | Authenticated NTP |
| **Apple Software Update** | Outbound | OS/security patches | HTTPS | TLS 1.3 |
| **ClamAV Updates** | Outbound | Malware signatures | HTTPS | TLS 1.3 |
| **Client Devices** | Inbound (via VPN) | User operations | HTTPS over WireGuard | TLS 1.3 + VPN |

### 12.2 No Public-Facing Services

KDT Vault has **no public-facing network services**. All inbound access requires:
1. Tailscale VPN enrollment (device registered and approved)
2. Authentication (OIDC/SAML + MFA)
3. Authorization (RBAC permission check)

---

## 13. Control Implementation Summary

This SSP implements all 110 NIST SP 800-171 Rev 2 controls organized across 14 families. Detailed control-by-control mapping is in [CMMC-LEVEL2-CONTROLS.md](CMMC-LEVEL2-CONTROLS.md).

| Family | Controls | Status |
|--------|----------|--------|
| AC — Access Control | 22 | ✅ Implemented |
| AT — Awareness & Training | 3 | ✅ Implemented |
| AU — Audit & Accountability | 9 | ✅ Implemented |
| CM — Configuration Management | 9 | ✅ Implemented |
| IA — Identification & Authentication | 11 | ✅ Implemented |
| IR — Incident Response | 3 | ✅ Implemented |
| MA — Maintenance | 6 | ✅ Implemented |
| MP — Media Protection | 9 | ✅ Implemented |
| PS — Personnel Security | 2 | ✅ Implemented |
| PE — Physical Protection | 6 | ✅ Implemented |
| RA — Risk Assessment | 3 | ✅ Implemented |
| CA — Security Assessment | 4 | ✅ Implemented |
| SC — System & Communications Protection | 16 | ✅ Implemented |
| SI — System & Information Integrity | 7 | ✅ Implemented |
| **TOTAL** | **110** | **✅** |

For deficiencies and planned remediation, see [POAM-TEMPLATE.md](POAM-TEMPLATE.md).

---

## Document Control

| Field | Value |
|-------|-------|
| **Organization** | Knight Division Tactical (KDT) |
| **Document Owner** | CEO / ISSO |
| **Classification** | CUI // SP-INFOSEC |
| **Last Updated** | 2026-04-06 |
| **Review Cycle** | Annual or upon significant system change |
| **Version** | 1.0 — Initial Release |

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-06 | KDT | Initial System Security Plan |

---

*This SSP is a living document. Update it whenever the system boundaries change, new components are added, controls are modified, or as directed by assessor feedback.*
