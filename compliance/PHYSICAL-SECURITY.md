# Physical Security Plan

**Knight Division Tactical — KDT Vault**

| Field | Value |
|-------|-------|
| **Policy Owner** | CEO / ISSO |
| **Effective Date** | *(upon approval)* |
| **Review Cycle** | Annual |
| **Classification** | CUI // SP-INFOSEC |
| **NIST 800-171 Family** | PE (Physical Protection), MP (Media Protection) |

---

## 1. Purpose

This document defines the physical security requirements for the hardware hosting KDT Vault, the physical space containing that hardware, and the procedures for controlling physical access to CUI processing equipment.

## 2. Scope

- Mac Studio hosting KDT Vault
- Network equipment (router, switch, access point)
- Backup media and storage devices
- Physical area designated for KDT Vault equipment
- Any media containing CUI (USB drives, printed documents)

## 3. Mac Studio Physical Security Requirements

### 3.1 Hardware Hardening

| Requirement | Implementation |
|-------------|---------------|
| **Physical access** | Mac Studio secured in locked server closet/room |
| **Tamper evidence** | Tamper-evident seals on chassis screws; check monthly |
| **Cable security** | Kensington lock or equivalent cable lock |
| **Port protection** | Unused USB/Thunderbolt ports covered with port blockers |
| **Serial number** | Recorded in asset inventory; verified quarterly |
| **Firmware password** | Set to prevent boot from external media |
| **Auto-boot** | Configured to restart after power failure |
| **Screen** | No display connected in server configuration; or display in locked room |

### 3.2 Asset Inventory

Maintain a hardware asset inventory:

| Field | Required |
|-------|----------|
| Asset ID | KDT-assigned unique ID |
| Device type | Mac Studio, router, etc. |
| Serial number | Manufacturer serial |
| Location | Room/rack/shelf |
| Classification level | Highest level processed |
| Assigned user/purpose | KDT Vault primary server |
| Purchase date | Date acquired |
| Warranty expiry | Date warranty expires |
| Last physical inspection | Date of last tamper check |

Inventory reviewed quarterly. Discrepancies investigated as security incidents.

## 4. Server Room / Closet Requirements

### 4.1 Designation

KDT must designate a specific room or closet as the **KDT Vault Equipment Area**. This area:
- Is dedicated to KDT information systems (no shared use with non-KDT equipment)
- Has controlled access (see Section 5)
- Meets environmental requirements (see Section 6)
- Is clearly identified to authorized personnel (but not publicly labeled as a server room)

### 4.2 Construction Requirements

| Requirement | Specification |
|-------------|--------------|
| **Walls** | Floor-to-ceiling solid construction (drywall minimum; concrete preferred) |
| **Door** | Solid-core door with commercial-grade lock |
| **Lock type** | Electronic cipher lock (code-based) or key lock with restricted key control |
| **Hinges** | Non-removable pins (security hinges) or hinges on inside |
| **Windows** | None preferred; if present, opaque covering + window locks |
| **Ceiling** | Solid (no drop-ceiling access from adjacent spaces) or barrier above drop ceiling |
| **Floor** | Raised floor not required; if present, secure floor panels |

### 4.3 Minimum Viable Setup (Small Office)

For KDT's current scale (Mac Studio in office environment):

1. **Dedicated lockable closet or cabinet** (minimum)
   - Solid construction, keyed lock
   - Sufficient ventilation (see Section 6)
   - Power outlet with surge protection
   - Network cable routed through wall/conduit
2. **Lockable server rack** (better)
   - 12U+ rack with locking front and rear panels
   - Placed in office with controlled access
   - Ventilation/cooling fans
3. **Dedicated room** (best)
   - Full room meeting Section 4.2 requirements
   - Recommended as KDT grows

## 5. Physical Access Control

### 5.1 Access Levels

| Level | Personnel | Access |
|-------|-----------|--------|
| **Unrestricted** | CEO, ISSO, System Administrator | 24/7 access to equipment area |
| **Escorted** | Other KDT employees | Only with authorized escort |
| **Supervised** | Maintenance, vendors, visitors | Escorted + logged + observed at all times |
| **None** | General public, unauthorized persons | No access under any circumstances |

### 5.2 Access Control Methods

| Method | Implementation |
|--------|---------------|
| **Key/Code control** | Keys/codes issued only to authorized personnel; key log maintained |
| **Access log** | Physical sign-in/sign-out log at equipment area entrance |
| **Key inventory** | All keys numbered and tracked; monthly reconciliation |
| **Code changes** | Cipher lock codes changed every 90 days and upon personnel change |
| **Lost key/code procedure** | Report to ISSO immediately; locks/codes changed within 24 hours |

### 5.3 Access Log Format

| Field | Required |
|-------|----------|
| Date | YYYY-MM-DD |
| Time in | HH:MM |
| Time out | HH:MM |
| Name | Full name |
| Organization | KDT or company name for visitors |
| Purpose | Reason for access |
| Escorted by | Name of escort (if applicable) |
| Signature | Physical signature |

Access logs retained for 3 years.

## 6. Environmental Controls

### 6.1 Temperature and Humidity

| Parameter | Range | Action if Exceeded |
|-----------|-------|--------------------|
| Temperature | 64–80°F (18–27°C) | Alert at 75°F; shutdown at 95°F |
| Humidity | 40–60% RH | Alert outside range; dehumidifier/humidifier |

**Monitoring:**
- Temperature/humidity sensor in equipment area (smart sensor with remote alerting)
- Alerts sent to ISSO and System Administrator
- Logged every 15 minutes; retained 1 year

### 6.2 Power

| Requirement | Implementation |
|-------------|---------------|
| **Surge protection** | UPS (Uninterruptible Power Supply) for Mac Studio + network equipment |
| **UPS capacity** | Minimum 15 minutes runtime for graceful shutdown |
| **UPS monitoring** | Network-connected UPS with automated shutdown trigger |
| **Power conditioning** | UPS provides line conditioning |
| **Generator** | Not required at current scale; plan if expanding |

**UPS Configuration:**
- Alert on power failure (immediate)
- Alert on battery low (5 minutes remaining)
- Automated graceful shutdown at 3 minutes remaining
- Monthly UPS self-test
- Annual battery replacement or per manufacturer schedule

### 6.3 Fire Protection

| Requirement | Implementation |
|-------------|---------------|
| **Detection** | Smoke detector in equipment area |
| **Suppression** | Clean-agent fire extinguisher (CO2 or FM-200) accessible; NOT water-based near equipment |
| **Alarm** | Connected to building fire alarm system |
| **Response** | Power off equipment if safe; evacuate; call fire department |

### 6.4 Water Protection

- No water pipes directly above equipment area
- Equipment elevated minimum 6 inches from floor (shelf/rack)
- Water sensor on floor of equipment area with alerting
- If water detected: power off equipment, notify ISSO

## 7. Visitor Policy

### 7.1 General Visitors

1. All visitors to KDT offices must sign in at reception
2. Visitors receive temporary badge (returned on departure)
3. Visitors are escorted at all times in non-public areas
4. Visitors do NOT access equipment area unless specifically authorized by ISSO

### 7.2 Maintenance/Vendor Visits to Equipment Area

1. Visit scheduled in advance with ISSO
2. Vendor identity verified (government ID)
3. ISSO or System Administrator escorts vendor at all times
4. Vendor signs equipment area access log
5. Vendor's activities observed and documented
6. Any tools/media brought in are inspected; any media brought out is inspected/sanitized
7. Vendor badge returned and logged on departure

### 7.3 Emergency Access (Fire/Police/EMT)

- Emergency responders may access as needed for life safety
- ISSO notified immediately
- Equipment area may be compromised — treat as potential physical security incident
- Full inspection after emergency responders depart

## 8. Media Protection (Physical)

### 8.1 Removable Media

| Rule | Detail |
|------|--------|
| **Authorized USB devices** | Only KDT-issued, encrypted USB drives |
| **Personal devices** | Prohibited from connecting to KDT Vault systems |
| **USB port blockers** | Installed on unused ports |
| **Media log** | All removable media tracked in inventory |
| **Encryption** | All removable media containing CUI must be encrypted (AES-256) |
| **Destruction** | Per Data Retention Policy secure destruction procedures |

### 8.2 Printed CUI

| Requirement | Detail |
|-------------|--------|
| **Printing** | CUI printing only on secure, authorized printer in controlled area |
| **Marking** | All printed CUI marked per Data Classification Policy |
| **Storage** | Printed CUI stored in GSA-approved locking container or cabinet |
| **Transport** | Covered (face-down, in folder/envelope) when moving through office |
| **Destruction** | Cross-cut shredding per Data Retention Policy |
| **Clean desk** | No CUI left visible on desks when unattended |

### 8.3 End-of-Life Media

- All media leaving KDT control must be sanitized per NIST 800-88
- See Data Retention Policy for destruction methods and logging
- Media cannot be donated, sold, or discarded without sanitization
- Destruction certificates maintained for CUI media

## 9. Physical Security Inspection Schedule

| Inspection | Frequency | Performed By |
|------------|-----------|-------------|
| Equipment area access log review | Weekly | ISSO |
| Tamper seal verification | Monthly | System Administrator + ISSO |
| Hardware asset inventory reconciliation | Quarterly | System Administrator |
| Key/code audit | Quarterly | ISSO |
| Environmental sensor calibration check | Semi-annually | System Administrator |
| UPS test (manual) | Annually | System Administrator |
| Full physical security assessment | Annually | ISSO + CEO |

## 10. Incident Response for Physical Security Events

| Event | Immediate Action | Notify |
|-------|-----------------|--------|
| Unauthorized access detected | Confront/remove if safe; secure area; preserve evidence | ISSO + CEO + law enforcement if needed |
| Tamper evidence broken | Do not use equipment; isolate; preserve evidence | ISSO + CEO |
| Equipment missing/stolen | Report immediately; change all access codes/keys | ISSO + CEO + law enforcement |
| Environmental alarm | Address hazard; protect equipment; power off if needed | System Administrator + ISSO |
| Fire in equipment area | Evacuate; fire department; power off remotely if possible | Emergency services + CEO |

All physical security incidents documented per Incident Response Plan.

## 11. References

- NIST SP 800-171 Rev 2 — Physical Protection (PE): 3.10.1–3.10.6
- NIST SP 800-171 Rev 2 — Media Protection (MP): 3.8.1–3.8.9
- NIST SP 800-53 Rev 5 — PE family (for supplementary guidance)
- CMMC Level 2 — PE and MP domain practices

---

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO | Michael Schulz | _____________ | ______ |
| ISSO | *(appointed)* | _____________ | ______ |
