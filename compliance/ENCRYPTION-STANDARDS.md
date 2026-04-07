# Encryption Standards

**Knight Division Tactical — KDT Vault**

| Field | Value |
|-------|-------|
| **Policy Owner** | CEO / ISSO |
| **Effective Date** | *(upon approval)* |
| **Review Cycle** | Annual |
| **Classification** | CUI // SP-INFOSEC |
| **NIST 800-171 Family** | SC (System and Communications Protection) |

---

## 1. Purpose

This document defines the encryption standards for protecting data at rest, in transit, and in use within KDT Vault. All cryptographic implementations must use FIPS 140-2 validated modules where CUI is involved, as required by NIST 800-171 and CMMC Level 2.

## 2. FIPS 140-2 Requirements

### 2.1 What It Means

FIPS 140-2 is a U.S. Government standard that specifies security requirements for cryptographic modules. For CMMC Level 2 compliance, KDT must use **FIPS 140-2 validated** cryptographic modules when encrypting CUI.

### 2.2 Validation vs. Compliance

| Term | Meaning |
|------|---------|
| **FIPS 140-2 Validated** | The specific cryptographic module has been tested by an accredited lab and listed on NIST's CMVP (Cryptographic Module Validation Program) list |
| **FIPS 140-2 Compliant** | Claims to follow the standard but has NOT been formally validated — **this is insufficient for CUI** |

**KDT requirement: FIPS 140-2 Validated modules only for CUI protection.**

### 2.3 macOS FIPS Validation

Apple's CoreCrypto and corecrypto kernel modules are FIPS 140-2 validated:
- **CMVP Certificate:** Check current status at https://csrc.nist.gov/projects/cryptographic-module-validation-program
- **Apple Platform Security:** macOS uses corecrypto for FileVault, TLS, and keychain encryption
- **Requirement:** Ensure macOS is configured to use FIPS-validated cryptographic mode
- **Action:** Enable FIPS mode on macOS: `sudo fipsconfig -e` (if available on current macOS version)

> **⚠️ Verify current FIPS validation status** for the specific macOS version deployed. Apple periodically submits new versions for validation. Check CMVP at: https://csrc.nist.gov/projects/cryptographic-module-validation-program/validated-modules

## 3. Encryption At Rest

### 3.1 Full-Disk Encryption

| Component | Standard | Implementation |
|-----------|----------|---------------|
| **Mac Studio boot volume** | AES-256-XTS | FileVault 2 (enabled, FIPS-validated corecrypto) |
| **Mac Studio data volume** | AES-256-XTS | Encrypted APFS volume |
| **External backup drives** | AES-256-XTS | APFS encrypted or LUKS (if Linux) |

**FileVault Configuration:**
- Enabled on all volumes containing KDT data
- Recovery key escrowed with ISSO (stored in physical safe)
- Institutional recovery key configured (for emergency access)
- Automatic login disabled
- Screen lock on sleep/screensaver (immediate)

### 3.2 Database Encryption

| Layer | Standard | Implementation |
|-------|----------|---------------|
| **Database at rest** | AES-256 | PostgreSQL Transparent Data Encryption (TDE) or encrypted volume |
| **Column-level encryption** | AES-256-GCM | Application-level encryption for sensitive fields |
| **Backup encryption** | AES-256-GCM | Encrypted before writing to backup storage |

**PostgreSQL Encryption Strategy:**
- Primary: Database files on encrypted APFS volume (FileVault)
- Secondary: Application-level column encryption for:
  - File content hashes
  - User PII fields
  - Authentication secrets
  - Encryption keys (wrapped/encrypted)
- Connection encryption: `sslmode=verify-full` for all database connections

### 3.3 File Storage Encryption

| Component | Standard | Implementation |
|-----------|----------|---------------|
| **File content** | AES-256-GCM | Each file encrypted with unique Data Encryption Key (DEK) |
| **File metadata** | AES-256-GCM | Encrypted in database alongside access control data |
| **Temporary files** | AES-256 | Stored on encrypted volume; wiped on process completion |

**Content-Addressed Storage Encryption:**
```
Upload Flow:
1. Client uploads file over TLS 1.3
2. Server generates random DEK (256-bit) for this file
3. File encrypted with DEK using AES-256-GCM
4. DEK encrypted with KEK (Key Encryption Key) using AES-256-KW
5. Encrypted file stored in content-addressed storage
6. Encrypted DEK stored in database with file metadata
7. Plaintext DEK discarded from memory

Download Flow:
1. Client requests file over TLS 1.3
2. Server retrieves encrypted DEK from database
3. DEK decrypted with KEK
4. File decrypted with DEK
5. Decrypted content streamed to client over TLS
6. Plaintext DEK discarded from memory
```

### 3.4 Redis / Cache Encryption

| Component | Standard | Implementation |
|-----------|----------|---------------|
| **Redis at rest** | AES-256 | Redis on encrypted volume |
| **Redis in transit** | TLS 1.2+ | Redis TLS configuration |
| **Session data** | — | Sessions expire; sensitive data not cached |

## 4. Encryption In Transit

### 4.1 TLS Configuration

| Parameter | Requirement |
|-----------|-------------|
| **Minimum version** | TLS 1.3 (preferred) or TLS 1.2 |
| **TLS 1.0 / 1.1** | Disabled — must not be available |
| **SSL 3.0** | Disabled |
| **Cipher suites (TLS 1.3)** | TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256, TLS_AES_128_GCM_SHA256 |
| **Cipher suites (TLS 1.2)** | ECDHE-RSA-AES256-GCM-SHA384, ECDHE-RSA-AES128-GCM-SHA256, ECDHE-RSA-CHACHA20-POLY1305 |
| **Key exchange** | ECDHE (P-256 or P-384) or X25519 |
| **Certificate key size** | RSA 2048-bit minimum; EC P-256 minimum |
| **HSTS** | Enabled, max-age=31536000, includeSubDomains |
| **OCSP stapling** | Enabled |
| **Certificate transparency** | Required |

### 4.2 Internal Communications

| Connection | Encryption | Notes |
|------------|-----------|-------|
| Client ↔ KDT Vault API | TLS 1.3 | All API traffic |
| KDT Vault API ↔ PostgreSQL | TLS 1.2+ | `sslmode=verify-full` |
| KDT Vault API ↔ Redis | TLS 1.2+ | If Redis on separate host |
| Remote access (Tailscale) | WireGuard (ChaCha20-Poly1305) | FIPS consideration: WireGuard uses ChaCha20 — see Section 4.3 |
| Backup transfer | TLS 1.3 or SSH (AES-256) | Encrypted before transfer + encrypted channel |

### 4.3 Tailscale / WireGuard FIPS Consideration

WireGuard uses ChaCha20-Poly1305, Curve25519, BLAKE2s, and SipHash — these are **not FIPS 140-2 validated** in the standard WireGuard implementation.

**Mitigation:**
- Tailscale provides the network overlay (authentication, routing, ACLs)
- CUI is **always** encrypted at the application layer (TLS 1.3 with FIPS-validated modules) before entering the Tailscale tunnel
- The application-layer encryption satisfies FIPS requirements
- Tailscale provides defense-in-depth, not the primary FIPS encryption layer
- Document this in the SSP as defense-in-depth with FIPS compliance at application layer

### 4.4 Email Encryption

- CUI must never be sent via unencrypted email
- If CUI must be transmitted via email: S/MIME or PGP encryption required
- Preference: Share via KDT Vault secure link rather than email attachment

## 5. Key Management

### 5.1 Key Hierarchy

```
Root Key (Master KEK)
├── stored in macOS Keychain (hardware-backed on Apple Silicon)
├── backed up in physical safe (encrypted USB)
│
├── KEK-Files (Key Encryption Key for file DEKs)
│   ├── DEK-file-001 (per-file Data Encryption Key)
│   ├── DEK-file-002
│   └── ...
│
├── KEK-Database (Key Encryption Key for database column encryption)
│   ├── DEK-column-users-pii
│   ├── DEK-column-auth-secrets
│   └── ...
│
├── TLS Private Key (for HTTPS)
│
└── Backup Encryption Key
```

### 5.2 Key Generation

| Key Type | Algorithm | Size | Generation |
|----------|-----------|------|------------|
| Master KEK | AES-256 | 256-bit | FIPS-validated CSPRNG |
| File DEKs | AES-256-GCM | 256-bit | FIPS-validated CSPRNG |
| Database DEKs | AES-256-GCM | 256-bit | FIPS-validated CSPRNG |
| TLS keys | RSA or ECDSA | 2048-bit RSA / P-256 EC | FIPS-validated CSPRNG |
| Session tokens | — | 256-bit | FIPS-validated CSPRNG |

**All keys generated using macOS SecRandomCopyBytes or equivalent FIPS-validated CSPRNG.**

### 5.3 Key Storage

| Key | Storage Location | Protection |
|-----|-----------------|------------|
| Master KEK | macOS Keychain (Secure Enclave on Apple Silicon) | Hardware-backed, biometric/password unlock |
| File DEKs (wrapped) | PostgreSQL database | Encrypted with KEK-Files |
| TLS private key | macOS Keychain or filesystem (mode 0600) | Encrypted volume + file permissions |
| Backup encryption key | Physical safe (USB) + Keychain | Two copies, different locations |
| Recovery keys | Physical safe (printed) | Not stored digitally |

### 5.4 Key Rotation

| Key Type | Rotation Period | Process |
|----------|----------------|---------|
| Master KEK | Annual or on suspected compromise | Re-wrap all child KEKs with new master; old master securely destroyed |
| File KEKs | Annual | Re-wrap DEKs with new KEK; no need to re-encrypt files |
| File DEKs | On file re-encryption only | When file is updated, new DEK generated |
| TLS certificates | Annual (or 90 days if using Let's Encrypt) | Automated renewal preferred |
| Database KEKs | Annual | Re-wrap column DEKs |
| Session signing keys | Quarterly | Rotate; old key valid for verification for 24h grace period |

### 5.5 Key Destruction

- Keys destroyed using secure memory wiping (zeroing + deallocation)
- Cryptographic key material never written to swap (mlock in memory)
- Destroyed keys logged (key ID, destruction date, method — NOT the key material)
- Backup copies of destroyed keys securely destroyed within 24 hours

### 5.6 Emergency Key Recovery

1. Master KEK recovery USB retrieved from physical safe
2. Two-person integrity: CEO + ISSO both required to access safe
3. Recovery key used to decrypt and restore KEK to Keychain
4. Recovery event logged as security incident
5. Keys rotated after recovery use

## 6. Certificate Management

### 6.1 TLS Certificates

| Parameter | Requirement |
|-----------|-------------|
| **CA** | Let's Encrypt (automated) or trusted commercial CA |
| **Key size** | RSA 2048+ or ECDSA P-256+ |
| **Validity** | Maximum 398 days (industry standard); 90 days preferred |
| **Renewal** | Automated via certbot or equivalent, 30 days before expiry |
| **Revocation** | Immediate on compromise; notify ISSO |
| **Monitoring** | Alert at 30 days, 14 days, 7 days before expiry |

### 6.2 Internal Certificates

- PostgreSQL server/client certificates for mutual TLS
- Managed by ISSO
- Stored in macOS Keychain or application-specific certificate store
- Inventory maintained (see Section 7)

## 7. Cryptographic Module Inventory

Maintain a current inventory of all cryptographic implementations:

| Component | Module | Algorithm | FIPS Validated | CMVP Cert # | Notes |
|-----------|--------|-----------|:-:|-------------|-------|
| macOS FileVault | Apple corecrypto | AES-256-XTS | ✅ | *(check current)* | Full-disk encryption |
| macOS Keychain | Apple corecrypto | AES-256-GCM | ✅ | *(check current)* | Key storage |
| macOS TLS | Apple corecrypto | TLS 1.3 | ✅ | *(check current)* | System TLS |
| Node.js TLS | OpenSSL | TLS 1.3 | ✅ | *(check OpenSSL FIPS)* | Application TLS |
| Node.js crypto | OpenSSL | AES-256-GCM | ✅ | *(check OpenSSL FIPS)* | App-level encryption |
| PostgreSQL SSL | OpenSSL | TLS 1.2+ | ✅ | *(check version)* | Database connections |
| Tailscale | WireGuard (Go) | ChaCha20-Poly1305 | ❌ | N/A | Defense-in-depth only |
| Backup encryption | OpenSSL / gpg | AES-256-GCM | ✅ | *(check version)* | Backup files |

> **⚠️ Action Required:** Verify CMVP certificate numbers for deployed versions. FIPS validation is version-specific.

### 7.1 OpenSSL FIPS Mode

If using OpenSSL (via Node.js or directly):
- Use OpenSSL 3.x with FIPS provider enabled
- Set `OPENSSL_FIPS=1` or configure FIPS provider in OpenSSL config
- Verify: `openssl list -providers` should show FIPS provider
- Node.js: Launch with `--openssl-config=/path/to/openssl-fips.cnf` or use `--enable-fips`

## 8. Prohibited Cryptography

The following are **NOT permitted** for protecting CUI:

| Algorithm/Protocol | Reason |
|-------------------|--------|
| MD5 | Broken — collision attacks |
| SHA-1 | Deprecated — collision attacks |
| DES / 3DES | Deprecated — insufficient key length |
| RC4 | Broken — statistical biases |
| TLS 1.0 / 1.1 | Deprecated — known vulnerabilities |
| SSL 2.0 / 3.0 | Broken |
| RSA < 2048-bit | Insufficient key length |
| Self-signed certificates (production) | No chain of trust |
| Custom/proprietary encryption | Not validated |
| Base64 encoding (as "encryption") | Not encryption |

## 9. Compliance Verification

| Check | Frequency | Method |
|-------|-----------|--------|
| TLS configuration scan | Monthly | `testssl.sh` or `ssllabs.com` equivalent |
| FIPS module validation status | Quarterly | Check CMVP website for current certs |
| Encryption at rest verification | Quarterly | Verify FileVault status, database encryption |
| Key rotation compliance | Quarterly | Review rotation log |
| Certificate expiry check | Weekly (automated) | Monitoring alerts |
| Prohibited algorithm scan | Monthly | Configuration audit |

## 10. References

- FIPS 140-2 — Security Requirements for Cryptographic Modules
- FIPS 197 — Advanced Encryption Standard (AES)
- NIST SP 800-171 Rev 2 — System and Communications Protection (SC): 3.13.1–3.13.16
- NIST SP 800-57 — Recommendation for Key Management
- NIST SP 800-52 Rev 2 — Guidelines for TLS Implementations
- Apple Platform Security Guide — https://support.apple.com/guide/security

---

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CEO | Michael Schulz | _____________ | ______ |
| ISSO | *(appointed)* | _____________ | ______ |
