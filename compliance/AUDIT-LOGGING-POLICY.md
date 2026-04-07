# Audit Logging Policy

**Knight Division Tactical — KDT Vault**

| Field | Value |
|-------|-------|
| **Policy Owner** | CEO / ISSO |
| **Effective Date** | *(upon approval)* |
| **Review Cycle** | Annual |
| **Classification** | CUI // SP-INFOSEC |
| **NIST 800-171 Family** | AU (Audit and Accountability) |

---

## 1. Purpose

This policy defines what events KDT Vault logs, how logs are formatted, protected, retained, reviewed, and integrated with monitoring systems. Comprehensive audit logging is essential for detecting security incidents, supporting forensic investigations, and demonstrating compliance with NIST 800-171 and CMMC Level 2.

## 2. Scope

All components of KDT Vault: the application layer, database, operating system, network infrastructure, and supporting services (backup, scanning, authentication).

## 3. Auditable Events

### 3.1 Authentication Events

| Event | Severity | Details Captured |
|-------|----------|-----------------|
| Successful login | INFO | User ID, timestamp, source IP, MFA method, device ID |
| Failed login attempt | WARN | Username attempted, timestamp, source IP, failure reason |
| Account lockout | ALERT | User ID, lockout trigger (N failed attempts), source IP |
| MFA enrollment/change | WARN | User ID, MFA type, admin who assisted (if any) |
| Password change | INFO | User ID, timestamp, change method (self-service vs admin) |
| Session creation | INFO | Session ID, user ID, source IP, user agent |
| Session timeout/expiry | INFO | Session ID, user ID, duration, reason |
| Logout | INFO | Session ID, user ID, explicit vs timeout |
| Break-glass access activated | CRITICAL | User ID, authorizer, justification, scope |

### 3.2 File/Document Events

| Event | Severity | Details Captured |
|-------|----------|-----------------|
| File upload | INFO | User ID, file ID, filename, size, classification, folder |
| File download | INFO | User ID, file ID, filename, classification, destination type |
| File view/open | INFO | User ID, file ID, filename, classification |
| File edit/update | INFO | User ID, file ID, version number, changes summary |
| File delete (soft) | WARN | User ID, file ID, filename, classification |
| File delete (hard/permanent) | ALERT | User ID, file ID, approving admin, destruction method |
| File move | INFO | User ID, file ID, source folder, destination folder |
| File version restore | WARN | User ID, file ID, from version, to version |
| Bulk export | ALERT | User ID, file count, total size, classification levels |

### 3.3 Classification Events

| Event | Severity | Details Captured |
|-------|----------|-----------------|
| Classification assigned | INFO | User ID, file ID, classification level, category |
| Classification upgraded | WARN | User ID, file ID, old level, new level, justification |
| Classification downgraded | ALERT | User ID, file ID, old level, new level, approver, justification |
| Declassification | ALERT | User ID, file ID, authority, justification |
| Auto-detection flag | WARN | File ID, detected indicators, recommended classification |

### 3.4 Sharing/Permission Events

| Event | Severity | Details Captured |
|-------|----------|-----------------|
| Share granted | INFO | Granting user, target user, file/folder ID, permission level |
| Share revoked | INFO | Revoking user, target user, file/folder ID |
| Permission change | WARN | Admin user, target user, old permissions, new permissions |
| Access denied | WARN | User ID, file ID, reason (classification, role, not shared) |
| Bulk permission change | ALERT | Admin user, scope, old state, new state |

### 3.5 Administrative Events

| Event | Severity | Details Captured |
|-------|----------|-----------------|
| User account created | WARN | Admin user, new user ID, roles, approver chain |
| User account disabled | WARN | Admin user, target user ID, reason |
| User account deleted | ALERT | Admin user, target user ID, reason, approval |
| Role assignment changed | WARN | Admin user, target user, old role, new role |
| System configuration change | ALERT | Admin user, setting name, old value, new value |
| Backup initiated | INFO | Trigger (scheduled/manual), scope, destination |
| Backup completed/failed | INFO/ALERT | Status, size, duration, any errors |
| System update/patch applied | WARN | Admin user, component, version change |
| Service start/stop/restart | WARN | Service name, action, user/trigger |

### 3.6 Security Events

| Event | Severity | Details Captured |
|-------|----------|-----------------|
| Malware detected | CRITICAL | File ID, scan engine, threat name, action taken |
| Intrusion detection alert | CRITICAL | Source, target, signature, raw data |
| Certificate expiration warning | WARN | Certificate subject, expiry date, days remaining |
| Encryption failure | CRITICAL | Component, operation, error details |
| Spillage detected | CRITICAL | File ID, detected level, authorized level, discoverer |

## 4. Log Format

### 4.1 Structured Log Schema

All logs are JSON-formatted with the following required fields:

```json
{
  "timestamp": "2026-04-06T20:30:00.000Z",
  "event_id": "uuid-v4",
  "event_type": "file.download",
  "severity": "INFO",
  "actor": {
    "user_id": "usr_abc123",
    "username": "mschulz",
    "role": "CEO",
    "source_ip": "100.64.0.5",
    "session_id": "sess_xyz789",
    "user_agent": "Mozilla/5.0...",
    "device_id": "dev_mac001"
  },
  "target": {
    "resource_type": "file",
    "resource_id": "file_def456",
    "resource_name": "contract_proposal.pdf",
    "classification": "CUI",
    "folder_id": "fold_ghi789"
  },
  "action": {
    "operation": "download",
    "result": "success",
    "details": {}
  },
  "context": {
    "request_id": "req_jkl012",
    "correlation_id": "corr_mno345",
    "environment": "production",
    "component": "vault-api",
    "version": "1.2.0"
  }
}
```

### 4.2 Timestamp Requirements

- All timestamps in UTC (ISO 8601 format)
- Millisecond precision minimum
- System clocks synchronized via NTP (checked hourly)
- Clock skew alerts if drift exceeds 1 second

## 5. Log Retention

| Log Type | Minimum Retention | Storage Tier |
|----------|-------------------|-------------|
| Authentication events | 3 years | Hot (90 days) → Warm (1 year) → Cold (3 years) |
| File access events | 3 years | Hot (90 days) → Warm (1 year) → Cold (3 years) |
| Classification changes | 6 years | Hot (1 year) → Cold (6 years) |
| Administrative actions | 6 years | Hot (1 year) → Cold (6 years) |
| Security incidents | 6 years | Hot (1 year) → Cold (6 years) |
| System/infrastructure | 1 year | Hot (30 days) → Warm (1 year) |

**Storage tiers:**
- **Hot:** Immediately queryable (PostgreSQL + indexed)
- **Warm:** Queryable within minutes (compressed, archived locally)
- **Cold:** Queryable within hours (encrypted backup, off-site)

## 6. Log Protection

### 6.1 Integrity

- Logs are **append-only** — no modification or deletion by any user, including administrators
- Each log entry includes a SHA-256 hash chained to the previous entry (hash chain)
- Daily integrity verification: system computes and verifies hash chain
- Any break in the hash chain triggers a CRITICAL alert
- Database-level: audit_logs table has no UPDATE or DELETE permissions for any application role

### 6.2 Confidentiality

- Audit logs are classified as **CUI // SP-INFOSEC**
- Access restricted to: ISSO, Security Auditor role, CEO
- System Administrators can manage log infrastructure but cannot read log content in production
- Logs encrypted at rest (AES-256) alongside all other KDT Vault data
- Log queries themselves are logged (meta-audit)

### 6.3 Availability

- Logs stored on separate volume from application data
- Log storage monitored — alert at 80% capacity
- Log rotation to warm/cold storage automated
- Minimum 2 copies: primary storage + backup
- Log backup included in system backup schedule (but stored separately)

### 6.4 Tamper Evidence

- Hash chain provides tamper detection
- Daily automated integrity check
- Monthly manual integrity verification by ISSO
- Any tampering evidence treated as a security incident (see Incident Response Plan)

## 7. Log Review Schedule

| Review Type | Frequency | Reviewer | Focus |
|-------------|-----------|----------|-------|
| Automated alert triage | Real-time | System (auto) + ISSO (response) | CRITICAL and ALERT severity events |
| Daily summary review | Daily | ISSO | Failed logins, access denials, admin actions |
| Weekly trend analysis | Weekly | ISSO | Anomalous patterns, volume changes, new users |
| Monthly compliance review | Monthly | ISSO + CEO | Access review alignment, policy violations |
| Quarterly full audit | Quarterly | ISSO + external (if available) | Complete log integrity, retention compliance, gap analysis |

## 8. Alerting Thresholds

### 8.1 Immediate Alerts (Real-Time)

| Condition | Alert Level | Notification |
|-----------|-------------|-------------|
| 5+ failed logins for single user in 15 minutes | HIGH | ISSO (push notification) |
| Any break-glass access | CRITICAL | ISSO + CEO (push notification) |
| Malware detected | CRITICAL | ISSO + CEO + System Admin |
| Hash chain integrity failure | CRITICAL | ISSO + CEO |
| CUI bulk download (>10 files in 5 minutes) | HIGH | ISSO |
| Admin action outside business hours | MEDIUM | ISSO (next morning if off-hours) |
| New admin account created | HIGH | CEO (push notification) |
| Classification downgrade | HIGH | ISSO |
| Access from new/unknown device | MEDIUM | User + ISSO |
| Service account authentication failure | HIGH | System Admin + ISSO |

### 8.2 Summary Alerts (Daily Digest)

- Total failed login attempts
- New user accounts created
- Permission changes
- Files classified/reclassified
- Backup status
- Storage utilization trends

## 9. SIEM Integration

### 9.1 Current Architecture

For initial deployment, KDT Vault includes a built-in log management pipeline:

```
Application → Structured JSON Logger → PostgreSQL (audit_logs)
                                     → Local File (append-only, /var/log/kdt-vault/)
                                     → Alert Engine → Notification Service
```

### 9.2 Future SIEM Integration

When KDT scales or assessors require a dedicated SIEM:

**Recommended SIEM Options:**
- **Wazuh** (open-source, self-hosted) — recommended for cost-effectiveness
- **Elastic SIEM** (open-source core, self-hosted)
- **Splunk** (commercial, if budget allows)

**Integration Points:**
- Syslog forwarding (RFC 5424) over TLS
- REST API for log export
- File-based ingestion (JSON log files)
- Database replication to SIEM datastore

**SIEM should provide:**
- Correlation across multiple log sources (OS, network, application)
- Anomaly detection and behavioral analysis
- Compliance dashboards (NIST 800-171 control coverage)
- Automated incident creation from alert rules
- Long-term searchable archive

## 10. Operating System and Infrastructure Logging

In addition to application-level logging, the following OS/infrastructure logs are collected:

| Source | Log Type | Method |
|--------|----------|--------|
| macOS | System log (syslog) | Unified Logging → export |
| macOS | Authentication log | `/var/log/auth.log` + Unified Logging |
| macOS | Firewall log | pf log → structured export |
| Tailscale | Connection/auth events | Tailscale admin console + local logs |
| PostgreSQL | Query log (slow queries, auth) | PostgreSQL logging configuration |
| Docker (if used) | Container events | Docker daemon logs |
| NTP | Clock sync events | NTP daemon logs |

## 11. Log Access Procedures

### 11.1 Routine Access

- ISSO: Direct query access to hot/warm logs via admin dashboard
- Security Auditor: Read-only query access via reporting interface
- CEO: Summary dashboards; detailed access on request

### 11.2 Forensic Access

- Triggered by security incident or investigation
- ISSO authorizes specific query scope
- All forensic queries logged with justification
- Results exported with chain-of-custody documentation
- Cold storage retrieval: ISSO requests, System Admin executes, ISSO reviews

### 11.3 Legal/Regulatory Access

- Legal counsel or assessor requests go through CEO
- ISSO extracts relevant logs per approved scope
- Data minimized to what's necessary for the request
- Export logged and documented

## 12. References

- NIST SP 800-171 Rev 2 — Audit and Accountability (AU): 3.3.1–3.3.9
- NIST SP 800-92 — Guide to Computer Security Log Management
- CMMC Level 2 — AU domain practices

---

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO | Michael Schulz | _____________ | ______ |
| ISSO | *(appointed)* | _____________ | ______ |
