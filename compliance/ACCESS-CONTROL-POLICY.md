# Access Control Policy

**Knight Division Tactical — KDT Vault**

| Field | Value |
|-------|-------|
| **Policy Owner** | CEO / ISSO |
| **Effective Date** | *(upon approval)* |
| **Review Cycle** | Annual |
| **Classification** | CUI // SP-INFOSEC |
| **NIST 800-171 Families** | AC (Access Control), IA (Identification & Authentication) |

---

## 1. Purpose

This policy defines who can access what within KDT Vault, how access is granted, authenticated, reviewed, and revoked. It implements the Access Control (AC) and Identification and Authentication (IA) control families of NIST SP 800-171.

## 2. Scope

All users, systems, and services that access KDT Vault, including remote access via VPN/Tailscale.

## 3. Role Definitions

### 3.1 System Roles

| Role | Description | Personnel |
|------|-------------|-----------|
| **System Owner** | Ultimate authority over KDT Vault; approves security posture | CEO (Michael Schulz) |
| **ISSO** | Information System Security Officer; manages day-to-day security operations | *(appointed — recommend dedicated role)* |
| **System Administrator** | Manages KDT Vault infrastructure, OS, backups, updates | IT / DevOps staff |
| **Security Auditor** | Read-only access to audit logs, security reports, compliance dashboards | ISSO + designated auditors |

### 3.2 Business Roles

| Role | Description | Max Classification Access |
|------|-------------|--------------------------|
| **CEO** | Chief Executive Officer — full system access | CUI + CONFIDENTIAL |
| **COO** | Chief Operating Officer — operational access | CUI + CONFIDENTIAL |
| **Operations Manager** | Manages field operations, logistics | CUI (operational scope) |
| **Account Executive (Gov)** | Government account management | CUI (contract scope) |
| **Account Executive (Civ)** | Civilian account management | CONFIDENTIAL (business scope) |
| **Field Operator** | Field personnel with limited document access | CUI (assigned projects only) |
| **Finance / Accounting** | Financial records, invoicing | CONFIDENTIAL (financial scope) |
| **Technical Manager** | Technical program management | CUI + CONFIDENTIAL |
| **Software Architect** | System development, technical documentation | CUI (technical scope) |
| **General Employee** | Standard business operations | UNCLASSIFIED + need-to-know CONFIDENTIAL |

### 3.3 Service Accounts

| Account | Purpose | Access Level |
|---------|---------|-------------|
| `vault-backup` | Automated backup service | Read-only to all files; write to backup storage |
| `vault-audit` | Audit log pipeline | Write to audit log store; no file access |
| `vault-scanner` | Malware/classification scanner | Read-only to uploaded files |
| `vault-api` | API gateway service account | Delegated per-request user permissions |

Service accounts:
- Cannot log in interactively
- Authenticated via certificate or API key (no password)
- Scoped to minimum required permissions
- Reviewed quarterly alongside user accounts

## 4. Access Control Matrix

### 4.1 Role-to-Classification Matrix

| Role | UNCLASSIFIED | CONFIDENTIAL | CUI |
|------|:---:|:---:|:---:|
| CEO | ✅ Full | ✅ Full | ✅ Full |
| COO | ✅ Full | ✅ Full | ✅ Full |
| ISSO | ✅ Full | ✅ Full | ✅ Full (security scope) |
| System Administrator | ✅ Full | ✅ Infrastructure only | ✅ Infrastructure only |
| Operations Manager | ✅ Full | ✅ Ops scope | ✅ Ops scope |
| Account Executive (Gov) | ✅ Full | ✅ Contract scope | ✅ Contract scope |
| Account Executive (Civ) | ✅ Full | ✅ Business scope | ❌ |
| Field Operator | ✅ Assigned | ✅ Assigned | ✅ Assigned projects |
| Finance / Accounting | ✅ Full | ✅ Financial scope | ❌ |
| Technical Manager | ✅ Full | ✅ Full | ✅ Technical scope |
| Software Architect | ✅ Full | ✅ Technical scope | ✅ Technical scope |
| General Employee | ✅ Full | ✅ Need-to-know | ❌ |

### 4.2 Permission Model

KDT Vault implements a **Role-Based Access Control (RBAC)** model with additional **Attribute-Based Access Control (ABAC)** for classification-level enforcement:

```
Access Decision = Role Permission ∩ Classification Clearance ∩ Need-to-Know ∩ Active Session
```

- **Role Permission:** What the role is allowed to do (read, write, delete, share, admin)
- **Classification Clearance:** Maximum classification level the user is authorized for
- **Need-to-Know:** Is the user assigned to the project/folder/document?
- **Active Session:** Is the user authenticated with valid MFA within session timeout?

### 4.3 File-Level Permissions

| Permission | Description |
|------------|-------------|
| `READ` | View file content and metadata |
| `WRITE` | Edit file content, upload new versions |
| `DELETE` | Move file to trash (soft delete; hard delete requires admin) |
| `SHARE` | Grant access to other authorized users |
| `CLASSIFY` | Set or change classification level |
| `ADMIN` | Manage folder structure, bulk operations, retention overrides |

## 5. Authentication Requirements

### 5.1 Multi-Factor Authentication (MFA)

**MFA is mandatory for all users. No exceptions.**

| Factor | Implementation |
|--------|---------------|
| **Something you know** | Password (see Section 5.2) |
| **Something you have** | TOTP authenticator app (preferred) or WebAuthn/FIDO2 hardware key |
| **Something you are** | *(optional future — biometric via WebAuthn)* |

**MFA Enforcement:**
- Required on every login
- Required when accessing CUI for the first time in a session
- Required for all administrative actions
- Required for remote access (Tailscale + application-level MFA)
- Session timeout: 15 minutes idle → re-authentication required
- Absolute session timeout: 8 hours → full re-login required

**MFA Recovery:**
- Recovery codes generated at MFA enrollment (10 single-use codes)
- Recovery codes stored securely by user (printed, not digital)
- Lost MFA: Identity verification by ISSO in person or via video call with government-issued ID
- Temporary access: ISSO may grant 24-hour single-use bypass; logged as security event

### 5.2 Password Policy (NIST SP 800-63B Aligned)

| Requirement | Value | Rationale |
|-------------|-------|-----------|
| Minimum length | 12 characters | NIST 800-63B recommendation |
| Maximum length | 128 characters | Support passphrases |
| Complexity rules | None (no forced special chars/uppercase/numbers) | NIST 800-63B: complexity rules reduce security |
| Forced rotation | None | NIST 800-63B: periodic rotation harms security |
| Breach list check | Required | Passwords checked against Have I Been Pwned API (k-anonymity model) on creation and change |
| Dictionary check | Required | Common passwords and dictionary words blocked |
| Context check | Required | Username, email, company name variants blocked |
| Password history | Last 10 passwords | Cannot reuse recent passwords |
| Failed attempts | 5 attempts → 15-minute lockout; 15 attempts → account locked pending ISSO review | Brute force protection |
| Storage | bcrypt (cost factor 12) or Argon2id | Never stored in plaintext |

**Password Change Triggers:**
- Suspected compromise (mandatory immediate change)
- User request (any time)
- NOT on a schedule (per NIST 800-63B)

### 5.3 Session Management

| Parameter | Value |
|-----------|-------|
| Session token | Cryptographically random, 256-bit minimum |
| Idle timeout | 15 minutes |
| Absolute timeout | 8 hours |
| Concurrent sessions | Maximum 3 per user |
| Session binding | Bound to IP + User-Agent; changes trigger re-auth |
| Token storage | HttpOnly, Secure, SameSite=Strict cookies |
| Logout | Immediate server-side session invalidation |

## 6. Account Lifecycle

### 6.1 Provisioning (New Account)

1. **Request:** Department manager submits account request specifying:
   - Full name, email, department
   - Requested role(s)
   - Requested classification access level
   - Business justification for CUI access (if applicable)
2. **Approval:**
   - Standard roles: Manager + ISSO approval
   - CUI access: Manager + ISSO + CEO approval
   - Admin/privileged roles: CEO approval required
3. **Creation:**
   - System Administrator creates account with approved role
   - Temporary password generated and delivered securely (in person or encrypted channel)
   - MFA enrollment required on first login
   - User must change password on first login
4. **Training:**
   - User must complete security awareness training before CUI access is granted
   - Training completion recorded in system
5. **Audit:**
   - Account creation logged with approver chain
   - Provisioning ticket retained for 3 years

### 6.2 Modification

- Role changes require same approval chain as provisioning
- Classification level upgrades require ISSO + CEO approval
- Temporary elevated access: Maximum 72 hours, logged, auto-reverts

### 6.3 Deprovisioning (Account Removal)

**Voluntary Departure:**
1. HR notifies IT and ISSO of departure date
2. **On last day:**
   - All active sessions terminated
   - Account disabled (not deleted — retain for audit)
   - MFA tokens revoked
   - All shared files reviewed for ownership transfer
   - VPN/Tailscale device removed
   - Physical access revoked (keys, badges returned)
3. **Within 24 hours:**
   - Account fully disabled in KDT Vault
   - Personal devices wiped of KDT data (if MDM enrolled)
4. **Audit:** Deprovisioning logged with timestamp and responsible admin

**Involuntary Termination:**
1. HR notifies IT and ISSO **before** employee is informed
2. **Simultaneously with notification:**
   - Account immediately disabled
   - All active sessions terminated
   - VPN access revoked
   - Physical access revoked
3. All deprovisioning steps completed within 1 hour
4. ISSO reviews recent activity for data exfiltration indicators

**Contractor/Temporary Access:**
- Access expires automatically on contract end date
- Maximum access duration: 1 year (renewable with re-approval)
- Quarterly confirmation from sponsoring manager that access is still needed

## 7. Quarterly Access Reviews

**Frequency:** Every 90 days  
**Responsible:** ISSO (conducts), CEO (approves results)

### Review Process:
1. ISSO generates full user access report from KDT Vault
2. For each user, verify:
   - [ ] User is still employed/contracted by KDT
   - [ ] Role is still appropriate for current job function
   - [ ] Classification access level matches current need
   - [ ] No unused accounts (no login in 90+ days)
   - [ ] No excessive permissions beyond role requirements
   - [ ] MFA is enrolled and active
   - [ ] Security training is current
3. Department managers confirm their direct reports' access is appropriate
4. ISSO documents findings and remediation actions
5. CEO signs off on completed review
6. Results retained for 3 years

### Automated Checks (continuous):
- Alert on accounts with no login in 60+ days
- Alert on permission assignments outside role template
- Alert on users with CUI access but expired training
- Weekly report of all access changes

## 8. Remote Access Policy

### 8.1 Approved Remote Access Methods

| Method | Use Case | Requirements |
|--------|----------|-------------|
| **Tailscale VPN** | Primary remote access to KDT Vault | KDT-managed device + MFA + Tailscale ACLs |
| **Web interface (HTTPS)** | Emergency access from non-managed device | MFA + session restrictions + no download capability |

### 8.2 Remote Access Requirements

- **Device posture:** Only KDT-managed or approved devices may access CUI remotely
- **Network:** All traffic encrypted via Tailscale (WireGuard) or TLS 1.3
- **Authentication:** Full MFA required for every remote session
- **Session limits:** 4-hour absolute timeout for remote sessions (stricter than local)
- **Split tunneling:** Disabled — all traffic routes through Tailscale when connected
- **Geographic restrictions:** Access only from approved countries (US by default)
- **Logging:** All remote sessions logged with source IP, device ID, duration, actions

### 8.3 Prohibited Remote Access

- Public Wi-Fi without VPN: **Prohibited**
- Personal devices for CUI access: **Prohibited** (unless enrolled in KDT MDM)
- Screen sharing/remote desktop while CUI is displayed: **Prohibited** unless with authorized KDT personnel
- Accessing KDT Vault from foreign networks: **Prohibited** without CEO pre-approval

## 9. Emergency Access Procedures

### 9.1 Break-Glass Access

For situations requiring immediate access outside normal authorization:

1. **Trigger:** Critical business need AND normal approval chain unavailable
2. **Authority:** CEO or COO may authorize verbally
3. **Process:**
   - ISSO or System Admin enables temporary elevated access
   - Access scoped to minimum necessary
   - Maximum duration: 4 hours
   - All actions during break-glass logged with enhanced detail
   - Verbal authorization documented within 24 hours
4. **Post-incident:**
   - Full review of all actions taken during break-glass period
   - Formal written justification filed
   - Access reverted and confirmed

### 9.2 ISSO Incapacitation

If the ISSO is unavailable:
1. CEO assumes ISSO responsibilities temporarily
2. Backup ISSO (designated in advance) activated
3. All security decisions during this period documented for review

## 10. Privileged Access Management

### 10.1 Privileged Accounts

- System Administrator accounts are separate from daily-use accounts
- Admins use standard accounts for daily work, privileged accounts only for admin tasks
- Privileged sessions recorded (terminal recording or equivalent)
- Privileged account passwords: minimum 16 characters
- Privileged account MFA: hardware security key required (TOTP insufficient)

### 10.2 Least Privilege

- All accounts start with minimum necessary permissions
- Additional permissions require formal request and approval
- Permissions are additive, never inherited from other users
- Service accounts scoped to specific functions
- Root/sudo access to Mac Studio: System Administrator only, logged

## 11. References

- NIST SP 800-171 Rev 2 — Access Control (AC) family: 3.1.1–3.1.22
- NIST SP 800-171 Rev 2 — Identification and Authentication (IA) family: 3.5.1–3.5.11
- NIST SP 800-63B — Digital Identity Guidelines: Authentication and Lifecycle Management
- CMMC Level 2 — AC and IA domains

---

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO | Michael Schulz | _____________ | ______ |
| ISSO | *(appointed)* | _____________ | ______ |
