# Incident Response Plan

**Knight Division Tactical — KDT Vault**

| Field | Value |
|-------|-------|
| **Policy Owner** | CEO / ISSO |
| **Effective Date** | *(upon approval)* |
| **Review Cycle** | Annual + after every significant incident |
| **Classification** | CUI // SP-INFOSEC |
| **NIST 800-171 Family** | IR (Incident Response) |

---

## 1. Purpose

This plan establishes procedures for detecting, analyzing, containing, eradicating, recovering from, and learning from security incidents affecting KDT Vault and KDT information systems. It ensures compliance with DFARS 252.204-7012 requirements for reporting cyber incidents involving CUI.

## 2. Scope

All security events and incidents affecting:
- KDT Vault application and infrastructure
- CUI stored, processed, or transmitted by KDT
- KDT network infrastructure
- KDT endpoints that access KDT Vault
- Third-party services integrated with KDT systems

## 3. Definitions

| Term | Definition |
|------|-----------|
| **Security Event** | Any observable occurrence relevant to information security (e.g., failed login, port scan) |
| **Security Incident** | A security event that violates security policy, results in unauthorized access, or compromises information integrity/availability |
| **CUI Incident** | Any incident involving actual or suspected compromise of Controlled Unclassified Information |
| **Breach** | Confirmed unauthorized access to or disclosure of protected information |
| **Spillage** | CUI or classified information placed on an unauthorized system |

## 4. Incident Categories and Severity

### 4.1 Categories

| Category | Code | Description | Examples |
|----------|------|-------------|---------|
| Unauthorized Access | UA | Unauthorized system/data access | Compromised credentials, privilege escalation |
| Malicious Code | MC | Malware, ransomware, trojans | Virus detection, ransomware encryption |
| Denial of Service | DOS | Disruption of system availability | DDoS attack, resource exhaustion |
| Data Exfiltration | DE | Unauthorized data removal | Bulk downloads, data copied to external media |
| Data Spillage | DS | Information on unauthorized system | CUI on personal device, classified on CUI system |
| Insider Threat | IT | Malicious or negligent insider activity | Intentional data theft, policy violations |
| Social Engineering | SE | Phishing, pretexting, manipulation | Phishing email, credential harvesting |
| Physical Security | PS | Physical breach of secure areas | Unauthorized server room access |
| Configuration Error | CE | Security misconfiguration | Exposed database, disabled encryption |

### 4.2 Severity Levels

| Level | Name | Description | Response Time | Examples |
|-------|------|-------------|---------------|---------|
| **SEV-1** | Critical | Active compromise of CUI; active attacker in system; ransomware | Immediate (< 15 min) | Active breach, CUI exfiltration, ransomware |
| **SEV-2** | High | Likely compromise; vulnerability being exploited; spillage | < 1 hour | Compromised admin account, CUI spillage, malware detected |
| **SEV-3** | Medium | Potential compromise; suspicious activity; policy violation | < 4 hours | Repeated failed logins, unauthorized config change, suspicious file access |
| **SEV-4** | Low | Minor policy violation; informational security event | < 24 hours | Single failed login from unknown IP, expired certificate, minor misconfig |

## 5. Incident Response Team

### 5.1 Core Team

| Role | Primary | Backup | Responsibilities |
|------|---------|--------|-----------------|
| **Incident Commander (IC)** | ISSO | CEO | Overall incident management, decision authority |
| **Technical Lead** | System Administrator | Software Architect | Technical analysis, containment, eradication |
| **Communications Lead** | COO | CEO | Internal/external communications, DoD notification |
| **Evidence Custodian** | ISSO | Technical Lead | Evidence collection, chain of custody |
| **Legal Advisor** | External Counsel | — | Legal guidance, regulatory compliance |

### 5.2 Contact Information

> **⚠️ Fill in actual contact details and keep this section updated.**

| Role | Name | Phone | Email | Alternate Contact |
|------|------|-------|-------|-------------------|
| CEO / System Owner | Michael Schulz | __________ | __________ | __________ |
| COO | Matthew McCalla | __________ | __________ | __________ |
| ISSO | *(appointed)* | __________ | __________ | __________ |
| System Administrator | __________ | __________ | __________ | __________ |
| Legal Counsel | __________ | __________ | __________ | __________ |
| Cyber Insurance Provider | __________ | __________ | Policy #: __________ | __________ |

### 5.3 External Contacts

| Organization | Purpose | Contact |
|-------------|---------|---------|
| **DIBNet / DC3** | CUI incident reporting (DFARS 252.204-7012) | https://dibnet.dod.mil |
| **CISA** | Federal cyber incident reporting | https://www.cisa.gov/report |
| **FBI IC3** | Cybercrime reporting | https://www.ic3.gov |
| **DCSA** | Facility security / classified spillage | Local DCSA field office |
| **Contracting Officer** | Contract-specific incident notification | *(per contract)* |

## 6. Incident Response Phases

### Phase 1: Detection and Identification

**Sources of Detection:**
- Automated alerts from KDT Vault audit system (see Audit Logging Policy)
- User reports (suspicious email, unusual system behavior)
- External notification (DoD, contractor partner, security researcher)
- Routine log review by ISSO
- Vulnerability scan results
- Antimalware alerts

**Initial Assessment Checklist:**
1. [ ] What type of incident is this? (Category from Section 4.1)
2. [ ] What systems are affected?
3. [ ] Is CUI involved?
4. [ ] Is the incident ongoing or contained?
5. [ ] What is the severity level? (Section 4.2)
6. [ ] Who discovered it and when?
7. [ ] What is the potential business impact?
8. [ ] Has any data left KDT's control?

**Documentation from first moment:**
- Timestamp of discovery
- Who discovered and how
- Initial observations (screenshots, log excerpts)
- Systems and data potentially affected
- Initial severity assessment

### Phase 2: Containment

**Short-Term Containment (stop the bleeding):**

| Scenario | Action |
|----------|--------|
| Compromised user account | Disable account, kill all sessions, revoke MFA |
| Compromised admin account | Disable account, rotate all admin credentials, audit recent admin actions |
| Malware on endpoint | Isolate endpoint from network, do NOT power off (preserve memory) |
| Active data exfiltration | Block source IP at firewall, disable affected account, isolate system |
| Ransomware | Isolate affected system, do NOT pay ransom, assess backup integrity |
| CUI spillage | See Data Classification Policy — Spillage Response |
| Unauthorized physical access | Secure the area, review camera footage, assess what was accessed |

**Long-Term Containment:**
- Implement temporary additional monitoring on affected systems
- Apply emergency patches if vulnerability was exploited
- Restrict network access to affected segments
- Enable enhanced logging on related systems
- Stand up clean systems if needed for business continuity

### Phase 3: Eradication

1. **Identify root cause** — How did the attacker/incident get in?
2. **Remove attacker artifacts:**
   - Malware removal (clean rebuild preferred over cleaning)
   - Backdoor accounts removed
   - Unauthorized configuration changes reverted
   - Compromised credentials rotated across all systems
3. **Patch vulnerabilities** that enabled the incident
4. **Verify eradication** — scan all systems for remaining indicators of compromise (IOCs)
5. **Update detection rules** — add new IOCs to monitoring

### Phase 4: Recovery

1. **Restore from known-good backups** if system integrity is questionable
2. **Rebuild compromised systems** from scratch when possible (preferred over repair)
3. **Validate system integrity** before reconnecting to network:
   - OS integrity verification
   - Application hash verification
   - Database integrity check
   - Encryption verification
4. **Gradual restoration:**
   - Restore in stages, monitoring closely at each stage
   - Start with non-CUI systems, then CUI systems
   - Enable enhanced monitoring during recovery period
5. **User communication:**
   - Notify affected users of required actions (password reset, MFA re-enrollment)
   - Provide guidance on verifying their data

### Phase 5: Post-Incident Review

**Timeline:** Within 5 business days of incident closure.

**Participants:** Full Incident Response Team + any personnel involved.

**Review Agenda:**
1. Incident timeline reconstruction
2. What worked well in the response?
3. What didn't work or could be improved?
4. Were detection mechanisms adequate?
5. Was the response timely?
6. Were communications effective?
7. What preventive measures would have stopped this?
8. Are policy/procedure updates needed?

**Deliverables:**
- Post-Incident Report (see template in Section 10)
- Updated IOCs for monitoring
- Action items with owners and deadlines
- Policy/procedure updates (if needed)
- Lessons learned document

## 7. DoD Reporting Requirements (DFARS 252.204-7012)

### 7.1 When to Report

Report to DIBNet/DC3 when a **cyber incident** affects:
- Covered defense information (CDI/CUI) on KDT systems
- KDT's ability to perform operationally critical support
- Any incident that may affect DoD information or systems

### 7.2 Reporting Timeline

| Action | Deadline |
|--------|----------|
| Discovery of incident | T=0 |
| Initial assessment complete | T+4 hours |
| **Report to DC3 via DIBNet** | **T+72 hours (mandatory)** |
| Provide malicious software (if found) to DC3 | With initial report or ASAP |
| Preserve forensic images | Minimum 90 days |
| Submit updated reports | As new information emerges |

### 7.3 DIBNet Reporting Content

The report must include (to the extent known):
1. Company name and point of contact
2. Contract numbers affected
3. Facility CAGE code
4. Date incident discovered
5. Location(s) of compromise
6. Type(s) of compromise
7. Description of technique/method used
8. Incident outcome (data compromised, etc.)
9. NIST 800-171 controls that failed or were exploited
10. Actions taken in response
11. Malicious software samples (submitted via DC3 portal)

### 7.4 Reporting Process

```
1. IC determines DoD reporting is required
     ↓
2. Communications Lead drafts DIBNet report
     ↓
3. Legal Advisor reviews for privilege and accuracy
     ↓
4. CEO approves submission
     ↓
5. Communications Lead submits via https://dibnet.dod.mil
     ↓
6. Confirmation receipt saved as evidence
     ↓
7. Follow-up reports as investigation progresses
```

### 7.5 Contracting Officer Notification

- Notify contracting officer(s) for affected contracts within 72 hours
- Provide contract number, incident summary, and potential impact
- Coordinate any required response actions

## 8. Evidence Preservation

### 8.1 Chain of Custody

All evidence must maintain an unbroken chain of custody:

| Field | Required |
|-------|----------|
| Evidence ID | Unique identifier |
| Description | What it is |
| Source | Where/how obtained |
| Date/time collected | Timestamp |
| Collected by | Name and role |
| Hash (digital) | SHA-256 of original |
| Storage location | Where it's secured |
| Access log | Who accessed and when |

### 8.2 Evidence Types

| Evidence Type | Collection Method | Retention |
|---------------|-------------------|-----------|
| Memory dumps | Live capture before shutdown | 90 days minimum |
| Disk images | Forensic imaging (bit-for-bit) | 90 days minimum (DFARS) |
| Network captures | pcap from affected period | 90 days minimum |
| Log files | Export from all relevant systems | Per retention policy (3-6 years) |
| Malware samples | Isolated copy in quarantine | 90 days minimum + submit to DC3 |
| Screenshots | Timestamped screen captures | Duration of investigation |
| Interview notes | Written notes from personnel interviews | Duration of investigation |

### 8.3 Preservation Rules

- **Do NOT modify original evidence** — work from copies
- **Power state matters:** If a system is ON, capture memory BEFORE powering off; if OFF, do NOT power on
- **Image before analysis:** Create forensic disk image before any analysis
- **Hash everything:** SHA-256 hash at time of collection, verify before use
- **Secure storage:** Evidence stored on encrypted, access-controlled media separate from production systems
- **90-day minimum** per DFARS 252.204-7012 for cyber incident evidence

## 9. Communication Templates

### 9.1 Internal Notification (to KDT Staff)

```
Subject: [SEVERITY] Security Incident — Action Required

KDT Team,

We are responding to a security incident affecting [brief description].

What happened: [1-2 sentence summary — only confirmed facts]

What you need to do:
- [Specific action items, e.g., "Reset your password immediately"]
- [Additional instructions]

What we're doing:
- Our incident response team is actively working on this
- [High-level response actions]

If you notice anything unusual, contact [ISSO name] immediately at [phone].

Do NOT discuss this incident outside KDT or on unapproved channels.

— [Incident Commander name]
```

### 9.2 External Notification (to Contracting Officer)

```
Subject: DFARS 252.204-7012 Cyber Incident Notification — [Contract Number]

[Contracting Officer Name],

Knight Division Tactical is reporting a cyber incident per DFARS 252.204-7012.

Date of discovery: [date]
Contract(s) affected: [contract numbers]
CAGE Code: [KDT CAGE code]
Incident summary: [description without disclosing security vulnerabilities]
Potential impact to CDI: [assessment]
Actions taken: [high-level response summary]
DIBNet report submitted: [yes/no, report number if yes]

Point of contact:
[Name, Title, Phone, Email]

We will provide updates as our investigation progresses.

Respectfully,
[Name, Title]
Knight Division Tactical
```

### 9.3 User Notification (if personal data affected)

```
Subject: Important Notice — Security Incident Affecting Your Information

Dear [Name],

We are writing to inform you that a security incident at Knight Division Tactical 
may have affected some of your personal information.

What happened: [factual description]
What information was involved: [specific data types]
What we have done: [response actions]
What you can do: [recommended protective steps]

We take the security of your information seriously and are committed to 
preventing future incidents.

For questions, contact: [name, phone, email]

Sincerely,
[CEO name]
Knight Division Tactical
```

## 10. Post-Incident Report Template

```markdown
# Post-Incident Report

## Incident Summary
- **Incident ID:** INC-[YYYY]-[NNN]
- **Severity:** SEV-[1-4]
- **Category:** [from Section 4.1]
- **Status:** Closed
- **CUI Involved:** Yes/No
- **DoD Reported:** Yes/No (DIBNet report #)

## Timeline
| Time (UTC) | Event |
|------------|-------|
| YYYY-MM-DD HH:MM | Incident began (estimated) |
| YYYY-MM-DD HH:MM | Incident detected |
| YYYY-MM-DD HH:MM | IC activated, team assembled |
| YYYY-MM-DD HH:MM | Containment achieved |
| YYYY-MM-DD HH:MM | Eradication complete |
| YYYY-MM-DD HH:MM | Recovery complete |
| YYYY-MM-DD HH:MM | Incident closed |

## Root Cause
[Detailed root cause analysis]

## Impact Assessment
- Systems affected: [list]
- Data affected: [types, volume, classification]
- Users affected: [count, roles]
- Business impact: [description]
- Regulatory impact: [reporting obligations triggered]

## Response Actions
[Chronological list of actions taken]

## Lessons Learned
1. [What worked]
2. [What didn't]
3. [Surprises]

## Remediation Actions
| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| [action] | [name] | [date] | [status] |

## Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Incident Commander | | | |
| CEO | | | |
```

## 11. Training and Exercises

| Activity | Frequency | Participants |
|----------|-----------|-------------|
| IR plan review | Annual | All IR team members |
| Tabletop exercise | Semi-annual | IR team + management |
| Technical exercise (simulated incident) | Annual | IR team + IT staff |
| Phishing simulation | Quarterly | All employees |
| Plan update | Annual + after each SEV-1/SEV-2 incident | ISSO + IC |

## 12. References

- NIST SP 800-171 Rev 2 — Incident Response (IR): 3.6.1–3.6.3
- NIST SP 800-61 Rev 2 — Computer Security Incident Handling Guide
- DFARS 252.204-7012 — Safeguarding Covered Defense Information
- CMMC Level 2 — IR domain practices

---

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO | Michael Schulz | _____________ | ______ |
| ISSO | *(appointed)* | _____________ | ______ |
