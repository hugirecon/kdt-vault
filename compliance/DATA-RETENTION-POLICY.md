# Data Retention Policy

**Knight Division Tactical — KDT Vault**

| Field | Value |
|-------|-------|
| **Policy Owner** | CEO / ISSO |
| **Effective Date** | *(upon approval)* |
| **Review Cycle** | Annual |
| **Classification** | CUI // SP-INFOSEC |
| **NIST 800-171 Family** | MP (Media Protection), AU (Audit and Accountability) |

---

## 1. Purpose

This policy defines how long KDT retains different types of data, how legal holds work, and how data is securely destroyed when retention periods expire. Proper retention ensures regulatory compliance while minimizing risk from holding data longer than necessary.

## 2. Scope

All data stored on KDT systems, including KDT Vault documents, audit logs, backups, email, and communications.

## 3. Retention Periods

### 3.1 By Document Type

| Document Type | Classification | Retention Period | Authority |
|---------------|---------------|-----------------|-----------|
| **DoD Contract Deliverables** | CUI | 6 years after contract completion | FAR 4.703 |
| **Contract Administration Files** | CUI | 6 years after contract completion | FAR 4.703 |
| **Technical Data / CTI** | CUI | 6 years after contract completion or per contract terms | DFARS |
| **Proposals (awarded)** | CONFIDENTIAL | 6 years after contract completion | FAR 4.703 |
| **Proposals (not awarded)** | CONFIDENTIAL | 3 years after submission | KDT policy |
| **Financial Records** | CONFIDENTIAL | 7 years | IRS requirements |
| **Tax Records** | CONFIDENTIAL | 7 years | IRS requirements |
| **Employee Records (active)** | CONFIDENTIAL | Duration of employment + 7 years | Federal/state labor law |
| **Employee Records (terminated)** | CONFIDENTIAL | 7 years after termination | Federal/state labor law |
| **Audit Logs (security)** | CUI | 3–6 years (see Audit Logging Policy) | NIST 800-171 |
| **Audit Logs (system)** | UNCLASSIFIED | 1 year | KDT policy |
| **Incident Response Records** | CUI | 6 years | KDT policy |
| **Legal Documents / Contracts** | CONFIDENTIAL | Permanent or 10 years after expiration | Legal best practice |
| **Corporate Governance** | CONFIDENTIAL | Permanent | KDT policy |
| **General Business Correspondence** | UNCLASSIFIED | 3 years | KDT policy |
| **Marketing Materials** | UNCLASSIFIED | 1 year after superseded | KDT policy |
| **Training Records** | UNCLASSIFIED | 3 years or duration of employment | CMMC requirement |
| **Security Assessment Reports** | CUI | 6 years | CMMC requirement |
| **POA&M Records** | CUI | 6 years | CMMC requirement |
| **Backup Media** | Per source classification | 90 days (rolling) | KDT policy |

### 3.2 By Classification Level

| Classification | Minimum Retention | Maximum Retention | Notes |
|---------------|-------------------|-------------------|-------|
| UNCLASSIFIED | Per type | No maximum | Destroy when no longer needed |
| CONFIDENTIAL | Per type | Per type + 1 year | Allow for legal discovery |
| CUI | Per contract/regulation | Per authority + 1 year | Do not destroy before contract obligation met |

## 4. Retention Enforcement in KDT Vault

### 4.1 Automated Retention

- Each document/folder can have a retention policy assigned
- KDT Vault tracks creation date, last modified date, and retention expiry
- 30 days before retention expiry: document owner notified
- At expiry: document flagged for review (not auto-deleted)
- After owner review + ISSO approval: document queued for secure destruction
- If no response within 30 days of expiry: ISSO reviews and decides

### 4.2 Retention Override

- Legal holds override all retention policies (see Section 5)
- ISSO may extend retention for compliance or investigation purposes
- CEO may extend retention for business reasons
- All overrides documented with justification

## 5. Legal Hold Procedures

### 5.1 What Is a Legal Hold

A legal hold (litigation hold) suspends all destruction of potentially relevant documents when litigation, audit, or government investigation is reasonably anticipated or pending.

### 5.2 Initiating a Legal Hold

1. **Trigger:** CEO, COO, or Legal Counsel determines legal hold is necessary
2. **Scope definition:** Legal Counsel defines what documents/systems are covered:
   - Date range
   - Document types
   - Custodians (people whose documents are held)
   - Systems/repositories
   - Keywords or classification levels
3. **Hold notice:** Written notice issued to all custodians:
   - What must be preserved
   - What they must NOT destroy, alter, or delete
   - How long the hold is expected to last
   - Who to contact with questions
4. **System implementation:**
   - ISSO applies legal hold flag in KDT Vault
   - Held documents cannot be deleted, even by admins
   - Retention policy automation suspended for held documents
   - Backup destruction suspended for held data
5. **Acknowledgment:** Each custodian must acknowledge receipt of hold notice (recorded)

### 5.3 Managing a Legal Hold

- **Quarterly review:** Legal Counsel reviews whether hold is still necessary
- **New custodians:** If new relevant custodians identified, they receive hold notice
- **Reminder notices:** Quarterly reminders to all custodians that hold is active
- **Compliance monitoring:** ISSO verifies no held documents were destroyed

### 5.4 Releasing a Legal Hold

1. Legal Counsel determines hold is no longer necessary
2. Written release notice issued to all custodians
3. ISSO removes legal hold flags in KDT Vault
4. Normal retention policies resume
5. Release documented and filed

## 6. Secure Destruction Methods

### 6.1 Digital Media Destruction

| Media Type | Clear (reuse) | Purge (reuse) | Destroy (no reuse) |
|------------|:---:|:---:|:---:|
| **SSD (APFS/encrypted)** | Crypto-erase (FileVault destroy key) | Crypto-erase + full overwrite | Physical destruction (shred/incinerate) |
| **HDD (magnetic)** | 3-pass overwrite (DoD 5220.22-M) | 7-pass overwrite or degaussing | Physical destruction (shred/degauss+shred) |
| **USB Flash Drive** | Crypto-erase if encrypted | Full overwrite | Physical destruction |
| **Optical Media (CD/DVD)** | N/A | N/A | Cross-cut shredding |
| **Backup Tapes** | N/A | Degaussing | Degaussing + physical destruction |
| **Cloud/Virtual Storage** | Crypto-erase + API deletion | Verify provider certifies deletion | Verify provider destruction certification |

**NIST SP 800-88 Guidance:**
- **Clear:** Logical techniques to sanitize data; protects against simple recovery
- **Purge:** Physical or logical techniques that make recovery infeasible with state-of-the-art lab techniques
- **Destroy:** Physical destruction rendering media unusable

**For CUI: Minimum of Purge; Destroy recommended when media leaves KDT control.**

### 6.2 Paper/Physical Media Destruction

| Media Type | Method | Standard |
|------------|--------|----------|
| Paper (CUI) | Cross-cut shredding | DIN 66399 Level P-4 minimum (4mm × 40mm) |
| Paper (CONFIDENTIAL) | Cross-cut shredding | DIN 66399 Level P-3 minimum |
| Paper (UNCLASSIFIED) | Standard recycling | N/A |
| Film/microfiche | Incineration or chemical destruction | NSA/CSS EPL |

### 6.3 Destruction Logging

Every destruction event must be logged:

```json
{
  "destruction_id": "DST-2026-001",
  "date": "2026-04-06",
  "media_type": "SSD",
  "media_identifier": "Serial # XYZ123",
  "method": "crypto-erase + physical destruction",
  "standard": "NIST 800-88 Destroy",
  "classification_highest": "CUI",
  "description": "256GB SSD from retired Mac Mini",
  "performed_by": "System Administrator name",
  "witnessed_by": "ISSO name",
  "certificate_of_destruction": "COD-2026-001"
}
```

### 6.4 Certificate of Destruction

For CUI media destruction, a Certificate of Destruction must be created:
- Media description and identifiers
- Classification level
- Destruction method and standard
- Date and time of destruction
- Performed by (name, title, signature)
- Witnessed by (name, title, signature)
- Retained for 6 years

## 7. Backup Retention

| Backup Type | Frequency | Retention | Storage |
|-------------|-----------|-----------|---------|
| Full system backup | Weekly | 90 days rolling | Encrypted off-site |
| Incremental backup | Daily | 30 days rolling | Encrypted local + off-site |
| Database backup | Daily | 90 days rolling | Encrypted off-site |
| Audit log backup | Daily | Per audit log retention policy (3-6 years) | Separate encrypted storage |
| Configuration backup | On change | 1 year | Encrypted version control |

**Backup destruction:**
- Expired backups securely destroyed per Section 6
- Backup media containing CUI destroyed to Purge or Destroy standard
- Legal holds apply to backups containing held data

## 8. Email and Communication Retention

| Type | Retention | Notes |
|------|-----------|-------|
| Business email (general) | 3 years | Automatically archived |
| Email containing CUI | 6 years (per contract) | Must be on approved system |
| Internal chat/messaging | 1 year | Business-related only |
| Video/audio recordings | 1 year unless CUI-related | CUI recordings: per contract |
| Voicemail | 90 days | Business-related |

## 9. Roles and Responsibilities

| Role | Responsibility |
|------|---------------|
| **Document Owner** | Assign retention policy when creating/uploading; review at expiry |
| **ISSO** | Enforce retention policies; approve destruction; manage legal holds technically |
| **CEO** | Approve retention policy; authorize legal holds |
| **Legal Counsel** | Initiate and release legal holds; advise on retention requirements |
| **System Administrator** | Execute backups and destruction; maintain destruction logs |
| **All Users** | Comply with retention policies; do not destroy documents outside policy |

## 10. Compliance Monitoring

- **Monthly:** Automated report of documents approaching retention expiry
- **Quarterly:** ISSO reviews destruction logs for completeness
- **Annually:** Full retention policy review against current contracts and regulations
- **On contract award:** Review retention requirements for new contract
- **On contract closeout:** Initiate retention countdown for contract documents

## 11. Violations

| Violation | Consequence |
|-----------|-------------|
| Premature destruction of documents | Investigation; potential regulatory penalties |
| Destruction of documents under legal hold | Severe — potential sanctions, adverse inference, criminal contempt |
| Failure to apply retention policy | Retraining; repeat = formal counseling |
| Unauthorized retention extension | ISSO review; potential data minimization issue |

## 12. References

- NIST SP 800-88 Rev 1 — Guidelines for Media Sanitization
- NIST SP 800-171 Rev 2 — Media Protection (MP): 3.8.1–3.8.9
- FAR 4.703 — Policy on Contractor Records Retention
- DFARS 252.204-7012 — 90-day evidence preservation
- IRS Publication 583 — Record retention for tax purposes

---

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO | Michael Schulz | _____________ | ______ |
| ISSO | *(appointed)* | _____________ | ______ |
