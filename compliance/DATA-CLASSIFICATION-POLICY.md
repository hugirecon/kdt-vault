# Data Classification Policy

**Knight Division Tactical — KDT Vault**

| Field | Value |
|-------|-------|
| **Policy Owner** | CEO / ISSO |
| **Effective Date** | *(upon approval)* |
| **Review Cycle** | Annual |
| **Applicability** | All KDT employees, contractors, and systems processing KDT data |
| **Classification** | CUI // SP-INFOSEC |

---

## 1. Purpose

This policy establishes the framework for classifying, marking, handling, storing, transmitting, and destroying information within KDT Vault and all KDT systems. Proper classification ensures information receives the level of protection commensurate with its sensitivity and in accordance with federal requirements.

## 2. Scope

This policy applies to all data created, received, stored, processed, or transmitted by KDT personnel and systems, regardless of format (digital, printed, verbal).

## 3. Classification Levels

### 3.1 UNCLASSIFIED

**Definition:** Information that is not sensitive, not subject to access controls beyond basic authentication, and whose disclosure would not harm KDT or its government customers.

**Examples:**
- Public-facing marketing materials
- Published press releases
- General company policies (non-security)
- Open-source project files

**Handling Rules:**
- Standard access controls (authenticated users)
- No special marking required
- May be stored on any KDT-approved system
- May be shared externally without approval
- Standard backup procedures apply
- Destroyed via normal deletion (no special sanitization)

**Sharing Rules:**
- May be shared with any authenticated KDT user
- May be shared externally via approved channels
- No approval workflow required

### 3.2 CUI — Controlled Unclassified Information

**Definition:** Information the Government creates or possesses, or that an entity creates or possesses for or on behalf of the Government, that a law, regulation, or Government-wide policy requires or permits an agency to handle using safeguarding or dissemination controls. For KDT, this primarily covers information received from or created for DoD contracts.

**CUI Categories Relevant to KDT:**
- **CTI** — Controlled Technical Information
- **EXPT** — Export Controlled
- **PRVCY** — Privacy
- **PROPIN** — Proprietary Business Information
- **SP-INFOSEC** — Information Security

**Marking Requirements:**
- **Banner marking:** `CUI` or `CONTROLLED` at top and bottom of every page/screen
- **Category marking:** `CUI // [Category]` (e.g., `CUI // CTI`)
- **Portion marking:** Recommended — mark individual paragraphs/sections containing CUI with `(CUI)` prefix
- **Digital files:** CUI marking in filename prefix: `CUI_filename.ext`
- **Email subject lines:** Prefix with `CUI —`
- **KDT Vault:** System automatically applies CUI banner to classified documents and enforces marking in metadata

**Handling Rules:**
- Access limited to authorized personnel with legitimate need-to-know
- Must be processed only on systems meeting NIST 800-171 requirements (KDT Vault)
- Physical CUI must be stored in locked containers when not in active use
- Clean desk policy — no CUI left visible on screens or desks unattended
- CUI documents must not be discussed in public spaces
- Screen locks required after 15 minutes of inactivity (enforced by system)

**Storage:**
- Must be stored on KDT Vault (encrypted at rest with AES-256)
- Must NOT be stored on personal devices, cloud services (Google Drive, Dropbox, etc.), or unapproved USB drives
- Physical copies stored in GSA-approved containers in controlled areas

**Transmission:**
- Must be encrypted in transit (TLS 1.3 minimum)
- Email: Only via encrypted channels; never unencrypted email
- Physical mail: Double-wrapped, inner envelope marked CUI, outer envelope unmarked
- Fax: Verify recipient is present at receiving machine before transmission
- KDT Vault: All transmission encrypted via Tailscale + TLS

**Destruction:**
- Digital: NIST SP 800-88 compliant — Purge or Destroy method
- Paper: Cross-cut shredding (DIN 66399 Level P-4 or higher)
- Media: Degaussing + physical destruction for magnetic media; crypto-erase + destruction for SSDs
- Destruction must be logged in KDT Vault audit trail

### 3.3 CONFIDENTIAL (Company Confidential)

**Definition:** KDT proprietary information whose unauthorized disclosure could cause identifiable harm to KDT's business interests, competitive position, or employee privacy.

> **Note:** This is a KDT-internal classification, NOT the U.S. Government CONFIDENTIAL classification level. KDT Vault is NOT authorized to process classified national security information.

**Examples:**
- Financial records and projections
- Employee personal information (PII)
- Client lists and contract details
- Internal strategy documents
- Security configurations and architecture details
- Proprietary business processes

**Handling Rules:**
- Access on need-to-know basis, controlled by role-based permissions
- Must not be shared externally without CEO or COO approval
- Stored only on KDT-approved systems with encryption
- Physical copies in locked storage
- Destruction per CUI destruction standards

### 3.4 Government Classified Information (SECRET and Above)

**⚠️ KDT Vault is NOT authorized to store, process, or transmit classified national security information (CONFIDENTIAL, SECRET, TOP SECRET, or any SAP/SCI material).**

**If KDT acquires contracts requiring access to classified information:**
1. A separate classified information facility (SCIF) and systems must be established
2. KDT must obtain a Facility Security Clearance (FCL) from DCSA
3. Personnel must obtain appropriate security clearances
4. Classified systems must be physically and logically separated from KDT Vault
5. All requirements of the NISPOM (32 CFR Part 117) must be met

**This is documented here for completeness and to prevent spillage — see Section 6.**

## 4. Classification Procedures

### 4.1 Who Can Classify

| Action | Authority |
|--------|-----------|
| Mark information as CUI | Any user, following CUI Registry categories |
| Apply CONFIDENTIAL (company) | Department leads and above |
| Override/correct classification | ISSO or CEO |
| Declassify / downgrade | ISSO or CEO |

### 4.2 How to Classify in KDT Vault

1. **Upload/Create:** When uploading or creating a document, select classification level from dropdown
2. **Metadata:** System enforces required metadata fields based on classification:
   - CUI: Category, dissemination controls, originating organization, POC
   - CONFIDENTIAL: Business justification, access group
3. **Auto-detection:** KDT Vault scans uploaded content for indicators of CUI (contract numbers, DFARS references, technical data markings) and flags for review
4. **Confirmation:** User confirms or adjusts classification before document is finalized
5. **Audit trail:** Classification assignment and any changes are logged immutably

### 4.3 When in Doubt

**When the classification level is unclear, classify at the higher level.** It is always safer to over-classify than under-classify. Flag the document for ISSO review.

## 5. Reclassification Procedures

### 5.1 Upgrading Classification

1. User or ISSO identifies need for higher classification
2. ISSO reviews content and approves upgrade
3. KDT Vault updates classification metadata
4. All existing access permissions are re-evaluated against new level
5. Users who no longer meet access requirements are automatically revoked
6. Notification sent to document owner and affected users
7. Reclassification event logged in audit trail

### 5.2 Downgrading Classification

1. Document owner or ISSO requests downgrade with justification
2. ISSO reviews content to confirm no CUI/sensitive material remains
3. If CUI originated from government source, verify with contracting officer that downgrade is permitted
4. CEO or ISSO approves downgrade
5. KDT Vault updates metadata and markings
6. Reclassification event logged in audit trail

### 5.3 Declassification

1. CUI may only be declassified when:
   - The authorizing law, regulation, or policy no longer requires protection
   - The originating agency provides written declassification authorization
   - The information is publicly released by the originating agency
2. ISSO documents the basis for declassification
3. Original CUI markings replaced with `CUI // DECLASSIFIED — [date] — [authority]`

## 6. Spillage / Spill Response

**Spillage** occurs when information is placed on a system not authorized to process information at that classification level.

### 6.1 CUI Spillage (CUI on unapproved system)

**Immediate Actions (within 1 hour of discovery):**
1. **Stop.** Do not forward, copy, or further distribute the information
2. **Notify ISSO** immediately (phone or in-person; do not email the CUI again)
3. **Isolate** the affected system — disconnect from network if possible
4. **Document** what was spilled, where, when discovered, who has seen it

**Containment (within 24 hours):**
1. ISSO identifies all systems and personnel who received the spilled information
2. All copies on unapproved systems are securely deleted using NIST 800-88 methods
3. Email servers: Work with email provider to purge from all mailboxes, sent folders, trash, and backup
4. Cloud services: Verify deletion from all replicas, caches, and CDN nodes
5. Personnel who accessed the spill are notified and instructed to delete any personal copies

**Recovery:**
1. Original information re-secured on KDT Vault with proper classification
2. Affected unapproved systems verified clean
3. Incident documented in Incident Response system
4. Root cause analysis performed
5. Corrective actions implemented (training, system controls, etc.)

### 6.2 Classified Spillage (SECRET/TS on KDT systems)

**This is a serious security incident.**

**Immediate Actions:**
1. **STOP ALL ACTIVITY** on the affected system
2. **Do NOT attempt to delete** the classified information yourself
3. **Power off the system** (do not shut down gracefully — pull power if needed to prevent further spread)
4. **Physically secure** the system — lock the room, restrict access
5. **Notify ISSO and CEO** immediately by phone
6. **Notify the contracting officer** and relevant government security authority
7. **Do not discuss** the incident over unclassified channels

**Government Response:**
- DCSA (Defense Counterintelligence and Security Agency) will be contacted
- Government security officials will direct sanitization or destruction of affected media
- KDT follows government instructions exactly — this is not KDT's call
- Affected personnel may require debriefing

**Documentation:**
- Maintain chain of custody for all affected hardware
- Document timeline, actions taken, personnel involved
- Preserve all evidence as directed by government security officials

## 7. Training Requirements

| Audience | Training | Frequency |
|----------|----------|-----------|
| All employees | Data classification awareness | Upon hire + annual |
| CUI handlers | CUI handling procedures (NARA CUI training) | Upon hire + annual |
| ISSO | Advanced classification and spillage response | Upon appointment + annual |
| IT administrators | Technical controls for classification enforcement | Upon hire + annual |

## 8. Compliance Monitoring

- **Quarterly access reviews** — verify users only access data at or below their authorized level
- **Automated scanning** — KDT Vault monitors for misclassified documents
- **Spot checks** — ISSO performs random audits of classification accuracy
- **Spillage drills** — Annual tabletop exercise simulating spill scenarios

## 9. Violations

Mishandling of classified or controlled information is a serious matter.

| Violation | Consequence |
|-----------|-------------|
| Accidental misclassification (first occurrence) | Retraining |
| Repeated misclassification | Formal counseling + access review |
| Intentional mishandling of CUI | Termination + potential legal action |
| Classified spillage (negligent) | Suspension + investigation + government notification |
| Classified spillage (intentional) | Termination + criminal referral |

## 10. References

- [NARA CUI Registry](https://www.archives.gov/cui)
- [32 CFR Part 2002](https://www.ecfr.gov/current/title-32/subtitle-B/chapter-XX/part-2002) — CUI regulation
- NIST SP 800-171 Rev 2 — Protecting CUI in Nonfederal Systems
- NIST SP 800-88 Rev 1 — Guidelines for Media Sanitization
- DFARS 252.204-7012 — Safeguarding Covered Defense Information

---

*This policy is effective upon signature by the CEO and ISSO. Annual review required.*

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO | Michael Schulz | _____________ | ______ |
| ISSO | *(appointed)* | _____________ | ______ |
