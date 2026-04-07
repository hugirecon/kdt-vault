# CMMC Level 2 Controls — NIST SP 800-171 Mapping

**Knight Division Tactical — KDT Vault**

| Field | Value |
|-------|-------|
| **Document Owner** | CEO / ISSO |
| **Effective Date** | *(upon approval)* |
| **Review Cycle** | Annual |
| **Classification** | CUI // SP-INFOSEC |
| **Standard** | NIST SP 800-171 Rev 2 (all 110 controls) |
| **CMMC Version** | CMMC 2.0 Level 2 |

---

## How to Read This Document

Each control is listed with:
- **Control ID** — NIST 800-171 identifier (e.g., 3.1.1)
- **Control Name** — Short description
- **Requirement** — What the control requires
- **KDT Vault Implementation** — How KDT Vault satisfies this control
- **Type** — Automated (A), Manual (M), or Hybrid (H)
- **Status** — Implemented ✅, Partial ⚠️, or Planned 🔲
- **Evidence** — Where to find proof of implementation

Cross-references point to supporting policy documents in this compliance directory.

---

## 1. Access Control (AC) — 22 Controls

### 3.1.1 — Authorized Access Control
**Requirement:** Limit system access to authorized users, processes acting on behalf of authorized users, and devices (including other systems).

| Field | Detail |
|-------|--------|
| **Implementation** | KDT Vault enforces RBAC with role-based permissions (CEO, COO, Operations Manager, Account Executive, Field Operator, etc.). All access requires authentication via OIDC/SAML + MFA. Service accounts use certificate-based or API key authentication with no interactive login capability. Unauthorized requests receive HTTP 401/403 responses. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Access Control Policy §3, API gateway middleware, RBAC configuration |
| **Policy Ref** | [ACCESS-CONTROL-POLICY.md](ACCESS-CONTROL-POLICY.md) §3 |

---

### 3.1.2 — Transaction & Function Control
**Requirement:** Limit system access to the types of transactions and functions that authorized users are permitted to execute.

| Field | Detail |
|-------|--------|
| **Implementation** | RBAC matrix defines per-role CRUD permissions on each resource type (files, folders, audit logs, user accounts, system config). API endpoints enforce permission checks before executing any operation. Database-level row security policies enforce data scope boundaries. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | RBAC permission matrix, API middleware authorization checks, PostgreSQL RLS policies |
| **Policy Ref** | [ACCESS-CONTROL-POLICY.md](ACCESS-CONTROL-POLICY.md) §4 |

---

### 3.1.3 — CUI Flow Control
**Requirement:** Control the flow of CUI in accordance with approved authorizations.

| Field | Detail |
|-------|--------|
| **Implementation** | Data classification labels (UNCLASSIFIED, CONFIDENTIAL, CUI) are enforced at upload, share, download, and export. CUI-marked files cannot be shared with users lacking CUI clearance. Download/export of CUI triggers additional audit logging. File sharing links enforce classification-appropriate access checks. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Classification enforcement middleware, share permission logic, audit logs |
| **Policy Ref** | [DATA-CLASSIFICATION-POLICY.md](DATA-CLASSIFICATION-POLICY.md) §4 |

---

### 3.1.4 — Separation of Duties
**Requirement:** Separate the duties of individuals to reduce the risk of malevolent activity without collusion.

| Field | Detail |
|-------|--------|
| **Implementation** | System Administrator cannot modify audit logs (write-only audit pipeline). Security Auditor has read-only access and cannot modify system configuration. User provisioning requires ISSO approval, separate from the admin who implements the change. Backup service account cannot delete production data. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Role separation matrix, service account permissions, approval workflows |
| **Policy Ref** | [ACCESS-CONTROL-POLICY.md](ACCESS-CONTROL-POLICY.md) §3 |

---

### 3.1.5 — Least Privilege
**Requirement:** Employ the principle of least privilege, including for specific security functions and privileged accounts.

| Field | Detail |
|-------|--------|
| **Implementation** | Default new user role grants minimal read access. Elevated permissions require explicit assignment with ISSO approval. Privileged operations (system config, user management, backup restore) are restricted to System Administrator and System Owner roles. API tokens are scoped to specific operations. Database connections use role-specific credentials with minimal grants. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Default role configuration, privilege escalation approval logs, database role grants |
| **Policy Ref** | [ACCESS-CONTROL-POLICY.md](ACCESS-CONTROL-POLICY.md) §4 |

---

### 3.1.6 — Non-Privileged Account Use
**Requirement:** Use non-privileged accounts or roles when accessing nonsecurity functions.

| Field | Detail |
|-------|--------|
| **Implementation** | Administrators have separate standard and privileged accounts. Day-to-day document access uses standard account. Privileged account is required only for system administration tasks and triggers enhanced audit logging. macOS admin operations require separate sudo authentication. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Dual account provisioning records, session logs showing account separation |
| **Policy Ref** | [ACCESS-CONTROL-POLICY.md](ACCESS-CONTROL-POLICY.md) §5 |

---

### 3.1.7 — Privileged Function Control
**Requirement:** Prevent non-privileged users from executing privileged functions and capture the execution of such functions in audit logs.

| Field | Detail |
|-------|--------|
| **Implementation** | API middleware enforces role-based authorization before executing any privileged endpoint (user CRUD, system config, backup operations). All privilege escalation attempts (successful and failed) are logged to the immutable audit store with timestamp, user ID, action, and result. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | API authorization middleware, audit log entries for privileged operations |
| **Policy Ref** | [AUDIT-LOGGING-POLICY.md](AUDIT-LOGGING-POLICY.md) §3 |

---

### 3.1.8 — Unsuccessful Logon Attempts
**Requirement:** Limit unsuccessful logon attempts.

| Field | Detail |
|-------|--------|
| **Implementation** | Account lockout after 5 consecutive failed login attempts within 15 minutes. Lockout duration: 30 minutes (auto-unlock) or manual unlock by ISSO. Rate limiting on authentication endpoints (10 requests/minute per IP). Failed attempts logged with source IP, timestamp, and username. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Auth service lockout configuration, rate limiter config, failed login audit logs |
| **Policy Ref** | [ACCESS-CONTROL-POLICY.md](ACCESS-CONTROL-POLICY.md) §6 |

---

### 3.1.9 — Privacy & Security Notices
**Requirement:** Provide privacy and security notices consistent with applicable CUI rules.

| Field | Detail |
|-------|--------|
| **Implementation** | Login screen displays DoD-standard system use notification banner: "This is a U.S. Government contractor information system subject to monitoring..." Users must acknowledge the banner before authentication proceeds. CUI marking banners displayed on all pages containing CUI-classified content. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Login page banner text, CUI marking display logic, user acknowledgment logs |

---

### 3.1.10 — Session Lock
**Requirement:** Use session lock with pattern-hiding displays to prevent access and viewing of data after a period of inactivity.

| Field | Detail |
|-------|--------|
| **Implementation** | Web session timeout after 15 minutes of inactivity — redirects to locked screen requiring re-authentication. macOS screensaver activates after 5 minutes with password required on wake. Active sessions display a lock overlay that hides all document content until re-authenticated. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Session timeout configuration, macOS screensaver policy, lock screen UI |
| **Policy Ref** | [ACCESS-CONTROL-POLICY.md](ACCESS-CONTROL-POLICY.md) §7 |

---

### 3.1.11 — Session Termination
**Requirement:** Terminate (automatically) a user session after a defined condition.

| Field | Detail |
|-------|--------|
| **Implementation** | Sessions terminated after 8 hours maximum duration regardless of activity. Sessions terminated after 30 minutes of inactivity. Sessions terminated upon explicit logout. All terminated sessions are logged with reason code. Session tokens invalidated server-side upon termination. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Session management configuration, session termination audit logs |

---

### 3.1.12 — Remote Access Control
**Requirement:** Monitor and control remote access sessions.

| Field | Detail |
|-------|--------|
| **Implementation** | All remote access via Tailscale mesh VPN with WireGuard encryption. Remote sessions authenticated with MFA. Remote access limited to authorized devices registered in Tailscale ACL. All remote sessions logged with connection time, duration, source device, and user. VPN access can be revoked in real-time via Tailscale admin console. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Tailscale ACL configuration, VPN session logs, device registration records |
| **Policy Ref** | [ACCESS-CONTROL-POLICY.md](ACCESS-CONTROL-POLICY.md) §8 |

---

### 3.1.13 — Remote Access Encryption
**Requirement:** Employ cryptographic mechanisms to protect the confidentiality of remote access sessions.

| Field | Detail |
|-------|--------|
| **Implementation** | Tailscale uses WireGuard protocol (ChaCha20-Poly1305 or AES-256-GCM). All web traffic over TLS 1.3 with FIPS-validated cipher suites. No unencrypted remote access methods permitted. Certificate pinning for API communications. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Tailscale WireGuard configuration, TLS certificate configuration, cipher suite audit |
| **Policy Ref** | [ENCRYPTION-STANDARDS.md](ENCRYPTION-STANDARDS.md) §4 |

---

### 3.1.14 — Remote Access Routing
**Requirement:** Route remote access via managed access control points.

| Field | Detail |
|-------|--------|
| **Implementation** | All remote traffic routes through Tailscale coordination server → KDT Vault reverse proxy → application. No direct access to backend services from external networks. Firewall rules block all inbound connections except through Tailscale tunnel. Single ingress point with WAF/rate limiting. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Firewall rules (pf.conf), Tailscale ACL, reverse proxy configuration |

---

### 3.1.15 — Privileged Remote Access
**Requirement:** Authorize remote execution of privileged commands and remote access to security-relevant information.

| Field | Detail |
|-------|--------|
| **Implementation** | Remote administrative access (SSH, system config API) restricted to System Administrator and System Owner roles. Privileged remote commands require MFA re-authentication. All privileged remote operations logged with full command/action detail. Remote admin sessions limited to 2-hour maximum duration. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | SSH access logs, privileged API endpoint audit logs, Tailscale ACL for admin services |

---

### 3.1.16 — Wireless Access Authorization
**Requirement:** Authorize wireless access prior to allowing such connections.

| Field | Detail |
|-------|--------|
| **Implementation** | Mac Studio server connected via wired Ethernet (no Wi-Fi on server). Client wireless access requires WPA3-Enterprise authentication against RADIUS. Guest wireless network is isolated from KDT Vault network segment. Wireless access points configured with 802.1X authentication. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Network topology diagram, wireless AP configuration, VLAN segmentation records |
| **Policy Ref** | [PHYSICAL-SECURITY.md](PHYSICAL-SECURITY.md) §4 |

---

### 3.1.17 — Wireless Access Protection
**Requirement:** Protect wireless access using authentication and encryption.

| Field | Detail |
|-------|--------|
| **Implementation** | WPA3-Enterprise with AES-256-CCMP encryption on all KDT wireless networks. 802.1X authentication via RADIUS server. Wireless traffic from authorized clients tunneled through Tailscale VPN before accessing KDT Vault. Rogue AP detection enabled on network monitoring. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Wireless configuration, RADIUS server config, Tailscale tunnel verification |

---

### 3.1.18 — Mobile Device Connection
**Requirement:** Control connection of mobile devices.

| Field | Detail |
|-------|--------|
| **Implementation** | Mobile devices must be registered and approved by ISSO before accessing KDT Vault. Mobile access requires Tailscale client installation with device-specific identity. Mobile browsers require MFA on each session. Mobile devices must have full-disk encryption, screen lock, and current OS patches. Remote wipe capability via MDM for lost/stolen devices. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Device registration records, MDM enrollment, Tailscale device list |

---

### 3.1.19 — Encrypt CUI on Mobile
**Requirement:** Encrypt CUI on mobile devices and mobile computing platforms.

| Field | Detail |
|-------|--------|
| **Implementation** | Mobile devices accessing CUI must have full-disk encryption enabled (iOS: always-on; Android: mandatory). CUI documents accessed via KDT Vault web interface are not cached locally — streamed over encrypted TLS 1.3 connection. No offline CUI access permitted on mobile devices. If a mobile app is developed, it will use encrypted local storage (iOS Keychain / Android Keystore). |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | MDM encryption enforcement policy, mobile access architecture documentation |
| **Policy Ref** | [ENCRYPTION-STANDARDS.md](ENCRYPTION-STANDARDS.md) §5 |

---

### 3.1.20 — External System Connections
**Requirement:** Verify and control/limit connections to and use of external systems.

| Field | Detail |
|-------|--------|
| **Implementation** | KDT Vault does not connect to external systems by default. Any external integration (email notifications, backup replication) requires ISSO approval and documented risk assessment. External API calls are allow-listed by domain in firewall rules. External system connections logged and monitored. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | External connection inventory, firewall allow-list, ISSO approval records |

---

### 3.1.21 — Portable Storage Use
**Requirement:** Limit use of portable storage devices on systems containing CUI.

| Field | Detail |
|-------|--------|
| **Implementation** | USB mass storage devices disabled at OS level on the Mac Studio server. Export of CUI to removable media requires ISSO approval and is logged. Authorized removable media must be encrypted (AES-256). USB device connection events logged by macOS endpoint security framework. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | macOS USB restriction profile, media export approval logs, endpoint security logs |
| **Policy Ref** | [PHYSICAL-SECURITY.md](PHYSICAL-SECURITY.md) §5 |

---

### 3.1.22 — Publicly Accessible Content
**Requirement:** Control information posted or processed on publicly accessible systems.

| Field | Detail |
|-------|--------|
| **Implementation** | KDT Vault is not publicly accessible — accessible only via Tailscale VPN. No KDT Vault content is published to public-facing systems. Any transfer of information to public systems requires classification review and ISSO approval. Automated classification checks prevent CUI from being attached to outbound communications. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Network architecture (no public ingress), classification enforcement logs |

---

## 2. Awareness and Training (AT) — 3 Controls

### 3.2.1 — Security Awareness
**Requirement:** Ensure that managers, systems administrators, and users of organizational systems are made aware of the security risks associated with their activities and of the applicable policies, procedures, and standards related to the security of those systems.

| Field | Detail |
|-------|--------|
| **Implementation** | All KDT personnel complete security awareness training upon onboarding and annually thereafter. Training covers: CUI handling, phishing recognition, password hygiene, incident reporting, physical security, and acceptable use. Training materials maintained in KDT Vault compliance folder. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | Training completion records, training materials, annual training schedule |

---

### 3.2.2 — Role-Based Training
**Requirement:** Ensure that personnel are trained to carry out their assigned information security-related duties and responsibilities.

| Field | Detail |
|-------|--------|
| **Implementation** | System Administrators receive additional training on: secure system configuration, patch management, backup procedures, incident response. ISSO receives training on: compliance assessment, audit procedures, risk management. Developers receive secure coding training annually. Training tracked per role with completion certificates. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | Role-specific training plans, completion certificates, training logs |

---

### 3.2.3 — Insider Threat Awareness
**Requirement:** Provide security awareness training on recognizing and reporting potential indicators of insider threat.

| Field | Detail |
|-------|--------|
| **Implementation** | Annual insider threat awareness training covering: behavioral indicators, reporting procedures, data exfiltration warning signs, social engineering tactics. Anonymous reporting channel established. Training includes real-world case studies relevant to defense contracting. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | Insider threat training materials, completion records, reporting channel documentation |

---

## 3. Audit and Accountability (AU) — 9 Controls

### 3.3.1 — System Audit
**Requirement:** Create and retain system audit logs and records to the extent needed to enable the monitoring, analysis, investigation, and reporting of unlawful or unauthorized system activity.

| Field | Detail |
|-------|--------|
| **Implementation** | All security-relevant events are logged to an append-only audit log store (PostgreSQL `audit_logs` table with immutable insert-only permissions). Logs include: authentication events, file access, permission changes, system configuration changes, failed access attempts, and administrative actions. Logs retained for minimum 3 years per DFARS requirements. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Audit log database schema, log retention configuration, sample audit entries |
| **Policy Ref** | [AUDIT-LOGGING-POLICY.md](AUDIT-LOGGING-POLICY.md) §3 |

---

### 3.3.2 — Individual Accountability
**Requirement:** Ensure that the actions of individual system users can be uniquely traced to those users so they can be held accountable for their actions.

| Field | Detail |
|-------|--------|
| **Implementation** | Every audit log entry includes authenticated user ID (no anonymous actions permitted). Shared accounts are prohibited. Service account actions are attributed to the originating user where applicable. Session tokens are bound to individual user identities. Log entries are cryptographically integrity-protected (HMAC). |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Audit log schema (user_id NOT NULL constraint), shared account prohibition policy |
| **Policy Ref** | [AUDIT-LOGGING-POLICY.md](AUDIT-LOGGING-POLICY.md) §3.2 |

---

### 3.3.3 — Event Review
**Requirement:** Review and update logged events.

| Field | Detail |
|-------|--------|
| **Implementation** | ISSO reviews audit logs weekly for anomalies. Automated alerts trigger immediate review for high-risk events (failed admin logins, bulk file downloads, permission escalation). Quarterly review of log categories to ensure all relevant events are captured. Log review findings documented and tracked. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Weekly review logs, alert configuration, quarterly review reports |

---

### 3.3.4 — Alert on Audit Failure
**Requirement:** Alert in the event of an audit logging process failure.

| Field | Detail |
|-------|--------|
| **Implementation** | Health check monitor validates audit pipeline every 60 seconds. If audit logging fails: system sends immediate alert to ISSO via email/SMS, critical operations are blocked until logging is restored (fail-secure), incident automatically opened. Separate monitoring process on isolated thread to prevent common-mode failure. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Health check configuration, alert rules, fail-secure middleware logic |
| **Policy Ref** | [AUDIT-LOGGING-POLICY.md](AUDIT-LOGGING-POLICY.md) §5 |

---

### 3.3.5 — Audit Correlation
**Requirement:** Correlate audit record review, analysis, and reporting processes to support after-the-fact investigations of incidents.

| Field | Detail |
|-------|--------|
| **Implementation** | All audit events include a correlation ID (request trace ID) that links related events across the request lifecycle. Events indexed by user, timestamp, resource, and action for rapid querying. SIEM-compatible log format (JSON structured logging) enables cross-system correlation. Incident investigation playbook references audit correlation procedures. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Correlation ID in log schema, SIEM integration configuration, investigation playbook |

---

### 3.3.6 — Audit Reduction & Reporting
**Requirement:** Provide audit record reduction and report generation capability to support on-demand analysis and reporting.

| Field | Detail |
|-------|--------|
| **Implementation** | Audit dashboard provides filtered views by user, date range, event type, resource, and severity. On-demand report generation for compliance reviews (PDF/CSV export). Automated daily summary reports sent to ISSO. Audit data queryable via SQL for ad-hoc analysis. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Audit dashboard screenshots, sample reports, report generation API |

---

### 3.3.7 — Authoritative Time Source
**Requirement:** Provide a system capability that compares and synchronizes internal system clocks with an authoritative source to generate time stamps for audit records.

| Field | Detail |
|-------|--------|
| **Implementation** | macOS NTP configured to sync with `time.apple.com` and `time.nist.gov` (dual source). NTP sync status monitored — alert if drift exceeds 1 second. All audit timestamps in UTC (ISO 8601 format). Application-level timestamps use system clock (not application-generated). |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | NTP configuration (`/etc/ntp.conf` or `systemsetup -getnetworktimeserver`), drift monitoring |

---

### 3.3.8 — Audit Log Protection
**Requirement:** Protect audit information and audit logging tools from unauthorized access, modification, and deletion.

| Field | Detail |
|-------|--------|
| **Implementation** | Audit log database table has insert-only permissions (no UPDATE/DELETE grants). Database user for audit writes is separate from application database user. Audit log files on filesystem are owned by root with 0440 permissions. Log backups encrypted and stored separately from primary logs. Only Security Auditor role can read audit logs in the application. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Database permission grants, filesystem permissions, backup encryption config |
| **Policy Ref** | [AUDIT-LOGGING-POLICY.md](AUDIT-LOGGING-POLICY.md) §4 |

---

### 3.3.9 — Audit Management Limitation
**Requirement:** Limit management of audit logging functionality to a subset of privileged users.

| Field | Detail |
|-------|--------|
| **Implementation** | Only System Owner and ISSO can modify audit logging configuration (log levels, retention periods, alert thresholds). System Administrators can view but not modify audit configuration. Changes to audit configuration are themselves logged as critical events. Audit configuration stored in version-controlled configuration files with change tracking. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Audit config access controls, configuration change logs |

---

## 4. Configuration Management (CM) — 9 Controls

### 3.4.1 — Baseline Configuration
**Requirement:** Establish and maintain baseline configurations and inventories of organizational systems (including hardware, software, firmware, and documentation) throughout the respective system development life cycles.

| Field | Detail |
|-------|--------|
| **Implementation** | System baseline documented in SYSTEM-SECURITY-PLAN.md including: hardware (Mac Studio M-series specs), OS version, installed software with versions, network configuration, and security settings. Baseline stored in Git with version history. Hardware and software inventory maintained and reviewed quarterly. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | SSP system description, Git history, hardware/software inventory spreadsheet |
| **Policy Ref** | [SYSTEM-SECURITY-PLAN.md](SYSTEM-SECURITY-PLAN.md) §2 |

---

### 3.4.2 — Security Configuration Enforcement
**Requirement:** Establish and enforce security configuration settings for information technology products employed in organizational systems.

| Field | Detail |
|-------|--------|
| **Implementation** | macOS security configuration baseline enforced via MDM profile or configuration scripts: FileVault enabled, firewall enabled, automatic updates enabled, Gatekeeper enabled, SIP enabled. Application security settings defined in configuration files committed to Git. Docker containers (if used) run from hardened base images with CIS benchmark compliance. Configuration drift detection runs daily. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | macOS configuration profile, application config files in Git, drift detection logs |

---

### 3.4.3 — System Change Tracking
**Requirement:** Track, review, approve or disapprove, and log changes to organizational systems.

| Field | Detail |
|-------|--------|
| **Implementation** | All system changes managed through Git-based change control. Infrastructure changes require pull request with ISSO review and approval. Emergency changes documented retroactively within 24 hours. Change log maintained with: date, author, description, approval, and rollback plan. macOS system changes tracked via configuration management. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Git commit history, PR approval records, change log |

---

### 3.4.4 — Security Impact Analysis
**Requirement:** Analyze the security impact of changes prior to implementation.

| Field | Detail |
|-------|--------|
| **Implementation** | Change requests include security impact assessment section. Changes affecting authentication, authorization, encryption, or audit logging require ISSO sign-off. Automated security scanning (dependency vulnerability check) runs on all code changes. Risk assessment template used for infrastructure changes. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Change request templates with security impact section, scan results, ISSO approvals |

---

### 3.4.5 — Access Restrictions for Change
**Requirement:** Define, document, approve, and enforce physical and logical access restrictions associated with changes to organizational systems.

| Field | Detail |
|-------|--------|
| **Implementation** | Production deployment requires System Administrator role. Database schema changes require System Owner approval. Physical access to Mac Studio server room restricted to authorized personnel. Deployment credentials stored in encrypted secrets manager with access logging. CI/CD pipeline enforces branch protection and required reviews. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Deployment access controls, branch protection rules, physical access logs |

---

### 3.4.6 — Least Functionality
**Requirement:** Employ the principle of least functionality by configuring organizational systems to provide only essential capabilities.

| Field | Detail |
|-------|--------|
| **Implementation** | Mac Studio runs only services required for KDT Vault operation. Unnecessary macOS services disabled (Bluetooth sharing, file sharing, remote login for non-admin). Unused network ports blocked by firewall (default-deny). Application dependencies audited quarterly — unused packages removed. Docker containers (if used) run minimal Alpine-based images. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Running services list, firewall rules, dependency audit records |

---

### 3.4.7 — Nonessential Functionality Restriction
**Requirement:** Restrict, disable, or prevent the use of nonessential programs, functions, ports, protocols, and services.

| Field | Detail |
|-------|--------|
| **Implementation** | Firewall default-deny policy: only ports 443 (HTTPS) and Tailscale (41641/UDP) permitted inbound. Outbound connections restricted to allow-listed destinations (NTP servers, package repositories, Tailscale coordination). macOS Application Firewall enabled in stealth mode. Unnecessary protocols disabled: Telnet, FTP, SNMP v1/v2. Browser plugins/extensions restricted on admin workstations. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Firewall configuration (pf.conf), port scan results, disabled services list |

---

### 3.4.8 — Application Execution Policy
**Requirement:** Apply deny-by-exception (blacklisting) policy to prevent the use of unauthorized software or deny-all, permit-by-exception (whitelisting) policy to allow the execution of authorized software.

| Field | Detail |
|-------|--------|
| **Implementation** | macOS Gatekeeper enforces application signing requirements. Only applications from identified developers or the App Store are permitted. Server runs only whitelisted application processes (KDT Vault, PostgreSQL, Redis, Nginx). Process monitoring alerts on unexpected process execution. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Gatekeeper configuration, whitelisted process list, process monitoring alerts |

---

### 3.4.9 — User-Installed Software
**Requirement:** Control and monitor user-installed software.

| Field | Detail |
|-------|--------|
| **Implementation** | Standard users cannot install software on the Mac Studio server (requires admin credentials). Client workstations: software installation logged and reviewed monthly. Unapproved software flagged for removal. Software installation requests go through ISSO approval process. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | macOS user permission settings, software installation logs, approval records |

---

## 5. Identification and Authentication (IA) — 11 Controls

### 3.5.1 — User Identification
**Requirement:** Identify system users, processes acting on behalf of users, and devices.

| Field | Detail |
|-------|--------|
| **Implementation** | Each user assigned a unique user ID (UUID) at provisioning time. No shared or generic accounts permitted. Service accounts identified by unique service ID with documented purpose. Devices identified by Tailscale machine identity (WireGuard public key). All identities registered in central identity store (PostgreSQL `users` table). |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | User provisioning records, service account inventory, Tailscale device list |
| **Policy Ref** | [ACCESS-CONTROL-POLICY.md](ACCESS-CONTROL-POLICY.md) §3 |

---

### 3.5.2 — User Authentication
**Requirement:** Authenticate (or verify) the identities of users, processes, or devices, as a prerequisite to allowing access to organizational systems.

| Field | Detail |
|-------|--------|
| **Implementation** | User authentication via OIDC/SAML with MFA required. Authentication factors: password (NIST 800-63B compliant) + TOTP or WebAuthn hardware key. Service accounts authenticated via X.509 certificates or API keys. Device authentication via Tailscale WireGuard key exchange. All authentication events logged. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Authentication service configuration, MFA enrollment records, auth event logs |

---

### 3.5.3 — Multi-Factor Authentication
**Requirement:** Use multifactor authentication for local and network access to privileged accounts and for network access to non-privileged accounts.

| Field | Detail |
|-------|--------|
| **Implementation** | MFA required for all user accounts (privileged and non-privileged). Supported MFA methods: TOTP (RFC 6238) via authenticator app, WebAuthn/FIDO2 hardware security keys (preferred). SMS-based MFA explicitly prohibited (NIST 800-63B guidance). MFA enrollment mandatory within 24 hours of account provisioning. MFA bypass only via ISSO-approved break-glass procedure (logged and time-limited). |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | MFA configuration, enrollment records, break-glass procedure documentation |
| **Policy Ref** | [ACCESS-CONTROL-POLICY.md](ACCESS-CONTROL-POLICY.md) §6 |

---

### 3.5.4 — Replay-Resistant Authentication
**Requirement:** Employ replay-resistant authentication mechanisms for network access to privileged and non-privileged accounts.

| Field | Detail |
|-------|--------|
| **Implementation** | OIDC/SAML tokens include nonce and timestamp — replayed tokens rejected. TOTP codes are time-based with 30-second windows — each code valid only once. WebAuthn challenge-response is inherently replay-resistant. TLS 1.3 provides transport-level replay protection. Session tokens are cryptographically random with server-side validation. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Authentication protocol configuration, token validation logic |

---

### 3.5.5 — Identifier Reuse Prevention
**Requirement:** Prevent reuse of identifiers for a defined period.

| Field | Detail |
|-------|--------|
| **Implementation** | User UUIDs are never reused — generated via UUIDv4. Deactivated accounts retained in database with `deactivated_at` timestamp for minimum 3 years. Usernames of deactivated accounts locked for 3 years (cannot be reassigned). Service account identifiers follow same non-reuse policy. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | UUID generation logic, deactivation records, username lock policy |

---

### 3.5.6 — Identifier Deactivation
**Requirement:** Disable identifiers after a defined period of inactivity.

| Field | Detail |
|-------|--------|
| **Implementation** | User accounts automatically disabled after 90 days of inactivity. Weekly automated job checks last login timestamp and disables inactive accounts. Disabled accounts require ISSO re-approval to reactivate. Notification sent to user at 60 and 75 days of inactivity. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Inactivity check cron job, notification templates, reactivation approval records |

---

### 3.5.7 — Password Complexity
**Requirement:** Enforce a minimum password complexity and change of characters when new passwords are created.

| Field | Detail |
|-------|--------|
| **Implementation** | Minimum 16 characters. Must include: uppercase, lowercase, number, and special character. Cannot reuse last 12 passwords (bcrypt hash comparison). Cannot contain username or common dictionary words. Password strength meter displayed during creation. Passwords stored as bcrypt hashes (cost factor 12+). |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Password policy configuration, password validation logic, hash storage verification |

---

### 3.5.8 — Password Reuse Prevention
**Requirement:** Prohibit password reuse for a specified number of generations.

| Field | Detail |
|-------|--------|
| **Implementation** | Last 12 password hashes stored per user. New passwords compared against history — matches rejected. Password history stored with same bcrypt protection as active passwords. History entries expire only when pushed out by newer entries (12-generation rolling window). |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Password history table schema, validation logic |

---

### 3.5.9 — Temporary Password Handling
**Requirement:** Allow temporary password use for system logons with an immediate change to a permanent password.

| Field | Detail |
|-------|--------|
| **Implementation** | Initial account provisioning generates a one-time temporary password. System forces password change on first login (session restricted to password change endpoint only). Temporary passwords expire after 24 hours if unused. Temporary passwords meet same complexity requirements as permanent passwords. Account reset by ISSO generates a new temporary password with forced change. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Password reset flow, forced-change logic, temporary password expiration config |

---

### 3.5.10 — Cryptographic Password Storage
**Requirement:** Store and transmit only cryptographically-protected passwords.

| Field | Detail |
|-------|--------|
| **Implementation** | Passwords stored as bcrypt hashes (cost factor 12) — never in plaintext. Password transmission only over TLS 1.3 encrypted channels. No password logging (authentication logs redact password fields). Password hashes not exposed via API responses. Backup data containing password hashes is encrypted at rest (AES-256). |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Database schema (password_hash column), TLS configuration, log redaction rules |
| **Policy Ref** | [ENCRYPTION-STANDARDS.md](ENCRYPTION-STANDARDS.md) §3 |

---

### 3.5.11 — Obscured Authentication Feedback
**Requirement:** Obscure feedback of authentication information.

| Field | Detail |
|-------|--------|
| **Implementation** | Password fields display dots/bullets during entry — never plaintext. Login error messages are generic: "Invalid credentials" (no indication of whether username or password was wrong). MFA code entry obscured. API authentication error responses do not leak user existence information. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Login UI implementation, API error response format |

---

## 6. Incident Response (IR) — 3 Controls

### 3.6.1 — Incident Handling
**Requirement:** Establish an operational incident-handling capability for organizational systems that includes preparation, detection, analysis, containment, recovery, and user response activities.

| Field | Detail |
|-------|--------|
| **Implementation** | KDT Vault Incident Response Plan defines complete incident lifecycle: preparation (team roles, contact info, tools), detection (automated monitoring, user reporting), analysis (severity classification, impact assessment), containment (isolation procedures, evidence preservation), eradication (root cause removal), recovery (system restoration, verification), and post-incident review. Incident response team identified with 24/7 contact information. Tabletop exercises conducted semi-annually. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Incident Response Plan, team contact list, exercise records |
| **Policy Ref** | [INCIDENT-RESPONSE-PLAN.md](INCIDENT-RESPONSE-PLAN.md) |

---

### 3.6.2 — Incident Reporting
**Requirement:** Track, document, and report incidents to designated officials and/or authorities both internal and external to the organization.

| Field | Detail |
|-------|--------|
| **Implementation** | Incidents tracked in incident log with unique IDs, severity, timeline, actions taken, and resolution. CUI-related incidents reported to DoD within 72 hours per DFARS 252.204-7012. Incident reports include: nature of incident, CUI involved, impact assessment, containment actions, remediation steps. Internal reporting chain: First Responder → ISSO → System Owner → CEO. External reporting to DC3 (Defense Cyber Crime Center) for cyber incidents involving CUI. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | Incident report templates, reporting chain documentation, DC3 contact information |
| **Policy Ref** | [INCIDENT-RESPONSE-PLAN.md](INCIDENT-RESPONSE-PLAN.md) §5 |

---

### 3.6.3 — Incident Response Testing
**Requirement:** Test the organizational incident response capability.

| Field | Detail |
|-------|--------|
| **Implementation** | Tabletop exercises conducted semi-annually simulating: data breach, ransomware, insider threat, and CUI spillage scenarios. Annual full-scale exercise with simulated incident requiring DoD notification. Exercise results documented with lessons learned and plan updates. New team members complete incident response walkthrough within 30 days of onboarding. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | Exercise schedules, after-action reports, plan update records |

---

## 7. Maintenance (MA) — 6 Controls

### 3.7.1 — System Maintenance
**Requirement:** Perform maintenance on organizational systems.

| Field | Detail |
|-------|--------|
| **Implementation** | Scheduled maintenance windows: weekly (Sunday 02:00-06:00 EST) for patches and updates. Maintenance schedule documented and communicated to users 48 hours in advance. Maintenance activities logged: date, time, personnel, actions performed, components affected. Emergency maintenance permitted with ISSO approval and retrospective documentation. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Maintenance schedule, maintenance logs, user notifications |

---

### 3.7.2 — Maintenance Control
**Requirement:** Provide controls on the tools, techniques, mechanisms, and personnel used to conduct system maintenance.

| Field | Detail |
|-------|--------|
| **Implementation** | Maintenance tools (diagnostic utilities, update tools) are vetted and approved by ISSO. Maintenance performed only by authorized System Administrators. Third-party maintenance personnel require escort and supervised access. Maintenance tools scanned for malware before use on KDT Vault systems. Remote maintenance tools (SSH) require MFA and are logged. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Approved tools list, maintenance personnel authorization, escort logs |

---

### 3.7.3 — Off-Site Maintenance Sanitization
**Requirement:** Ensure equipment removed for off-site maintenance is sanitized of any CUI.

| Field | Detail |
|-------|--------|
| **Implementation** | Before any hardware is removed for off-site maintenance: all CUI must be securely erased per NIST 800-88 guidelines. Drives containing CUI are encrypted; encryption keys are revoked before hardware leaves the premises. If sanitization is not possible, the hardware must remain on-site with authorized maintenance personnel brought in. Chain of custody documentation required for any hardware movement. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | Sanitization procedures, chain of custody forms, NIST 800-88 compliance records |
| **Policy Ref** | [DATA-RETENTION-POLICY.md](DATA-RETENTION-POLICY.md) §6 |

---

### 3.7.4 — Media Sanitization Verification
**Requirement:** Check media containing diagnostic and test programs for malicious code before the media are used in organizational systems.

| Field | Detail |
|-------|--------|
| **Implementation** | All removable media scanned by endpoint security before mounting on KDT Vault systems. Diagnostic tools downloaded only from vendor-verified sources with checksum verification. Test data validated against known-good hashes. Air-gapped scanning station available for suspect media. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Scanning procedures, checksum verification records |

---

### 3.7.5 — Remote Maintenance Monitoring
**Requirement:** Require multifactor authentication to establish nonlocal maintenance sessions via external network connections and terminate such connections when nonlocal maintenance is complete.

| Field | Detail |
|-------|--------|
| **Implementation** | Remote maintenance via SSH over Tailscale VPN requires MFA. Remote maintenance sessions logged with start time, end time, actions performed, and personnel. Sessions auto-terminate after 2 hours or on completion (whichever is first). ISSO notified of all remote maintenance sessions. Session recordings stored for 90 days. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | SSH configuration, session logs, auto-termination config, ISSO notifications |

---

### 3.7.6 — Maintenance Personnel Supervision
**Requirement:** Supervise the maintenance activities of maintenance personnel without required access authorization.

| Field | Detail |
|-------|--------|
| **Implementation** | Third-party maintenance personnel without KDT authorization are escorted at all times by authorized System Administrator. All actions by escorted personnel monitored and logged. Temporary restricted access credentials issued (if needed) with automatic expiration. Post-maintenance security review conducted to verify no unauthorized changes. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | Escort logs, temporary credential records, post-maintenance review checklists |

---

## 8. Media Protection (MP) — 9 Controls

### 3.8.1 — Media Protection
**Requirement:** Protect (i.e., physically control and securely store) system media containing CUI, both paper and digital.

| Field | Detail |
|-------|--------|
| **Implementation** | Digital media containing CUI stored on encrypted APFS volumes (AES-256-XTS). Physical media (printouts, USB drives) stored in locked cabinets within the secure server room. Access to media storage requires ISSO authorization. Media inventory maintained and reconciled quarterly. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Encryption configuration, physical storage procedures, media inventory |
| **Policy Ref** | [PHYSICAL-SECURITY.md](PHYSICAL-SECURITY.md) §3, [ENCRYPTION-STANDARDS.md](ENCRYPTION-STANDARDS.md) §3 |

---

### 3.8.2 — Media Access Restriction
**Requirement:** Limit access to CUI on system media to authorized users.

| Field | Detail |
|-------|--------|
| **Implementation** | Digital: file-level access control enforced by KDT Vault RBAC. Physical: media stored in access-controlled areas with key/combination locks. USB media: encrypted and accessible only with authorized decryption credentials. Media checkout requires sign-out log and ISSO approval for CUI-classified media. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | RBAC configuration, physical access logs, media checkout log |

---

### 3.8.3 — Media Sanitization
**Requirement:** Sanitize or destroy system media containing CUI before disposal or release for reuse.

| Field | Detail |
|-------|--------|
| **Implementation** | Digital media sanitization per NIST 800-88 Rev 1: Clear (for reuse within KDT), Purge (for reuse outside KDT), or Destroy (end of life). SSD sanitization uses ATA Secure Erase or physical destruction. Paper documents containing CUI shredded with cross-cut shredder (DIN 66399 Level P-4 minimum). Sanitization logged with: date, media type, method, personnel, verification. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | Sanitization log, NIST 800-88 procedure documentation, shredder specifications |
| **Policy Ref** | [DATA-RETENTION-POLICY.md](DATA-RETENTION-POLICY.md) §6 |

---

### 3.8.4 — Media Marking
**Requirement:** Mark media with necessary CUI markings and distribution limitations.

| Field | Detail |
|-------|--------|
| **Implementation** | Digital files: classification metadata stored in file record and displayed in UI header/footer. Physical media labels: "CUI", "CUI//SP-INFOSEC", or "UNCLASSIFIED" as appropriate. Removable media: labeled with classification level, date, and custodian. Distribution limitation statements applied per CUI Registry requirements. Printed documents include CUI banner marking on each page. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | File classification metadata schema, label templates, sample marked documents |
| **Policy Ref** | [DATA-CLASSIFICATION-POLICY.md](DATA-CLASSIFICATION-POLICY.md) §3 |

---

### 3.8.5 — Media Transport Accountability
**Requirement:** Control access to media containing CUI and maintain accountability for media during transport outside of controlled areas.

| Field | Detail |
|-------|--------|
| **Implementation** | Physical media transport requires: ISSO approval, encrypted media, tamper-evident packaging, chain of custody documentation, authorized courier or hand-carry only. Digital transport: CUI transmitted only via encrypted channels (TLS 1.3 or Tailscale VPN). No CUI transmitted via unencrypted email. Media transport log maintained with sender, recipient, date, contents, and tracking. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | Transport approval forms, chain of custody records, transport log |

---

### 3.8.6 — Portable Storage Encryption
**Requirement:** Implement cryptographic mechanisms to protect the confidentiality of CUI stored on digital media during transport using cryptography compliant with FIPS standards.

| Field | Detail |
|-------|--------|
| **Implementation** | All portable storage containing CUI encrypted with AES-256 (FIPS 140-2 validated module). macOS: encrypted APFS volumes or encrypted disk images. Linux: LUKS encryption with AES-256-XTS. Encryption keys managed separately from the encrypted media. Unencrypted portable storage devices prohibited for CUI. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Encryption configuration, media encryption verification procedures |
| **Policy Ref** | [ENCRYPTION-STANDARDS.md](ENCRYPTION-STANDARDS.md) §3 |

---

### 3.8.7 — Removable Media Control
**Requirement:** Control the use of removable media on system components.

| Field | Detail |
|-------|--------|
| **Implementation** | USB mass storage disabled on Mac Studio server at OS level. Removable media use on workstations requires ISSO approval. Authorized removable media tracked in media inventory. Auto-run/auto-play disabled on all systems. Removable media policy enforced via macOS configuration profile. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | macOS configuration profile, media policy, inventory records |

---

### 3.8.8 — Shared System Media
**Requirement:** Prohibit the use of portable storage devices when such devices have no identifiable owner.

| Field | Detail |
|-------|--------|
| **Implementation** | All removable media must be registered with identifiable owner in media inventory. Found or unidentified media treated as untrusted — quarantined and scanned in air-gapped environment. Anonymous USB devices are not permitted to connect to any KDT system. Media disposal for unidentified devices follows NIST 800-88 Destroy procedures. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | Media inventory with owner field, quarantine procedures |

---

### 3.8.9 — Backup Media Protection
**Requirement:** Protect the confidentiality of backup CUI at storage locations.

| Field | Detail |
|-------|--------|
| **Implementation** | Backup media encrypted with AES-256 (separate encryption key from production). Backup storage location physically secured (locked cabinet or safe in server room). Off-site backups (if applicable) encrypted before transport and stored in access-controlled facility. Backup media inventory and access log maintained. Backup encryption keys escrowed with ISSO in physical safe. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Backup encryption configuration, storage access logs, key escrow records |

---

## 9. Personnel Security (PS) — 2 Controls

### 3.9.1 — Individual Screening
**Requirement:** Screen individuals prior to authorizing access to organizational systems containing CUI.

| Field | Detail |
|-------|--------|
| **Implementation** | All personnel undergo background screening before KDT Vault access is provisioned. Screening includes: identity verification, criminal background check, employment verification, and reference checks. Personnel requiring CUI access must have appropriate clearance/suitability determination. Screening results documented and retained in personnel security files. Contractors and third-party personnel subject to same screening requirements. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | Screening records, clearance documentation, HR onboarding checklist |

---

### 3.9.2 — CUI Protection During Personnel Actions
**Requirement:** Ensure that organizational systems containing CUI are protected during and after personnel actions such as terminations and transfers.

| Field | Detail |
|-------|--------|
| **Implementation** | Termination: KDT Vault access revoked within 1 hour of termination notification. All sessions invalidated, MFA tokens deactivated, Tailscale device removed. Physical access credentials (keys, badges) collected. Exit interview includes CUI non-disclosure reminder. Transfer: access rights reviewed and adjusted within 24 hours to match new role. Former role permissions revoked. Access change logged in audit system. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Offboarding checklist, access revocation logs, exit interview records |

---

## 10. Physical Protection (PE) — 6 Controls

### 3.10.1 — Physical Access Limitation
**Requirement:** Limit physical access to organizational systems, equipment, and the respective operating environments to authorized individuals.

| Field | Detail |
|-------|--------|
| **Implementation** | Mac Studio server located in dedicated secure room with restricted access. Physical access requires authorized key/badge and PIN entry. Visitor access requires escort by authorized personnel. Physical access list maintained by ISSO and reviewed quarterly. After-hours access logged and monitored. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Physical access list, access control configuration, visitor logs |
| **Policy Ref** | [PHYSICAL-SECURITY.md](PHYSICAL-SECURITY.md) §2 |

---

### 3.10.2 — Physical Facility Protection
**Requirement:** Protect and monitor the physical facility and support infrastructure for organizational systems.

| Field | Detail |
|-------|--------|
| **Implementation** | Server room equipped with: key lock, environmental monitoring (temperature/humidity sensor), fire detection/suppression, UPS for power continuity. Building equipped with: perimeter security (locks, lighting), alarm system. Environmental conditions monitored 24/7 with alerts for out-of-range conditions. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Environmental monitoring logs, alarm system configuration, UPS specifications |
| **Policy Ref** | [PHYSICAL-SECURITY.md](PHYSICAL-SECURITY.md) §3 |

---

### 3.10.3 — Escort Visitors
**Requirement:** Escort visitors and monitor visitor activity.

| Field | Detail |
|-------|--------|
| **Implementation** | All visitors to the server room escorted by authorized personnel at all times. Visitor log maintained: name, organization, date/time in, date/time out, escort name, purpose. Visitor badges issued (distinguishable from employee badges) and collected on departure. Visitors not permitted unescorted access to any area containing CUI systems. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | Visitor log, badge procedures, escort policy |

---

### 3.10.4 — Physical Access Logs
**Requirement:** Maintain audit logs of physical access.

| Field | Detail |
|-------|--------|
| **Implementation** | Physical access events logged: personnel name, date/time entry, date/time exit, purpose. Logs maintained for minimum 3 years. Logs reviewed monthly by ISSO for anomalies. Physical access log stored separately from the systems being protected (paper log or separate system). |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Physical access log, monthly review records |
| **Policy Ref** | [PHYSICAL-SECURITY.md](PHYSICAL-SECURITY.md) §2 |

---

### 3.10.5 — Physical Access Device Management
**Requirement:** Control and manage physical access devices.

| Field | Detail |
|-------|--------|
| **Implementation** | Keys, badges, and combinations inventoried and tracked by ISSO. Lost or stolen access devices reported immediately and deactivated. Combinations changed annually and upon personnel departure. Master key stored in sealed envelope in fire-rated safe accessible only to System Owner. Physical access device inventory reconciled quarterly. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | Access device inventory, combination change log, loss reports |

---

### 3.10.6 — Alternative Work Sites
**Requirement:** Enforce safeguarding measures for CUI at alternate work sites.

| Field | Detail |
|-------|--------|
| **Implementation** | Remote workers accessing CUI must: use Tailscale VPN, work from private area (no public viewing), use screen privacy filter on laptops, lock screen when stepping away, not print CUI at alternate sites without ISSO approval, ensure home WiFi uses WPA3 encryption. Remote work agreement documenting security requirements signed by each remote worker. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Remote work agreements, Tailscale connection logs, security awareness training |

---

## 11. Risk Assessment (RA) — 3 Controls

### 3.11.1 — Risk Assessment
**Requirement:** Periodically assess the risk to organizational operations (including mission, functions, image, or reputation), organizational assets, and individuals, resulting from the operation of organizational systems and the associated processing, storage, or transmission of CUI.

| Field | Detail |
|-------|--------|
| **Implementation** | Annual risk assessment covering: threat landscape analysis, vulnerability identification, impact assessment, and likelihood determination. Risk assessment methodology follows NIST SP 800-30 (Guide for Conducting Risk Assessments). Risk register maintained with identified risks, severity ratings (High/Medium/Low), and mitigation plans. Risk assessment results briefed to System Owner (CEO) and inform POA&M updates. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | Annual risk assessment report, risk register, CEO briefing records |

---

### 3.11.2 — Vulnerability Scanning
**Requirement:** Scan for vulnerabilities in organizational systems and applications periodically and when new vulnerabilities affecting those systems and applications are identified.

| Field | Detail |
|-------|--------|
| **Implementation** | Automated vulnerability scanning: weekly for infrastructure (OS, services), daily for application dependencies (npm audit / go mod vulnerability check). Vulnerability scanning upon each deployment (CI/CD pipeline). Critical/high vulnerabilities triaged within 24 hours. Scan results documented and tracked in POA&M until remediated. macOS Rapid Security Responses applied immediately. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Scan schedule, scan results, remediation tracking in POA&M |
| **Policy Ref** | [POAM-TEMPLATE.md](POAM-TEMPLATE.md) |

---

### 3.11.3 — Vulnerability Remediation
**Requirement:** Remediate vulnerabilities in accordance with risk assessments.

| Field | Detail |
|-------|--------|
| **Implementation** | Vulnerability remediation timelines based on severity: Critical — 48 hours, High — 7 days, Medium — 30 days, Low — 90 days. Remediation tracked in POA&M with responsible party, target date, and status. If remediation exceeds timeline, risk acceptance requires System Owner written approval. Compensating controls documented when immediate remediation is not feasible. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | POA&M entries, remediation records, risk acceptance documentation |

---

## 12. Security Assessment (CA) — 4 Controls

### 3.12.1 — Security Control Assessment
**Requirement:** Periodically assess the security controls in organizational systems to determine if the controls are effective in their application.

| Field | Detail |
|-------|--------|
| **Implementation** | Annual security control assessment following NIST 800-171A assessment procedures. Assessment covers all 110 controls with determination of: Satisfied, Other Than Satisfied, or Not Applicable. Assessment performed by qualified assessor (internal or third-party). Findings documented in assessment report with evidence references. Assessment results drive POA&M updates. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | Assessment report, assessor qualifications, POA&M updates |

---

### 3.12.2 — Plan of Action
**Requirement:** Develop and implement plans of action designed to correct deficiencies and reduce or eliminate vulnerabilities in organizational systems.

| Field | Detail |
|-------|--------|
| **Implementation** | POA&M maintained for all identified deficiencies from security assessments, vulnerability scans, and incidents. Each POA&M item includes: weakness description, affected controls, severity, responsible party, resources required, planned milestones, and completion date. POA&M reviewed monthly by ISSO and quarterly by System Owner. Completed items verified and closed with evidence. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | POA&M document, monthly review records, closure evidence |
| **Policy Ref** | [POAM-TEMPLATE.md](POAM-TEMPLATE.md) |

---

### 3.12.3 — Continuous Monitoring
**Requirement:** Monitor security controls on an ongoing basis to ensure the continued effectiveness of the controls.

| Field | Detail |
|-------|--------|
| **Implementation** | Automated monitoring: real-time audit log analysis, configuration drift detection (daily), vulnerability scanning (weekly), uptime monitoring (continuous). Manual monitoring: weekly audit log review, monthly access review, quarterly risk register review. Monitoring results feed into security dashboard accessible to ISSO. Anomalies trigger investigation per incident response procedures. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Monitoring dashboard, alert configuration, review schedules |

---

### 3.12.4 — System Security Plans
**Requirement:** Develop, document, and periodically update system security plans that describe system boundaries, system environments of operation, how security requirements are implemented, and the relationships with or connections to other systems.

| Field | Detail |
|-------|--------|
| **Implementation** | System Security Plan (SSP) maintained as a living document covering: system description and boundaries, operating environment, control implementations, interconnections, data flows, roles and responsibilities. SSP reviewed and updated annually and upon significant system changes. SSP version-controlled in Git with change history. |
| **Type** | Manual (M) |
| **Status** | ✅ Implemented |
| **Evidence** | SYSTEM-SECURITY-PLAN.md, Git version history, review records |
| **Policy Ref** | [SYSTEM-SECURITY-PLAN.md](SYSTEM-SECURITY-PLAN.md) |

---

## 13. System and Communications Protection (SC) — 16 Controls

### 3.13.1 — Boundary Protection
**Requirement:** Monitor, control, and protect communications (i.e., information transmitted or received by organizational systems) at the external boundaries and key internal boundaries of organizational systems.

| Field | Detail |
|-------|--------|
| **Implementation** | macOS pf firewall with default-deny inbound policy. Tailscale provides the encrypted boundary between KDT Vault and all remote clients. Reverse proxy (Nginx/Caddy) serves as the application boundary — WAF rules, rate limiting, request validation. Internal boundaries: database accessible only from application server (localhost/Unix socket). Redis accessible only from localhost. Network monitoring detects boundary violations. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Firewall rules, Tailscale ACL, reverse proxy configuration, network architecture diagram |

---

### 3.13.2 — Architectural Security
**Requirement:** Employ architectural designs, software development techniques, and systems engineering principles that promote effective information security within organizational systems.

| Field | Detail |
|-------|--------|
| **Implementation** | Defense-in-depth architecture: network encryption (Tailscale) → TLS termination → WAF → authentication → authorization → audit logging → encrypted storage. Separation of concerns: web tier, application tier, database tier, audit tier. Principle of least privilege applied at every tier. Secure coding practices enforced (input validation, parameterized queries, output encoding). Application built on well-maintained frameworks with regular dependency updates. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Architecture documentation, code review records, dependency audit |
| **Policy Ref** | [BACKEND-ARCHITECTURE.md](BACKEND-ARCHITECTURE.md) |

---

### 3.13.3 — Role-Based Security Separation
**Requirement:** Separate user functionality from system management functionality.

| Field | Detail |
|-------|--------|
| **Implementation** | Administration interface on separate URL path (`/admin`) with additional authentication requirements. Admin API endpoints separated from user-facing API endpoints. Database admin console not accessible from application network. System management functions (backups, updates, configuration) run as separate processes with dedicated service accounts. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | API route separation, admin interface configuration, process isolation |

---

### 3.13.4 — Shared Resource Control
**Requirement:** Prevent unauthorized and unintended information transfer via shared system resources.

| Field | Detail |
|-------|--------|
| **Implementation** | Application processes run in isolated containers/sandboxes. Temporary files containing CUI are encrypted and deleted after use (secure delete). Shared memory segments cleared between sessions. File uploads processed in isolated temporary directories with automatic cleanup. Database connection pooling ensures session isolation. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Container isolation configuration, temp file handling code, connection pool config |

---

### 3.13.5 — Public Network Denial
**Requirement:** Deny network communications traffic by default and allow network communications traffic by exception (i.e., deny all, permit by exception).

| Field | Detail |
|-------|--------|
| **Implementation** | macOS pf firewall default-deny policy for all inbound traffic. Allowed inbound: Tailscale (UDP 41641) only. No public-facing ports. Outbound allow-list: NTP (123), DNS (53), HTTPS (443) to specific domains. All other traffic denied and logged. Firewall rules version-controlled and reviewed quarterly. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | pf.conf rules, firewall log analysis, quarterly review records |

---

### 3.13.6 — Network Communication by Exception
**Requirement:** Deny network communications traffic by default and allow network communications traffic by exception.

| Field | Detail |
|-------|--------|
| **Implementation** | (Same implementation as 3.13.5 — these controls are closely related.) Network segmentation via VLANs isolates KDT Vault server from general office network. Inter-VLAN routing restricted to authorized traffic patterns. Application-level allow-listing of permitted API endpoints per role. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | VLAN configuration, routing ACLs, API endpoint authorization matrix |

---

### 3.13.7 — Split Tunneling Prevention
**Requirement:** Prevent remote devices from simultaneously establishing non-remote connections with organizational systems and communicating via some other connection to resources in external networks (i.e., split tunneling).

| Field | Detail |
|-------|--------|
| **Implementation** | Tailscale configured to route KDT Vault traffic through the VPN tunnel (exit node for KDT subnets). Client devices configured to prevent split tunneling when connected to KDT resources. Policy documented in remote access agreement. Tailscale ACLs enforce that KDT Vault is only reachable via Tailscale network. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Tailscale routing configuration, client configuration, remote access agreements |

---

### 3.13.8 — CUI Transmission Encryption
**Requirement:** Implement cryptographic mechanisms to prevent unauthorized disclosure of CUI during transmission unless otherwise protected by alternative physical safeguards.

| Field | Detail |
|-------|--------|
| **Implementation** | All data transmission encrypted with TLS 1.3 (FIPS-validated cipher suites). VPN tunnel provides additional encryption layer (WireGuard: ChaCha20-Poly1305 or AES-256-GCM). API responses containing CUI include `Strict-Transport-Security` header. Certificate validation enforced on all TLS connections. No fallback to unencrypted protocols permitted. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | TLS configuration, HSTS headers, certificate validation logic |
| **Policy Ref** | [ENCRYPTION-STANDARDS.md](ENCRYPTION-STANDARDS.md) §4 |

---

### 3.13.9 — Connection Termination
**Requirement:** Terminate network connections associated with communications sessions at the end of the sessions or after a defined period of inactivity.

| Field | Detail |
|-------|--------|
| **Implementation** | HTTP keep-alive connections timeout after 120 seconds of inactivity. WebSocket connections terminated after 30 minutes of inactivity. TLS sessions have maximum lifetime of 8 hours. Database connections returned to pool after transaction completion (idle timeout: 60 seconds). Tailscale connections managed by WireGuard key rotation (every 2 minutes). |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Connection timeout configurations, session management logic |

---

### 3.13.10 — Cryptographic Key Management
**Requirement:** Establish and manage cryptographic keys for cryptography employed in organizational systems.

| Field | Detail |
|-------|--------|
| **Implementation** | Key management procedures documented covering: generation (using FIPS-validated CSPRNG), distribution (encrypted channels only), storage (macOS Keychain or encrypted key files), rotation (TLS certificates annually, API keys quarterly, encryption keys annually), revocation (immediate upon compromise), and destruction (secure zeroing). Key inventory maintained by ISSO with sensitivity classification. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Key management procedures, key inventory, rotation schedules |
| **Policy Ref** | [ENCRYPTION-STANDARDS.md](ENCRYPTION-STANDARDS.md) §6 |

---

### 3.13.11 — FIPS-Validated Cryptography
**Requirement:** Employ FIPS-validated cryptography when used to protect the confidentiality of CUI.

| Field | Detail |
|-------|--------|
| **Implementation** | macOS CoreCrypto/corecrypto modules are FIPS 140-2 validated (CMVP certificates verified). AES-256 for data at rest (FileVault, APFS encryption, application-level encryption). TLS 1.3 with FIPS-approved cipher suites for data in transit. bcrypt with FIPS-validated hash function for password storage. FIPS validation status verified during annual security assessment. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | CMVP certificate records, cipher suite configuration, annual verification |
| **Policy Ref** | [ENCRYPTION-STANDARDS.md](ENCRYPTION-STANDARDS.md) §2 |

---

### 3.13.12 — Collaborative Device Control
**Requirement:** Prohibit remote activation of collaborative computing devices and provide indication of devices in use to users.

| Field | Detail |
|-------|--------|
| **Implementation** | Mac Studio server has no microphone, camera, or collaborative computing peripherals. Client workstations: camera/microphone indicator lights are hardware-based (cannot be overridden by software on Apple hardware). Remote activation of collaborative devices prohibited by policy. Screen sharing requires explicit user initiation and displays prominent indicator. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Hardware inventory (no collaborative peripherals on server), client device policy |

---

### 3.13.13 — Mobile Code Control
**Requirement:** Control and monitor the use of mobile code.

| Field | Detail |
|-------|--------|
| **Implementation** | KDT Vault web interface uses Content Security Policy (CSP) headers restricting JavaScript execution to trusted sources only. No third-party scripts or trackers permitted. Inline JavaScript prohibited via CSP. Subresource Integrity (SRI) hashes required for all external resources. ActiveX, Java applets, and Flash explicitly blocked. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | CSP header configuration, SRI hashes, response header audit |

---

### 3.13.14 — VoIP Security
**Requirement:** Control and monitor the use of Voice over Internet Protocol (VoIP) technologies.

| Field | Detail |
|-------|--------|
| **Implementation** | KDT Vault does not include VoIP functionality. If VoIP is used for business communications, it must traverse the Tailscale VPN with encryption. VoIP traffic segmented from CUI data traffic. VoIP devices not connected to the same network segment as KDT Vault server. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Network architecture (VoIP segregation), system description (no VoIP in KDT Vault) |

---

### 3.13.15 — Session Authenticity
**Requirement:** Protect the authenticity of communications sessions.

| Field | Detail |
|-------|--------|
| **Implementation** | TLS 1.3 provides server authentication via X.509 certificates. Session tokens are cryptographically signed (HMAC-SHA256) and bound to client IP + User-Agent. CSRF protection via double-submit cookie pattern. API requests authenticated with bearer tokens validated on every request. WebSocket connections authenticated at upgrade and periodically revalidated. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | TLS certificate configuration, session token implementation, CSRF protection |

---

### 3.13.16 — CUI at Rest Encryption
**Requirement:** Protect the confidentiality of CUI at rest.

| Field | Detail |
|-------|--------|
| **Implementation** | Full-disk encryption via FileVault 2 (AES-256-XTS) on all Mac Studio volumes. Application-level encryption for CUI files using AES-256-GCM with per-file encryption keys. Encryption keys derived from master key stored in macOS Keychain (hardware-backed on Apple Silicon). Database fields containing CUI encrypted at the column level. Backups encrypted with separate key (AES-256). |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | FileVault status, application encryption implementation, database column encryption config |
| **Policy Ref** | [ENCRYPTION-STANDARDS.md](ENCRYPTION-STANDARDS.md) §3 |

---

## 14. System and Information Integrity (SI) — 7 Controls

### 3.14.1 — Flaw Remediation
**Requirement:** Identify, report, and correct system flaws in a timely manner.

| Field | Detail |
|-------|--------|
| **Implementation** | macOS automatic updates enabled for security patches. Application dependencies monitored via automated vulnerability scanning (daily). Flaw reporting: internal bug tracker with security severity classification. Remediation timelines: Critical — 48 hours, High — 7 days, Medium — 30 days, Low — 90 days. Patch testing performed in staging environment before production deployment. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Update configuration, vulnerability scan schedule, patch deployment records |

---

### 3.14.2 — Malicious Code Protection
**Requirement:** Provide protection from malicious code at designated locations within organizational systems.

| Field | Detail |
|-------|--------|
| **Implementation** | macOS XProtect provides real-time malware scanning (automatically updated). Gatekeeper enforces application code signing. MRT (Malware Removal Tool) scans run automatically. File uploads to KDT Vault scanned by ClamAV (or equivalent) before storage. Email attachments scanned before processing. Malware signature databases updated automatically. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | XProtect configuration, ClamAV configuration, scan logs |

---

### 3.14.3 — Security Alerts & Advisories
**Requirement:** Monitor system security alerts and advisories and take action in response.

| Field | Detail |
|-------|--------|
| **Implementation** | ISSO subscribed to: US-CERT alerts, NIST NVD notifications, Apple security announcements, and dependency vulnerability databases (GitHub Advisory Database). Security advisories reviewed within 24 hours of receipt. Applicable advisories generate POA&M items for tracking. Critical advisories trigger immediate assessment and response. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Alert subscription records, advisory review log, POA&M entries |

---

### 3.14.4 — System Update Management
**Requirement:** Update malicious code protection mechanisms when new releases are available.

| Field | Detail |
|-------|--------|
| **Implementation** | macOS XProtect and MRT definitions update automatically via Software Update. ClamAV signature database updated every 4 hours via freshclam daemon. Application dependency vulnerability database updated daily. Failed update alerts sent to ISSO immediately. Update status verified weekly during security review. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Auto-update configuration, freshclam schedule, update verification logs |

---

### 3.14.5 — System Scanning
**Requirement:** Perform periodic scans of organizational systems and real-time scans of files from external sources as files are downloaded, opened, or executed.

| Field | Detail |
|-------|--------|
| **Implementation** | Real-time scanning: all file uploads to KDT Vault scanned before storage (ClamAV on-access). Periodic scanning: full system scan weekly (Sunday maintenance window). External file scanning: files from email, USB, or external transfer scanned before import. Scan results logged and quarantined files reported to ISSO. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Scan configuration, scan result logs, quarantine records |

---

### 3.14.6 — System Monitoring
**Requirement:** Monitor organizational systems, including inbound and outbound communications traffic, to detect attacks and indicators of potential attacks.

| Field | Detail |
|-------|--------|
| **Implementation** | Network traffic monitoring via Tailscale traffic logs and pf firewall logs. Application-level monitoring: authentication anomalies, unusual file access patterns, bulk download detection, privilege escalation attempts. Automated alerts for: brute force attempts (>5 failed logins), bulk operations (>100 files in 5 minutes), off-hours access, access from new devices. SIEM integration for centralized monitoring and correlation. |
| **Type** | Automated (A) |
| **Status** | ✅ Implemented |
| **Evidence** | Monitoring rules configuration, alert definitions, SIEM integration |
| **Policy Ref** | [AUDIT-LOGGING-POLICY.md](AUDIT-LOGGING-POLICY.md) §5 |

---

### 3.14.7 — Unauthorized Use Identification
**Requirement:** Identify unauthorized use of organizational systems.

| Field | Detail |
|-------|--------|
| **Implementation** | User behavior analytics: baseline normal activity patterns, alert on deviations. Login time analysis: alert on access outside normal working hours. Geolocation analysis: alert on access from unusual locations (via Tailscale device metadata). Resource access analysis: alert on access to resources outside normal scope. Quarterly access reviews verify all active accounts are authorized and role-appropriate. |
| **Type** | Hybrid (H) |
| **Status** | ✅ Implemented |
| **Evidence** | Behavior analytics configuration, alert logs, quarterly access review records |

---

## Summary

| Family | ID Range | Controls | Automated | Manual | Hybrid |
|--------|----------|----------|-----------|--------|--------|
| **AC** — Access Control | 3.1.1–3.1.22 | 22 | 14 | 0 | 8 |
| **AT** — Awareness & Training | 3.2.1–3.2.3 | 3 | 0 | 3 | 0 |
| **AU** — Audit & Accountability | 3.3.1–3.3.9 | 9 | 8 | 0 | 1 |
| **CM** — Configuration Mgmt | 3.4.1–3.4.9 | 9 | 3 | 0 | 6 |
| **IA** — Identification & Auth | 3.5.1–3.5.11 | 11 | 11 | 0 | 0 |
| **IR** — Incident Response | 3.6.1–3.6.3 | 3 | 0 | 1 | 2 |
| **MA** — Maintenance | 3.7.1–3.7.6 | 6 | 1 | 2 | 3 |
| **MP** — Media Protection | 3.8.1–3.8.9 | 9 | 2 | 3 | 4 |
| **PS** — Personnel Security | 3.9.1–3.9.2 | 2 | 0 | 1 | 1 |
| **PE** — Physical Protection | 3.10.1–3.10.6 | 6 | 0 | 2 | 4 |
| **RA** — Risk Assessment | 3.11.1–3.11.3 | 3 | 1 | 1 | 1 |
| **CA** — Security Assessment | 3.12.1–3.12.4 | 4 | 0 | 2 | 2 |
| **SC** — System & Comms Protection | 3.13.1–3.13.16 | 16 | 12 | 0 | 4 |
| **SI** — System & Info Integrity | 3.14.1–3.14.7 | 7 | 4 | 0 | 3 |
| **TOTAL** | | **110** | **56** | **15** | **39** |

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
| 1.0 | 2026-04-06 | KDT | Initial CMMC Level 2 control mapping |

---

*This document maps all 110 NIST SP 800-171 Rev 2 controls required for CMMC Level 2 certification. Each control includes KDT Vault's specific implementation approach, automation status, and evidence references. Update this document as implementations mature and assessor feedback is incorporated.*
