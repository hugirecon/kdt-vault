# Plan of Action and Milestones (POA&M)

**Knight Division Tactical — KDT Vault**

| Field | Value |
|-------|-------|
| **System Name** | KDT Vault |
| **System Owner** | Michael Schulz, CEO |
| **ISSO** | *(appointed)* |
| **Date Created** | 2026-04-06 |
| **Last Updated** | 2026-04-06 |
| **Classification** | CUI // SP-INFOSEC |

---

## Purpose

This POA&M tracks identified compliance gaps, security findings, and remediation plans for KDT Vault against NIST SP 800-171 Rev 2 / CMMC Level 2 requirements. It is a living document updated as findings are identified and remediated.

## Status Definitions

| Status | Meaning |
|--------|---------|
| **Open** | Finding identified, remediation not yet started |
| **In Progress** | Remediation work underway |
| **Delayed** | Past target date, remediation incomplete |
| **Completed** | Remediation implemented and verified |
| **Accepted Risk** | Risk accepted by System Owner with documented justification |

## Risk Level Definitions

| Level | Definition |
|-------|-----------|
| **Critical** | Immediate threat to CUI confidentiality/integrity; active exploitation possible |
| **High** | Significant gap that could lead to CUI compromise; must be addressed quickly |
| **Medium** | Moderate risk; compensating controls may partially mitigate |
| **Low** | Minor gap; limited risk to CUI |

---

## Findings

### Initial System Build Findings

| # | Control ID | Finding | Risk | Remediation Plan | Owner | Target Date | Status |
|---|-----------|---------|------|-------------------|-------|-------------|--------|
| 1 | 3.5.3 (IA) | MFA not yet implemented for all users | **Critical** | Implement TOTP/WebAuthn MFA for all accounts; enforce on login, CUI access, and admin actions | System Admin | YYYY-MM-DD | Open |
| 2 | 3.13.11 (SC) | FIPS 140-2 validation not confirmed for all crypto modules | **High** | Verify CMVP certificates for macOS corecrypto, OpenSSL, and Node.js crypto; enable FIPS mode; document in crypto inventory | ISSO | YYYY-MM-DD | Open |
| 3 | 3.12.1 (CA) | No formal security assessment performed | **High** | Conduct initial self-assessment using NIST 800-171A; schedule C3PAO assessment for CMMC | ISSO + CEO | YYYY-MM-DD | Open |
| 4 | 3.6.1 (IR) | Incident response plan not tested | **Medium** | Conduct tabletop exercise with IR team; document results; update plan based on findings | ISSO | YYYY-MM-DD | Open |
| 5 | 3.10.1 (PE) | Server room/closet not yet designated | **High** | Designate and build out equipment area per Physical Security Plan; install lock, sensors, UPS | COO | YYYY-MM-DD | Open |
| 6 | 3.2.1 (AT) | Security awareness training not yet conducted | **High** | Select and deploy CUI handling training for all employees; track completion; establish annual cycle | ISSO | YYYY-MM-DD | Open |
| 7 | 3.2.2 (AT) | Role-based security training not established | **Medium** | Develop role-specific training for admins, ISSO, users; deliver initial training | ISSO | YYYY-MM-DD | Open |
| 8 | 3.11.1 (RA) | Risk assessment not performed | **High** | Conduct formal risk assessment of KDT Vault; document threats, vulnerabilities, likelihood, impact; update annually | ISSO | YYYY-MM-DD | Open |
| 9 | 3.12.3 (CA) | Continuous monitoring strategy not defined | **Medium** | Define monitoring strategy including log review frequency, vulnerability scanning schedule, configuration monitoring | ISSO | YYYY-MM-DD | Open |
| 10 | 3.3.1 (AU) | Audit logging pipeline not fully operational | **High** | Complete audit logging implementation per Audit Logging Policy; verify all event types captured; hash chain integrity | System Admin | YYYY-MM-DD | Open |
| 11 | 3.8.9 (MP) | Media sanitization procedures not tested | **Low** | Test NIST 800-88 destruction procedures; verify cross-cut shredder meets DIN 66399 P-4; document results | System Admin | YYYY-MM-DD | Open |
| 12 | 3.1.1 (AC) | Quarterly access reviews not yet scheduled | **Medium** | Establish quarterly access review schedule; create review template; conduct first review | ISSO | YYYY-MM-DD | Open |
| 13 | 3.4.1 (CM) | Baseline configuration not documented | **Medium** | Document baseline configurations for Mac Studio (macOS settings, installed software, open ports, services); establish change control | System Admin | YYYY-MM-DD | Open |
| 14 | 3.4.2 (CM) | Configuration change control process not established | **Medium** | Define change control process: request → review → test → approve → implement → verify; create change log | ISSO + System Admin | YYYY-MM-DD | Open |
| 15 | 3.14.1 (SI) | Malware/antivirus solution not deployed | **High** | Evaluate and deploy malware scanning (ClamAV or commercial solution); configure real-time and scheduled scans; integrate alerts with audit system | System Admin | YYYY-MM-DD | Open |
| 16 | 3.14.3 (SI) | Vulnerability scanning not established | **Medium** | Deploy vulnerability scanner (OpenVAS or commercial); establish monthly scan schedule; integrate with POA&M | System Admin | YYYY-MM-DD | Open |
| 17 | 3.9.2 (PS) | Personnel screening procedures not documented | **Medium** | Document background check requirements for CUI access; verify current employees; establish process for new hires | CEO / HR | YYYY-MM-DD | Open |
| 18 | 3.1.12 (AC) | Remote access monitoring not implemented | **Medium** | Configure Tailscale ACLs; implement remote session logging; define geographic restrictions; test alerts | System Admin | YYYY-MM-DD | Open |
| 19 | 3.7.1 (MA) | Maintenance procedures not documented | **Low** | Document system maintenance procedures; establish maintenance schedule; define maintenance window procedures | System Admin | YYYY-MM-DD | Open |
| 20 | 3.13.1 (SC) | Network boundary protections not fully configured | **High** | Configure macOS firewall (pf); define Tailscale ACLs; implement network segmentation; document all rules | System Admin | YYYY-MM-DD | Open |

### Ongoing Findings

| # | Control ID | Finding | Risk | Remediation Plan | Owner | Target Date | Status |
|---|-----------|---------|------|-------------------|-------|-------------|--------|
| | | *(add findings as identified)* | | | | | |

---

## Remediation Priority

Based on risk levels:

1. **Immediate (30 days):** Critical findings (#1)
2. **Short-term (60 days):** High findings (#2, 3, 5, 6, 8, 10, 15, 20)
3. **Medium-term (90 days):** Medium findings (#4, 7, 9, 12, 13, 14, 16, 17, 18)
4. **Long-term (180 days):** Low findings (#11, 19)

## Review Schedule

| Review Type | Frequency | Reviewer |
|-------------|-----------|----------|
| POA&M status update | Monthly | ISSO |
| Management review | Quarterly | ISSO + CEO |
| Full reassessment | Annual | ISSO + CEO + assessor (if applicable) |
| Ad-hoc update | On new finding | ISSO |

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2026-04-06 | KDT | Initial POA&M with pre-deployment findings |

---

*This POA&M is a living document. Update it continuously as findings are remediated or new gaps are discovered.*

| Role | Name | Signature | Date |
|------|------|-----------|------|
| System Owner | Michael Schulz | _____________ | ______ |
| ISSO | *(appointed)* | _____________ | ______ |
