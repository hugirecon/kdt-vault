# KDT Vault — Compliance Framework

## Overview

This directory contains the complete compliance documentation for **KDT Vault**, Knight Division Tactical's self-hosted document management system. KDT Vault replaces Google Drive with a system purpose-built for handling **Controlled Unclassified Information (CUI)** in accordance with Department of Defense contractor requirements.

## Standards & Frameworks

| Standard | Version | Applicability |
|----------|---------|---------------|
| **CMMC Level 2** | CMMC 2.0 | Required for DoD contracts involving CUI |
| **NIST SP 800-171** | Rev 2 | 110 security controls — the technical basis for CMMC Level 2 |
| **NIST SP 800-171A** | Rev 2 | Assessment procedures for 800-171 controls |
| **NIST SP 800-63B** | Rev 3 | Digital identity / authentication guidelines |
| **NIST SP 800-88** | Rev 1 | Media sanitization guidelines |
| **DFARS 252.204-7012** | — | Safeguarding Covered Defense Information |
| **DFARS 252.204-7020** | — | NIST 800-171 DoD Assessment Requirements |
| **FIPS 140-2** | — | Cryptographic module validation |

## Document Map

| Document | Purpose |
|----------|---------|
| [CMMC-LEVEL2-CONTROLS.md](CMMC-LEVEL2-CONTROLS.md) | All 110 NIST 800-171 controls mapped to KDT Vault implementation |
| [SYSTEM-SECURITY-PLAN.md](SYSTEM-SECURITY-PLAN.md) | SSP template — system boundaries, environment, data flows |
| [DATA-CLASSIFICATION-POLICY.md](DATA-CLASSIFICATION-POLICY.md) | Classification levels, marking, handling, spillage response |
| [ACCESS-CONTROL-POLICY.md](ACCESS-CONTROL-POLICY.md) | Roles, RBAC matrix, MFA, password policy, provisioning |
| [AUDIT-LOGGING-POLICY.md](AUDIT-LOGGING-POLICY.md) | Logged events, retention, protection, SIEM integration |
| [INCIDENT-RESPONSE-PLAN.md](INCIDENT-RESPONSE-PLAN.md) | Categories, team roles, containment, 72-hour DoD reporting |
| [DATA-RETENTION-POLICY.md](DATA-RETENTION-POLICY.md) | Retention periods, legal holds, secure destruction |
| [ENCRYPTION-STANDARDS.md](ENCRYPTION-STANDARDS.md) | FIPS 140-2, AES-256, TLS 1.3, key management |
| [BACKEND-ARCHITECTURE.md](BACKEND-ARCHITECTURE.md) | Tech stack, database schema, API design, deployment |
| [POAM-TEMPLATE.md](POAM-TEMPLATE.md) | Plan of Action & Milestones for tracking compliance gaps |
| [PHYSICAL-SECURITY.md](PHYSICAL-SECURITY.md) | Mac Studio security, server room, environmental controls |

## How to Use These Documents

### For an Assessor
Start with the **System Security Plan (SSP)** for the full system overview, then reference the **CMMC Level 2 Controls** document for control-by-control implementation details. Supporting policies are cross-referenced throughout.

### For Implementation
Start with **Backend Architecture** for technical design, then work through each policy document to understand the requirements your code must satisfy.

### For Operations
The **Access Control Policy**, **Audit Logging Policy**, and **Incident Response Plan** define day-to-day operational procedures.

### For Compliance Tracking
Use the **POA&M Template** to track gaps, remediation progress, and target dates.

## System Overview

- **System Name:** KDT Vault
- **Hosting:** Self-hosted on Apple Mac Studio (M-series)
- **OS:** macOS with encrypted APFS volumes
- **Network:** Tailscale mesh VPN + local network segmentation
- **Data Types:** CUI, UNCLASSIFIED business documents
- **Users:** KDT employees with role-based access
- **Authorization Boundary:** The Mac Studio hardware, its OS, KDT Vault application stack, and the Tailscale network overlay

## Document Control

| Field | Value |
|-------|-------|
| **Organization** | Knight Division Tactical (KDT) |
| **Document Owner** | CEO / Information System Security Officer (ISSO) |
| **Classification** | CUI // SP-INFOSEC |
| **Last Updated** | *(date of last review)* |
| **Review Cycle** | Annual or upon significant system change |
| **Version** | 1.0 — Initial Release |

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-06 | KDT | Initial compliance framework |

---

*This framework is a living set of documents. Update them as the system evolves, controls mature, and assessor feedback is incorporated.*
