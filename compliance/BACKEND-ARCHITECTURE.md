# KDT Vault — Backend Architecture

> CMMC Level 2 Compliant Self-Hosted Document Management System  
> Knight Division Tactical | Revision 1.0 | April 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack)
3. [Database Schema](#3-database-schema)
4. [API Design](#4-api-design)
5. [Authentication & Authorization Flow](#5-authentication--authorization-flow)
6. [File Storage Architecture](#6-file-storage-architecture)
7. [Audit Logging Pipeline](#7-audit-logging-pipeline)
8. [Backup & Disaster Recovery](#8-backup--disaster-recovery)
9. [Deployment Architecture (Mac Studio)](#9-deployment-architecture-mac-studio)
10. [Network Architecture](#10-network-architecture)
11. [Monitoring & Alerting](#11-monitoring--alerting)
12. [Frontend-Backend Integration](#12-frontend-backend-integration)
13. [Security Hardening Checklist](#13-security-hardening-checklist)

---

## 1. Executive Summary

**KDT Vault** is a self-hosted document management system purpose-built for Knight Division Tactical (KDT), a Department of Defense contractor. It replaces Google Drive and other cloud-based file storage with an on-premises solution that meets **CMMC Level 2** and **NIST SP 800-171** requirements for handling Controlled Unclassified Information (CUI).

### Why Self-Hosted

| Requirement | Cloud Storage Risk | KDT Vault Solution |
|---|---|---|
| **Data Sovereignty** | CUI stored on third-party servers outside KDT control | All data on KDT-owned hardware in a controlled environment |
| **CMMC Level 2** | Shared responsibility model complicates audit trail | Full ownership of every access control, log, and encryption key |
| **Access Control** | Cloud provider employees have theoretical access | Physical + logical access restricted to cleared KDT personnel |
| **Audit Trail** | Cloud audit logs may not meet 800-171 granularity | Append-only audit log with every action, IP, session, and classification level |
| **Incident Response** | Depends on vendor's timeline and cooperation | Immediate local response — pull the network cable if needed |
| **Cost** | Per-seat licensing scales with headcount | Fixed hardware cost, unlimited users |

### What It Does

- **Stores, organizes, and shares files** with folder hierarchy, versioning, and search
- **Classifies documents** by sensitivity level (Public, Internal, CUI, CUI-Specified)
- **Enforces clearance-based access** — users can only see files at or below their clearance
- **Logs everything** — immutable audit trail for every file access, download, share, and admin action
- **Encrypts at rest and in transit** — AES-256 file encryption, TLS 1.3 for all connections
- **Supports legal holds** — freeze files from deletion/modification for legal or compliance reasons
- **Scans for malware** — ClamAV on every upload before storage

**Deployment target:** Mac Studio (M2 Ultra, 64GB RAM, 2TB SSD) running Docker Compose with Tailscale for secure remote access.

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Runtime** | Node.js | 22 LTS | Server-side JavaScript runtime |
| **Framework** | Express.js | 4.x | HTTP server and middleware pipeline |
| **Language** | TypeScript | 5.x | Type safety across the entire codebase |
| **Database** | PostgreSQL | 16 | Primary data store with pgcrypto extension |
| **Cache/Sessions** | Redis | 7 | Session store, rate limiting counters, pub/sub |
| **File Storage** | Local APFS | — | Encrypted volume, content-addressed by SHA-256 |
| **Search** | Meilisearch | 1.x | Full-text search with typo tolerance and filtering |
| **Auth** | Passport.js | 0.7.x | Authentication middleware |
| **MFA (TOTP)** | speakeasy | 2.x | Time-based one-time passwords |
| **MFA (WebAuthn)** | fido2-lib | 3.x | Hardware security key / biometric auth |
| **Reverse Proxy** | Caddy | 2.x | Automatic TLS via Let's Encrypt, static file serving |
| **Virus Scanner** | ClamAV | 1.x | Malware detection on all uploads |
| **Validation** | Zod | 3.x | Runtime schema validation for all API inputs |
| **ORM/Query** | Knex.js | 3.x | SQL query builder with migration support |
| **Logging** | Pino | 8.x | Structured JSON logging |
| **Containerization** | Docker + Compose | 24.x / 2.x | Service orchestration |

### Why These Choices

- **Express.js over Fastify/Hono:** Mature ecosystem, Passport.js integration, team familiarity. Performance is not the bottleneck for <50 concurrent users.
- **PostgreSQL over SQLite:** ACID compliance, row-level security, separate audit role, pgcrypto for server-side hashing when needed.
- **Meilisearch over Elasticsearch:** 10x less memory, simpler config, fast enough for document metadata search. Not indexing file contents (CUI concern).
- **Caddy over Nginx:** Automatic HTTPS with zero config, built-in reverse proxy, no manual cert renewal.
- **Knex.js over Prisma:** Raw SQL access for audit table constraints, lighter abstraction, migration files are plain SQL.

---

## 3. Database Schema

### 3.1 Extensions and Types

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom enum types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE classification_level AS ENUM ('public', 'internal', 'cui', 'cui_specified');
CREATE TYPE access_level AS ENUM ('none', 'view', 'edit', 'admin');
CREATE TYPE dlp_status AS ENUM ('pending', 'clean', 'flagged', 'quarantined');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE encryption_key_status AS ENUM ('active', 'rotated', 'revoked');
```

### 3.2 Users

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    role            VARCHAR(50) NOT NULL DEFAULT 'user',
    clearance_level classification_level NOT NULL DEFAULT 'internal',
    mfa_secret      TEXT,                          -- encrypted TOTP seed
    mfa_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
    webauthn_credentials JSONB DEFAULT '[]'::jsonb, -- array of registered credentials
    password_hash   TEXT NOT NULL,                  -- argon2id hash
    status          user_status NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login      TIMESTAMPTZ,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until    TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
```

### 3.3 Roles

```sql
CREATE TABLE roles (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                    VARCHAR(100) NOT NULL UNIQUE,
    description             TEXT,
    max_classification_level classification_level NOT NULL DEFAULT 'internal',
    permissions_json        JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default roles
INSERT INTO roles (name, description, max_classification_level, permissions_json) VALUES
    ('admin', 'System administrator with full access', 'cui_specified', 
     '{"files":["create","read","update","delete","classify","sign"],"users":["create","read","update","delete"],"audit":["read","export"],"settings":["read","update"],"legal_holds":["create","read","delete"]}'),
    ('manager', 'Department manager with elevated access', 'cui',
     '{"files":["create","read","update","delete","classify"],"users":["read"],"audit":["read"]}'),
    ('user', 'Standard user', 'internal',
     '{"files":["create","read","update"],"users":[],"audit":[]}'),
    ('viewer', 'Read-only access', 'internal',
     '{"files":["read"],"users":[],"audit":[]}');
```

### 3.4 Files

```sql
CREATE TABLE files (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(500) NOT NULL,
    path                TEXT NOT NULL,              -- logical path in folder hierarchy
    mime_type           VARCHAR(255) NOT NULL,
    size                BIGINT NOT NULL,            -- bytes
    sha256_hash         CHAR(64) NOT NULL,          -- hex-encoded SHA-256
    classification      classification_level NOT NULL DEFAULT 'internal',
    owner_id            UUID NOT NULL REFERENCES users(id),
    parent_folder_id    UUID REFERENCES folders(id) ON DELETE SET NULL,
    encrypted           BOOLEAN NOT NULL DEFAULT TRUE,
    encryption_key_id   UUID REFERENCES encryption_keys(id),
    signed              BOOLEAN NOT NULL DEFAULT FALSE,
    signature_data      JSONB,                      -- {signer_id, timestamp, algorithm, signature}
    dlp_status          dlp_status NOT NULL DEFAULT 'pending',
    approval_status     approval_status NOT NULL DEFAULT 'approved',
    retention_policy_id UUID REFERENCES retention_policies(id),
    deleted_at          TIMESTAMPTZ,                -- soft delete
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_files_owner ON files(owner_id);
CREATE INDEX idx_files_parent_folder ON files(parent_folder_id);
CREATE INDEX idx_files_classification ON files(classification);
CREATE INDEX idx_files_sha256 ON files(sha256_hash);
CREATE INDEX idx_files_deleted ON files(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_files_name_trgm ON files USING gin(name gin_trgm_ops);
```

### 3.5 Folders

```sql
CREATE TABLE folders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(500) NOT NULL,
    parent_id       UUID REFERENCES folders(id) ON DELETE CASCADE,
    owner_id        UUID NOT NULL REFERENCES users(id),
    classification  classification_level NOT NULL DEFAULT 'internal',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(parent_id, name)  -- no duplicate folder names in same parent
);

CREATE INDEX idx_folders_parent ON folders(parent_id);
CREATE INDEX idx_folders_owner ON folders(owner_id);
```

### 3.6 File Versions

```sql
CREATE TABLE file_versions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id         UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    version_number  INTEGER NOT NULL,
    sha256_hash     CHAR(64) NOT NULL,
    size            BIGINT NOT NULL,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    change_summary  TEXT,
    
    UNIQUE(file_id, version_number)
);

CREATE INDEX idx_file_versions_file ON file_versions(file_id);
```

### 3.7 Permissions

```sql
CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id     UUID REFERENCES files(id) ON DELETE CASCADE,
    folder_id   UUID REFERENCES folders(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id     UUID REFERENCES roles(id) ON DELETE CASCADE,
    access_level access_level NOT NULL DEFAULT 'view',
    granted_by  UUID NOT NULL REFERENCES users(id),
    granted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ,
    
    -- At least one target (file or folder) must be set
    CHECK (file_id IS NOT NULL OR folder_id IS NOT NULL),
    -- At least one grantee (user or role) must be set
    CHECK (user_id IS NOT NULL OR role_id IS NOT NULL)
);

CREATE INDEX idx_permissions_file ON permissions(file_id);
CREATE INDEX idx_permissions_folder ON permissions(folder_id);
CREATE INDEX idx_permissions_user ON permissions(user_id);
CREATE INDEX idx_permissions_role ON permissions(role_id);
```

### 3.8 Audit Logs (Append-Only)

```sql
CREATE TABLE audit_logs (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id                 UUID REFERENCES users(id),
    action                  VARCHAR(100) NOT NULL,
    resource_type           VARCHAR(50) NOT NULL,    -- 'file', 'folder', 'user', 'session', 'setting'
    resource_id             UUID,
    classification_at_time  classification_level,
    ip_address              INET NOT NULL,
    user_agent              TEXT,
    details_json            JSONB DEFAULT '{}'::jsonb,
    session_id              UUID REFERENCES sessions(id)
);

-- Append-only enforcement via database role (see Section 7)
-- No UPDATE or DELETE grants on this table

CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_classification ON audit_logs(classification_at_time);

-- Partition by month for performance at scale
-- CREATE TABLE audit_logs_2026_04 PARTITION OF audit_logs
--     FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
```

### 3.9 Sessions

```sql
CREATE TABLE sessions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  CHAR(64) NOT NULL UNIQUE,   -- SHA-256 of the refresh token
    ip_address  INET NOT NULL,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

### 3.10 Retention Policies

```sql
CREATE TABLE retention_policies (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(255) NOT NULL UNIQUE,
    classification_level classification_level NOT NULL,
    retention_days      INTEGER NOT NULL,           -- 0 = indefinite
    auto_delete         BOOLEAN NOT NULL DEFAULT FALSE,
    legal_hold_override BOOLEAN NOT NULL DEFAULT TRUE, -- legal hold supersedes auto-delete
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default retention policies per NIST 800-171
INSERT INTO retention_policies (name, classification_level, retention_days, auto_delete) VALUES
    ('Public Default', 'public', 365, false),
    ('Internal Default', 'internal', 1095, false),      -- 3 years
    ('CUI Default', 'cui', 2555, false),                -- 7 years
    ('CUI-Specified Default', 'cui_specified', 2555, false);
```

### 3.11 Legal Holds

```sql
CREATE TABLE legal_holds (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    reason      TEXT NOT NULL,
    created_by  UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    released_at TIMESTAMPTZ,
    file_ids    UUID[] NOT NULL DEFAULT '{}'  -- array of held file UUIDs
);

CREATE INDEX idx_legal_holds_active ON legal_holds(released_at) WHERE released_at IS NULL;
```

### 3.12 Encryption Keys

```sql
CREATE TABLE encryption_keys (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_identifier  VARCHAR(255) NOT NULL UNIQUE,  -- human-readable identifier
    algorithm       VARCHAR(50) NOT NULL DEFAULT 'aes-256-gcm',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rotated_at      TIMESTAMPTZ,
    status          encryption_key_status NOT NULL DEFAULT 'active'
);

-- The actual key material is stored in a separate key file on the encrypted volume,
-- NOT in the database. This table tracks metadata only.

CREATE INDEX idx_encryption_keys_status ON encryption_keys(status);
```

### 3.13 Classification Changes

```sql
CREATE TABLE classification_changes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id     UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    old_level   classification_level NOT NULL,
    new_level   classification_level NOT NULL,
    changed_by  UUID NOT NULL REFERENCES users(id),
    reason      TEXT NOT NULL,
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_class_changes_file ON classification_changes(file_id);
CREATE INDEX idx_class_changes_time ON classification_changes(timestamp DESC);
```

### 3.14 Sharing Links

```sql
CREATE TABLE sharing_links (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id         UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    created_by      UUID NOT NULL REFERENCES users(id),
    token_hash      CHAR(64) NOT NULL UNIQUE,   -- SHA-256 of the share token
    expires_at      TIMESTAMPTZ NOT NULL,
    access_level    access_level NOT NULL DEFAULT 'view',
    download_count  INTEGER NOT NULL DEFAULT 0,
    max_downloads   INTEGER,                     -- NULL = unlimited
    requires_auth   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sharing_links_file ON sharing_links(file_id);
CREATE INDEX idx_sharing_links_token ON sharing_links(token_hash);
CREATE INDEX idx_sharing_links_expires ON sharing_links(expires_at);
```

### 3.15 Database Roles and Security

```sql
-- Application role (normal operations)
CREATE ROLE kdt_app LOGIN PASSWORD 'CHANGE_ME_IN_ENV';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO kdt_app;

-- Revoke dangerous operations on audit_logs from app role
REVOKE UPDATE, DELETE ON audit_logs FROM kdt_app;

-- Audit writer role (can only INSERT into audit_logs)
CREATE ROLE kdt_audit LOGIN PASSWORD 'CHANGE_ME_IN_ENV';
GRANT INSERT ON audit_logs TO kdt_audit;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO kdt_audit;

-- Read-only role for reporting/compliance
CREATE ROLE kdt_readonly LOGIN PASSWORD 'CHANGE_ME_IN_ENV';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO kdt_readonly;

-- Backup role
CREATE ROLE kdt_backup LOGIN PASSWORD 'CHANGE_ME_IN_ENV';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO kdt_backup;
```

---

## 4. API Design

All endpoints prefixed with `/api/v1`. All request/response bodies are JSON. All endpoints require authentication unless marked `[public]`.

### 4.1 Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/login` | Email + password login. Returns MFA challenge if enabled. | Public |
| `POST` | `/auth/mfa/verify` | Submit TOTP code or WebAuthn assertion | Public (with login token) |
| `POST` | `/auth/logout` | Revoke current session and refresh token | Required |
| `POST` | `/auth/webauthn/register` | Begin WebAuthn credential registration | Required |
| `POST` | `/auth/webauthn/authenticate` | Begin WebAuthn authentication challenge | Public (with login token) |
| `POST` | `/auth/password/change` | Change password (requires current password) | Required |
| `POST` | `/auth/token/refresh` | Exchange refresh token for new access token | Public (with refresh token) |

**Login Request:**
```json
POST /api/v1/auth/login
{
    "email": "user@kdt.com",
    "password": "..."
}
```

**Login Response (MFA required):**
```json
{
    "status": "mfa_required",
    "mfa_token": "temporary-token-uuid",
    "methods": ["totp", "webauthn"]
}
```

**Login Response (success, MFA not enabled):**
```json
{
    "access_token": "eyJhbG...",
    "refresh_token": "dGhpcyBpcyBh...",
    "expires_in": 900,
    "user": {
        "id": "uuid",
        "email": "user@kdt.com",
        "name": "John Doe",
        "role": "user",
        "clearance_level": "internal"
    }
}
```

### 4.2 Files

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/files` | List files (paginated, filtered by folder/classification) |
| `POST` | `/files` | Create file metadata record |
| `GET` | `/files/:id` | Get file metadata |
| `PUT` | `/files/:id` | Update file metadata (name, classification, etc.) |
| `DELETE` | `/files/:id` | Soft-delete file (moves to trash) |
| `POST` | `/files/:id/upload` | Upload file content (multipart/form-data) |
| `GET` | `/files/:id/download` | Download file (streams encrypted → decrypted) |
| `GET` | `/files/:id/versions` | List all versions of a file |
| `POST` | `/files/:id/classify` | Change file classification level |
| `POST` | `/files/:id/sign` | Digitally sign a file |

**Upload Request:**
```
POST /api/v1/files/:id/upload
Content-Type: multipart/form-data

file: <binary>
change_summary: "Updated Q1 report with final numbers"
```

**Upload Response:**
```json
{
    "id": "file-uuid",
    "version": 2,
    "sha256_hash": "a1b2c3...",
    "size": 1048576,
    "dlp_status": "clean",
    "virus_scan": "passed"
}
```

**File List Query Parameters:**
```
GET /api/v1/files?folder_id=uuid&classification=cui&page=1&per_page=50&sort=updated_at&order=desc
```

### 4.3 Folders

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/folders` | List root-level folders |
| `POST` | `/folders` | Create a new folder |
| `GET` | `/folders/:id` | Get folder metadata |
| `PUT` | `/folders/:id` | Update folder (name, classification) |
| `DELETE` | `/folders/:id` | Delete folder (must be empty or cascade) |
| `GET` | `/folders/:id/contents` | List files and subfolders |

**Folder Contents Response:**
```json
{
    "folder": { "id": "uuid", "name": "Project Alpha", "classification": "cui" },
    "folders": [
        { "id": "uuid", "name": "Contracts", "item_count": 12 }
    ],
    "files": [
        { "id": "uuid", "name": "SOW.pdf", "size": 524288, "classification": "cui", "updated_at": "..." }
    ],
    "pagination": { "page": 1, "per_page": 50, "total": 13 }
}
```

### 4.4 Sharing

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/files/:id/share` | Create a sharing link |
| `GET` | `/shares/:id` | Get share link details |
| `DELETE` | `/shares/:id` | Revoke a sharing link |
| `GET` | `/shares/:token/access` | Access a file via share token |

**Share Request:**
```json
POST /api/v1/files/:id/share
{
    "access_level": "view",
    "expires_in_hours": 48,
    "max_downloads": 5,
    "requires_auth": true
}
```

**Share Response:**
```json
{
    "id": "share-uuid",
    "url": "https://vault.kdt.local/s/abc123def456",
    "expires_at": "2026-04-08T20:00:00Z",
    "max_downloads": 5
}
```

### 4.5 Search

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/search` | Full-text search across file metadata |

**Query Parameters:**
```
GET /api/v1/search?q=contract&classification=cui&type=application/pdf&owner=uuid&tags=legal,active&dateFrom=2026-01-01&dateTo=2026-04-01&page=1&per_page=20
```

**Search Response:**
```json
{
    "results": [
        {
            "id": "file-uuid",
            "name": "DoD Contract 2026-Q1.pdf",
            "path": "/Contracts/DoD/2026/",
            "classification": "cui",
            "highlights": ["...relevant <mark>contract</mark> terms..."],
            "score": 0.95
        }
    ],
    "total": 3,
    "query_time_ms": 12
}
```

> **Security note:** Search results are filtered server-side by the requesting user's clearance level. A user with `internal` clearance will never see `cui` or `cui_specified` results, regardless of query.

### 4.6 Audit

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/audit/logs` | Query audit logs with filters | Admin only |
| `GET` | `/audit/export` | Export audit logs as CSV/JSON | Admin only |

**Audit Query Parameters:**
```
GET /api/v1/audit/logs?user_id=uuid&action=file.download&resource_type=file&from=2026-04-01&to=2026-04-06&page=1&per_page=100
```

**Available Action Types:**
```
auth.login, auth.login_failed, auth.logout, auth.mfa_verify, auth.password_change
file.create, file.read, file.update, file.delete, file.upload, file.download, file.classify, file.sign
folder.create, folder.read, folder.update, folder.delete
share.create, share.access, share.revoke
user.create, user.update, user.delete, user.suspend
admin.settings_change, admin.retention_policy_change
legal_hold.create, legal_hold.release
```

### 4.7 Admin

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/settings` | Get system settings |
| `PUT` | `/admin/settings` | Update system settings |
| `GET` | `/admin/users` | List all users |
| `POST` | `/admin/users` | Create a new user |
| `PUT` | `/admin/users/:id` | Update user (role, clearance, status) |
| `DELETE` | `/admin/users/:id` | Deactivate user account |
| `GET` | `/admin/compliance/dashboard` | Compliance overview metrics |
| `POST` | `/admin/retention-policies` | Create or update retention policy |

**Compliance Dashboard Response:**
```json
{
    "total_files": 1247,
    "files_by_classification": {
        "public": 89,
        "internal": 734,
        "cui": 401,
        "cui_specified": 23
    },
    "users_without_mfa": 0,
    "failed_logins_today": 2,
    "files_pending_classification": 5,
    "active_legal_holds": 1,
    "last_backup": "2026-04-06T03:00:00Z",
    "disk_usage_percent": 34,
    "audit_log_entries_today": 892
}
```

### 4.8 Legal Holds

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/legal-holds` | Create a legal hold |
| `GET` | `/admin/legal-holds` | List all legal holds |
| `GET` | `/admin/legal-holds/:id` | Get legal hold details |
| `PUT` | `/admin/legal-holds/:id/files` | Add/remove files from hold |
| `DELETE` | `/admin/legal-holds/:id` | Release a legal hold |

### 4.9 Standard Response Envelope

All API responses follow a consistent envelope:

```json
// Success
{
    "success": true,
    "data": { ... },
    "meta": { "page": 1, "per_page": 50, "total": 234 }
}

// Error
{
    "success": false,
    "error": {
        "code": "INSUFFICIENT_CLEARANCE",
        "message": "Your clearance level does not permit access to CUI files",
        "status": 403
    }
}
```

### 4.10 Standard HTTP Status Codes

| Code | Usage |
|---|---|
| `200` | Success |
| `201` | Created (new resource) |
| `204` | No content (successful delete) |
| `400` | Validation error (Zod schema failure) |
| `401` | Not authenticated |
| `403` | Authenticated but not authorized (clearance/role) |
| `404` | Resource not found |
| `409` | Conflict (duplicate, version mismatch) |
| `413` | File too large |
| `422` | Virus detected in upload |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## 5. Authentication & Authorization Flow

### 5.1 Login Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client   │     │  Server  │     │   Redis  │     │ Postgres │
└─────┬─────┘     └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
      │                  │                  │                  │
      │ POST /auth/login │                  │                  │
      │ {email, password}│                  │                  │
      │─────────────────>│                  │                  │
      │                  │  Check rate limit │                  │
      │                  │─────────────────>│                  │
      │                  │  OK / BLOCKED    │                  │
      │                  │<─────────────────│                  │
      │                  │                  │                  │
      │                  │  Lookup user by email               │
      │                  │────────────────────────────────────>│
      │                  │  user record                        │
      │                  │<────────────────────────────────────│
      │                  │                  │                  │
      │                  │  Verify argon2id(password, hash)    │
      │                  │  (if fail: increment attempts)      │
      │                  │                  │                  │
      │                  │  Check: locked_until > now()?       │
      │                  │  Check: failed_attempts >= 5?       │
      │                  │                  │                  │
      │  IF MFA enabled: │                  │                  │
      │  {mfa_required,  │                  │                  │
      │   mfa_token}     │                  │                  │
      │<─────────────────│                  │                  │
      │                  │                  │                  │
      │ POST /auth/mfa/  │                  │                  │
      │ verify {token,   │                  │                  │
      │  code}           │                  │                  │
      │─────────────────>│                  │                  │
      │                  │  Verify TOTP or WebAuthn            │
      │                  │                  │                  │
      │  {access_token,  │  Store session   │  Create session  │
      │   refresh_token} │─────────────────>│────────────────>│
      │<─────────────────│                  │                  │
      │                  │                  │                  │
      │  Set httpOnly    │                  │                  │
      │  secure cookies  │                  │                  │
```

### 5.2 Token Strategy

| Token | Storage | Lifetime | Purpose |
|---|---|---|---|
| **Access Token** (JWT) | httpOnly secure cookie | 15 minutes | API authentication |
| **Refresh Token** | httpOnly secure cookie + DB hash | 7 days | Obtain new access tokens |
| **MFA Token** | Redis (TTL: 5 min) | 5 minutes | Temporary token during MFA flow |
| **CSRF Token** | Cookie + header | Per-session | Double-submit CSRF protection |

**Access Token JWT Payload:**
```json
{
    "sub": "user-uuid",
    "email": "user@kdt.com",
    "role": "user",
    "clearance": "internal",
    "session": "session-uuid",
    "iat": 1712444400,
    "exp": 1712445300
}
```

**JWT signing:** RS256 with 2048-bit RSA key pair. Private key stored on encrypted volume. Key rotation every 90 days.

### 5.3 RBAC Middleware

```typescript
// middleware/authorization.ts

interface AuthContext {
    user: {
        id: string;
        role: string;
        clearance_level: ClassificationLevel;
    };
    session: {
        id: string;
        ip: string;
    };
}

// Classification hierarchy (higher index = higher clearance)
const CLEARANCE_HIERARCHY: ClassificationLevel[] = [
    'public',       // 0
    'internal',     // 1
    'cui',          // 2
    'cui_specified'  // 3
];

function canAccessClassification(
    userClearance: ClassificationLevel,
    resourceClassification: ClassificationLevel
): boolean {
    const userLevel = CLEARANCE_HIERARCHY.indexOf(userClearance);
    const resourceLevel = CLEARANCE_HIERARCHY.indexOf(resourceClassification);
    return userLevel >= resourceLevel;
}

// Express middleware
function requireClearance(minLevel: ClassificationLevel) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!canAccessClassification(req.auth.user.clearance_level, minLevel)) {
            auditLog(req, 'access.denied', { required: minLevel });
            return res.status(403).json({
                success: false,
                error: { code: 'INSUFFICIENT_CLEARANCE', message: 'Access denied' }
            });
        }
        next();
    };
}

// File-level access check (runs on every file operation)
async function requireFileAccess(
    userId: string,
    fileId: string,
    requiredLevel: AccessLevel
): Promise<boolean> {
    const file = await db('files').where({ id: fileId }).first();
    if (!file) return false;

    const user = await db('users').where({ id: userId }).first();
    
    // Check 1: User clearance vs file classification
    if (!canAccessClassification(user.clearance_level, file.classification)) {
        return false;
    }
    
    // Check 2: Explicit permission or ownership
    if (file.owner_id === userId) return true;
    
    const permission = await db('permissions')
        .where({ file_id: fileId, user_id: userId })
        .where('expires_at', '>', new Date())
        .orWhereNull('expires_at')
        .first();
    
    if (!permission) return false;
    
    const ACCESS_HIERARCHY = ['none', 'view', 'edit', 'admin'];
    return ACCESS_HIERARCHY.indexOf(permission.access_level) >= 
           ACCESS_HIERARCHY.indexOf(requiredLevel);
}
```

### 5.4 Session Management

- **IP Binding:** Sessions are bound to the originating IP. If the IP changes, the session is invalidated and re-auth is required.
- **Concurrent Sessions:** Maximum 3 active sessions per user. Creating a 4th revokes the oldest.
- **Session Revocation:** Logout revokes the session immediately. Admins can revoke all sessions for any user.
- **Refresh Token Rotation:** Each refresh creates a new refresh token and invalidates the old one (rotation). If a revoked token is used, all sessions for that user are terminated (potential token theft).

### 5.5 Brute Force Protection

```typescript
// Rate limit configuration
const AUTH_RATE_LIMITS = {
    // Per IP
    loginAttemptsPerIP: { max: 20, window: '15m' },
    // Per account
    loginAttemptsPerAccount: { max: 5, window: '15m' },
    // Account lockout
    lockoutThreshold: 5,          // consecutive failures
    lockoutDuration: '30m',       // lock duration
    // Progressive delay
    delayAfterFailure: 1000,      // ms delay multiplied by attempt number
};
```

After 5 consecutive failed logins:
1. Account is locked for 30 minutes (`locked_until` set in DB)
2. Audit log entry created: `auth.account_locked`
3. Alert sent to admin Discord webhook
4. All existing sessions for that account are revoked

### 5.6 Password Requirements (NIST 800-63B)

- Minimum 12 characters (no maximum imposed)
- No composition rules (no forced uppercase/special chars — per NIST guidance)
- Checked against breach database (Have I Been Pwned k-anonymity API)
- No password hints or knowledge-based questions
- Passwords hashed with **argon2id** (memory: 64MB, iterations: 3, parallelism: 4)
- Password change requires current password + MFA

---

## 6. File Storage Architecture

### 6.1 Content-Addressed Storage

Files are stored on disk by their SHA-256 hash, providing automatic deduplication:

```
/Volumes/KDTVault/
├── store/
│   ├── a1/
│   │   ├── b2c3d4e5f6...  (first 2 chars of hash as directory)
│   │   └── ...
│   ├── f7/
│   │   └── 8a9b0c1d2e...
│   └── ...
├── keys/
│   ├── master.key          (encrypted master key)
│   └── rotated/
│       └── 2026-01-key.old
├── temp/
│   └── uploads/            (staging area, cleared hourly)
└── quarantine/
    └── ...                 (virus-detected files)
```

**Storage path formula:**
```
/Volumes/KDTVault/store/{hash[0:2]}/{hash[2:]}
```

This means the same file content uploaded by different users is only stored once. The `files` and `file_versions` tables reference the hash, not a filesystem path.

### 6.2 Encrypted APFS Volume

The Mac Studio has a dedicated APFS volume (`KDTVault`) with:

- **APFS encryption** enabled (AES-256-XTS, hardware-accelerated on Apple Silicon)
- **Separate passphrase** from the boot drive (stored in macOS Keychain, accessible only to the service account)
- **Volume auto-mounts** at boot via launchd script before Docker starts
- **FileVault** enabled on the boot drive as an additional layer

### 6.3 File Upload Flow

```
Client                    Server                   ClamAV         Disk           Meilisearch
  │                         │                        │              │                │
  │  POST /files/:id/upload │                        │              │                │
  │  multipart/form-data    │                        │              │                │
  │────────────────────────>│                        │              │                │
  │                         │                        │              │                │
  │                         │  1. Auth + clearance   │              │                │
  │                         │     check              │              │                │
  │                         │                        │              │                │
  │                         │  2. Write to temp/     │              │                │
  │                         │─────────────────────────────────────>│                │
  │                         │                        │              │                │
  │                         │  3. Virus scan         │              │                │
  │                         │───────────────────────>│              │                │
  │                         │  CLEAN / INFECTED      │              │                │
  │                         │<───────────────────────│              │                │
  │                         │                        │              │                │
  │                         │  If INFECTED: quarantine + reject    │                │
  │                         │                        │              │                │
  │                         │  4. SHA-256 hash       │              │                │
  │                         │  5. Check if hash      │              │                │
  │                         │     already exists     │              │                │
  │                         │     (dedup)            │              │                │
  │                         │                        │              │                │
  │                         │  6. Encrypt with       │              │                │
  │                         │     AES-256-GCM        │              │                │
  │                         │                        │              │                │
  │                         │  7. Move to store/     │              │                │
  │                         │─────────────────────────────────────>│                │
  │                         │                        │              │                │
  │                         │  8. Create file_version record       │                │
  │                         │  9. Update file metadata             │                │
  │                         │ 10. Audit log entry                  │                │
  │                         │                        │              │                │
  │                         │ 11. Index metadata     │              │                │
  │                         │──────────────────────────────────────────────────────>│
  │                         │                        │              │                │
  │  201 Created            │                        │              │                │
  │  {hash, version, size}  │                        │              │                │
  │<────────────────────────│                        │              │                │
```

### 6.4 File Download Flow

```typescript
async function downloadFile(req: Request, res: Response) {
    const fileId = req.params.id;
    const userId = req.auth.user.id;
    
    // 1. Get file metadata
    const file = await db('files').where({ id: fileId }).first();
    if (!file || file.deleted_at) return res.status(404).json({ error: 'Not found' });
    
    // 2. Clearance check
    if (!canAccessClassification(req.auth.user.clearance_level, file.classification)) {
        await auditLog(req, 'file.download.denied', { file_id: fileId, reason: 'clearance' });
        return res.status(403).json({ error: 'Insufficient clearance' });
    }
    
    // 3. Permission check
    if (!await requireFileAccess(userId, fileId, 'view')) {
        await auditLog(req, 'file.download.denied', { file_id: fileId, reason: 'permission' });
        return res.status(403).json({ error: 'Access denied' });
    }
    
    // 4. Check legal hold (prevent download of held files if configured)
    const hold = await db('legal_holds')
        .whereRaw('? = ANY(file_ids)', [fileId])
        .whereNull('released_at')
        .first();
    // Legal holds don't block download, but we flag it in the audit
    
    // 5. Audit log BEFORE serving (guarantees log even if stream fails)
    await auditLog(req, 'file.download', {
        file_id: fileId,
        classification: file.classification,
        legal_hold: hold ? hold.id : null
    });
    
    // 6. Resolve storage path and decrypt
    const storagePath = getStoragePath(file.sha256_hash);
    const decryptStream = createDecryptStream(storagePath, file.encryption_key_id);
    
    // 7. Stream to client
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
    res.setHeader('Content-Length', file.size);
    res.setHeader('X-Classification', file.classification);
    
    decryptStream.pipe(res);
}
```

### 6.5 File Encryption

Each file is encrypted individually with **AES-256-GCM**:

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

interface EncryptionResult {
    iv: Buffer;          // 12 bytes
    authTag: Buffer;     // 16 bytes
    encryptedPath: string;
}

async function encryptFile(inputPath: string, keyId: string): Promise<EncryptionResult> {
    const key = await getKeyMaterial(keyId);  // from key file, not DB
    const iv = randomBytes(12);
    
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const outputPath = inputPath + '.enc';
    
    const input = createReadStream(inputPath);
    const output = createWriteStream(outputPath);
    
    input.pipe(cipher).pipe(output);
    
    await new Promise((resolve, reject) => {
        output.on('finish', resolve);
        output.on('error', reject);
    });
    
    return {
        iv,
        authTag: cipher.getAuthTag(),
        encryptedPath: outputPath
    };
}
```

The IV and auth tag are stored as a 28-byte header prepended to the encrypted file.

### 6.6 Virus Scanning

- **ClamAV** runs as a Docker container with the `clamd` daemon
- All uploads are scanned before being moved to permanent storage
- Scan via Unix socket for speed (no network overhead)
- Signature database updates daily via `freshclam`
- Infected files are moved to `/Volumes/KDTVault/quarantine/` and an alert is sent
- Max scan size matches max upload size (500MB)

### 6.7 Limits

| Parameter | Value | Configurable |
|---|---|---|
| Max file size | 500 MB | Yes (`MAX_FILE_SIZE_BYTES` env var) |
| Max filename length | 500 chars | No |
| Allowed characters in filename | Unicode minus control chars | No |
| Upload timeout | 5 minutes | Yes |
| Concurrent uploads per user | 3 | Yes |
| Total storage alert threshold | 80% of volume | Yes |

---

## 7. Audit Logging Pipeline

### 7.1 Architecture

```
                                 ┌─────────────────┐
                                 │   PostgreSQL     │
                                 │   audit_logs     │
                                 │  (append-only)   │
                                 └────────▲─────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
              ┌─────┴──────┐      ┌──────┴───────┐     ┌──────┴───────┐
              │ API Request │      │  Background  │     │    Admin     │
              │  Middleware │      │    Jobs      │     │   Actions    │
              └────────────┘      └──────────────┘     └──────────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │   Alert Engine   │
                                 │  (real-time)     │
                                 └────────┬─────────┘
                                          │
                              ┌───────────┼───────────┐
                              ▼           ▼           ▼
                         ┌────────┐ ┌─────────┐ ┌────────┐
                         │ Email  │ │ Discord │ │  File  │
                         │        │ │ Webhook │ │  Log   │
                         └────────┘ └─────────┘ └────────┘
```

### 7.2 Append-Only Enforcement

The `audit_logs` table is protected at the database level:

```sql
-- The application uses the kdt_audit role for audit writes
-- This role can ONLY INSERT, never UPDATE or DELETE

REVOKE ALL ON audit_logs FROM kdt_app;
GRANT INSERT ON audit_logs TO kdt_app;
GRANT SELECT ON audit_logs TO kdt_app;

-- Even the kdt_audit role cannot modify existing rows
REVOKE UPDATE, DELETE ON audit_logs FROM kdt_audit;
GRANT INSERT ON audit_logs TO kdt_audit;

-- Additional protection: trigger that prevents any UPDATE/DELETE
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable. Operation denied.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_immutable_guard
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();
```

### 7.3 Audit Log Entry Structure

```typescript
interface AuditLogEntry {
    id: string;                          // UUID
    timestamp: Date;                     // Server time (UTC)
    user_id: string | null;              // null for system events
    action: string;                      // e.g., 'file.download'
    resource_type: string;               // 'file', 'user', 'session', etc.
    resource_id: string | null;          // UUID of affected resource
    classification_at_time: string;      // Classification level when action occurred
    ip_address: string;                  // Client IP
    user_agent: string;                  // Browser/client identifier
    details_json: Record<string, any>;   // Action-specific metadata
    session_id: string;                  // Session UUID for correlation
}
```

### 7.4 Logging Middleware

```typescript
// middleware/audit.ts
async function auditLog(
    req: Request,
    action: string,
    details: Record<string, any> = {}
) {
    // Use the dedicated audit database connection (kdt_audit role)
    await auditDb('audit_logs').insert({
        user_id: req.auth?.user?.id || null,
        action,
        resource_type: details.resource_type || inferResourceType(req),
        resource_id: details.resource_id || req.params?.id,
        classification_at_time: details.classification || null,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        details_json: sanitizeDetails(details),  // strip passwords, tokens
        session_id: req.auth?.session?.id
    });
    
    // Check alert conditions
    await checkAlertConditions(action, details, req);
}

function sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const REDACTED_FIELDS = ['password', 'token', 'secret', 'mfa_secret', 'key'];
    const sanitized = { ...details };
    for (const field of REDACTED_FIELDS) {
        if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
        }
    }
    return sanitized;
}
```

### 7.5 Real-Time Alert Conditions

| Condition | Threshold | Alert Channel | Severity |
|---|---|---|---|
| Failed auth attempts | >3 in 15 min (same account) | Discord + Email | High |
| Classification downgrade | Any | Discord + Email | High |
| Bulk downloads | >20 files in 10 min (same user) | Discord | Medium |
| Admin setting changes | Any | Discord + Email | High |
| Account lockout | Any | Discord | Medium |
| Virus detected | Any | Discord + Email | Critical |
| New admin user created | Any | Discord + Email | High |
| Legal hold modification | Any | Discord + Email | High |
| Failed clearance check | Any | Discord | Medium |

### 7.6 Daily Log Export

A scheduled job (cron via launchd) runs at 03:00 daily:

```bash
#!/bin/bash
# /opt/kdt-vault/scripts/export-audit-logs.sh

DATE=$(date -v-1d +%Y-%m-%d)  # Yesterday
EXPORT_DIR="/Volumes/KDTVault/audit-exports"
EXPORT_FILE="${EXPORT_DIR}/audit-${DATE}.json.gpg"

# Export yesterday's audit logs
docker exec kdt-postgres psql -U kdt_readonly -d kdtvault \
    -c "COPY (SELECT * FROM audit_logs WHERE timestamp >= '${DATE}' AND timestamp < '${DATE}'::date + interval '1 day') TO STDOUT WITH (FORMAT json)" \
    | gpg --encrypt --recipient audit@kdt.com > "${EXPORT_FILE}"

# Verify export
gpg --decrypt "${EXPORT_FILE}" | wc -l > "${EXPORT_DIR}/audit-${DATE}.count"

# Checksum
shasum -a 256 "${EXPORT_FILE}" >> "${EXPORT_DIR}/checksums.txt"
```

---

## 8. Backup & Disaster Recovery

### 8.1 Backup Strategy

| Component | Method | Schedule | Retention |
|---|---|---|---|
| **PostgreSQL** | `pg_dump` → GPG encrypt | Daily 02:00 | 30 daily, 12 monthly, 7 yearly |
| **File Storage** | `rsync` encrypted volume → external drive | Daily 03:00 | Mirror (full copy) |
| **Configuration** | Git repo (docker-compose, Caddyfile, scripts) | On change | Git history |
| **Encryption Keys** | Manual export to secure offline storage | On rotation | Indefinite |
| **Audit Exports** | Included in PostgreSQL backup + separate export | Daily 03:00 | Same as DB |

### 8.2 Database Backup Script

```bash
#!/bin/bash
# /opt/kdt-vault/scripts/backup-database.sh

set -euo pipefail

BACKUP_DIR="/Volumes/KDTBackup/postgres"
DATE=$(date +%Y-%m-%d_%H%M)
BACKUP_FILE="${BACKUP_DIR}/daily/kdtvault-${DATE}.sql.gpg"

# Create backup directories
mkdir -p "${BACKUP_DIR}"/{daily,monthly,yearly}

# Dump database, compress, encrypt
docker exec kdt-postgres pg_dump -U kdt_backup kdtvault \
    | gzip \
    | gpg --encrypt --recipient backup@kdt.com \
    > "${BACKUP_FILE}"

# Generate checksum
shasum -a 256 "${BACKUP_FILE}" > "${BACKUP_FILE}.sha256"

# Log backup size
ls -lh "${BACKUP_FILE}" >> "${BACKUP_DIR}/backup-log.txt"

# Rotation: keep 30 daily
find "${BACKUP_DIR}/daily" -name "*.gpg" -mtime +30 -delete

# Monthly: copy first-of-month backup
DAY=$(date +%d)
if [ "$DAY" = "01" ]; then
    cp "${BACKUP_FILE}" "${BACKUP_DIR}/monthly/"
    # Keep 12 monthly
    ls -t "${BACKUP_DIR}/monthly/"*.gpg | tail -n +13 | xargs rm -f 2>/dev/null || true
fi

# Yearly: copy Jan 1 backup
MONTH_DAY=$(date +%m-%d)
if [ "$MONTH_DAY" = "01-01" ]; then
    cp "${BACKUP_FILE}" "${BACKUP_DIR}/yearly/"
    # Keep 7 yearly
    ls -t "${BACKUP_DIR}/yearly/"*.gpg | tail -n +8 | xargs rm -f 2>/dev/null || true
fi

echo "$(date): Backup completed: ${BACKUP_FILE}" >> "${BACKUP_DIR}/backup-log.txt"
```

### 8.3 File Storage Backup

```bash
#!/bin/bash
# /opt/kdt-vault/scripts/backup-files.sh

set -euo pipefail

SOURCE="/Volumes/KDTVault/store/"
DEST="/Volumes/KDTBackup/files/"

# rsync with checksum verification
rsync -avz --checksum --delete \
    --log-file="/Volumes/KDTBackup/rsync-$(date +%Y-%m-%d).log" \
    "${SOURCE}" "${DEST}"

# Verify file count matches
SRC_COUNT=$(find "${SOURCE}" -type f | wc -l)
DST_COUNT=$(find "${DEST}" -type f | wc -l)

if [ "$SRC_COUNT" -ne "$DST_COUNT" ]; then
    echo "ALERT: File count mismatch! Source: ${SRC_COUNT}, Dest: ${DST_COUNT}" >&2
    # Send Discord alert
    curl -H "Content-Type: application/json" \
        -d "{\"content\":\"⚠️ Backup file count mismatch: Source ${SRC_COUNT}, Dest ${DST_COUNT}\"}" \
        "${DISCORD_WEBHOOK_URL}"
    exit 1
fi

echo "$(date): File backup completed. ${SRC_COUNT} files synced." >> "/Volumes/KDTBackup/backup-log.txt"
```

### 8.4 Recovery Objectives

| Metric | Target | How |
|---|---|---|
| **RTO** (Recovery Time) | 4 hours | Docker Compose rebuild + restore from latest backup |
| **RPO** (Recovery Point) | 24 hours | Daily backups (worst case: lose 1 day of data) |

### 8.5 Recovery Procedure

```bash
# 1. Rebuild Docker environment
cd /opt/kdt-vault
docker compose up -d postgres redis meilisearch

# 2. Restore PostgreSQL
gpg --decrypt /Volumes/KDTBackup/postgres/daily/latest.sql.gpg \
    | gunzip \
    | docker exec -i kdt-postgres psql -U postgres kdtvault

# 3. Restore file storage (if needed)
rsync -avz /Volumes/KDTBackup/files/ /Volumes/KDTVault/store/

# 4. Rebuild Meilisearch index
docker exec kdt-app node scripts/reindex-search.js

# 5. Verify
docker exec kdt-app node scripts/verify-integrity.js

# 6. Start application
docker compose up -d
```

### 8.6 Monthly Backup Verification

A monthly launchd job tests recovery:

1. Spin up a temporary PostgreSQL container
2. Restore the latest backup into it
3. Run integrity checks (row counts, checksums)
4. Verify random sample of files can be decrypted
5. Log results and alert on failure
6. Tear down temporary container

---

## 9. Deployment Architecture (Mac Studio)

### 9.1 Hardware

| Component | Spec |
|---|---|
| **Machine** | Mac Studio (M2 Ultra) |
| **RAM** | 64 GB |
| **Storage** | 2 TB SSD (boot) + encrypted APFS volume (vault) |
| **Backup** | External USB-C SSD (encrypted) |
| **Location** | KDT office, physically secured |

### 9.2 Docker Compose

```yaml
# docker-compose.yml
version: "3.9"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: kdt-app
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://kdt_app:${DB_APP_PASSWORD}@postgres:5432/kdtvault
      AUDIT_DATABASE_URL: postgres://kdt_audit:${DB_AUDIT_PASSWORD}@postgres:5432/kdtvault
      REDIS_URL: redis://redis:6379
      MEILISEARCH_URL: http://meilisearch:7700
      MEILISEARCH_KEY: ${MEILISEARCH_MASTER_KEY}
      JWT_PRIVATE_KEY_PATH: /run/secrets/jwt_private_key
      JWT_PUBLIC_KEY_PATH: /run/secrets/jwt_public_key
      ENCRYPTION_KEY_DIR: /vault/keys
      FILE_STORAGE_DIR: /vault/store
      TEMP_DIR: /vault/temp
      CLAMAV_SOCKET: /var/run/clamav/clamd.sock
      MAX_FILE_SIZE_BYTES: "524288000"  # 500MB
      CORS_ORIGIN: https://vault.kdt.local
      LOG_LEVEL: info
    volumes:
      - /Volumes/KDTVault:/vault
      - clamav-socket:/var/run/clamav
    ports:
      - "127.0.0.1:3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      meilisearch:
        condition: service_started
      clamav:
        condition: service_healthy
    secrets:
      - jwt_private_key
      - jwt_public_key
    networks:
      - kdt-internal
    deploy:
      resources:
        limits:
          memory: 2G

  postgres:
    image: postgres:16-alpine
    container_name: kdt-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: kdtvault
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_ROOT_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-db:/docker-entrypoint-initdb.d  # SQL scripts for roles, extensions
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - kdt-internal
    deploy:
      resources:
        limits:
          memory: 4G

  redis:
    image: redis:7-alpine
    container_name: kdt-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    ports:
      - "127.0.0.1:6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - kdt-internal

  meilisearch:
    image: getmeili/meilisearch:v1
    container_name: kdt-meilisearch
    restart: unless-stopped
    environment:
      MEILI_MASTER_KEY: ${MEILISEARCH_MASTER_KEY}
      MEILI_ENV: production
      MEILI_DB_PATH: /meili_data
    volumes:
      - meilisearch-data:/meili_data
    ports:
      - "127.0.0.1:7700:7700"
    networks:
      - kdt-internal
    deploy:
      resources:
        limits:
          memory: 1G

  clamav:
    image: clamav/clamav:stable
    container_name: kdt-clamav
    restart: unless-stopped
    volumes:
      - clamav-data:/var/lib/clamav
      - clamav-socket:/var/run/clamav
    healthcheck:
      test: ["CMD", "clamdscan", "--ping", "1"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - kdt-internal
    deploy:
      resources:
        limits:
          memory: 2G

  caddy:
    image: caddy:2-alpine
    container_name: kdt-caddy
    restart: unless-stopped
    ports:
      - "443:443"
      - "80:80"  # Redirect to HTTPS only
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy-data:/data
      - caddy-config:/config
      - ./frontend/out:/srv/frontend  # Static frontend build
    depends_on:
      - app
    networks:
      - kdt-internal
      - kdt-external

secrets:
  jwt_private_key:
    file: ./secrets/jwt-private.pem
  jwt_public_key:
    file: ./secrets/jwt-public.pem

volumes:
  postgres-data:
  redis-data:
  meilisearch-data:
  clamav-data:
  clamav-socket:
  caddy-data:
  caddy-config:

networks:
  kdt-internal:
    internal: true  # No external access
  kdt-external:
    driver: bridge
```

### 9.3 Caddyfile

```caddyfile
vault.kdt.local {
    # Frontend (static files)
    handle /app/* {
        root * /srv/frontend
        file_server
        try_files {path} /index.html
    }

    # API proxy
    handle /api/* {
        reverse_proxy app:3001
    }

    # Share link access
    handle /s/* {
        reverse_proxy app:3001
    }

    # Health check (public)
    handle /health {
        reverse_proxy app:3001
    }

    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        X-XSS-Protection "0"
        -Server
    }

    # Rate limiting
    rate_limit {
        zone api {
            key {remote_host}
            events 100
            window 1m
        }
    }

    # TLS via Let's Encrypt (or internal CA for .local)
    tls internal
}
```

### 9.4 Launchd Auto-Start (macOS equivalent of systemd)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.kdt.vault</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/docker</string>
        <string>compose</string>
        <string>-f</string>
        <string>/opt/kdt-vault/docker-compose.yml</string>
        <string>up</string>
        <string>-d</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>WorkingDirectory</key>
    <string>/opt/kdt-vault</string>
    <key>StandardOutPath</key>
    <string>/var/log/kdt-vault/startup.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/kdt-vault/startup-error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin</string>
    </dict>
</dict>
</plist>
```

Install: `sudo cp com.kdt.vault.plist /Library/LaunchDaemons/ && sudo launchctl load /Library/LaunchDaemons/com.kdt.vault.plist`

### 9.5 Environment File Template

```bash
# .env (DO NOT COMMIT — listed in .gitignore)

# Database
DB_ROOT_PASSWORD=<generate-with-openssl-rand-base64-32>
DB_APP_PASSWORD=<generate-with-openssl-rand-base64-32>
DB_AUDIT_PASSWORD=<generate-with-openssl-rand-base64-32>
DB_READONLY_PASSWORD=<generate-with-openssl-rand-base64-32>
DB_BACKUP_PASSWORD=<generate-with-openssl-rand-base64-32>

# Redis
REDIS_PASSWORD=<generate-with-openssl-rand-base64-32>

# Meilisearch
MEILISEARCH_MASTER_KEY=<generate-with-openssl-rand-base64-32>

# Discord Webhook (for alerts)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Alert Email
ALERT_EMAIL_TO=admin@kdt.com

# Tailscale Auth Key (for initial setup)
TAILSCALE_AUTH_KEY=tskey-auth-...
```

---

## 10. Network Architecture

### 10.1 Network Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │      Tailscale          │
              │   (Encrypted Tunnel)    │
              │   100.x.x.x network    │
              └────────────┬────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                     MAC STUDIO                                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  macOS Firewall (pf)                                      │   │
│  │  Allow: 443 (Caddy), Tailscale                            │   │
│  │  Block: everything else                                   │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────┴───────────────────────────────────┐   │
│  │  Caddy (Port 443)          ←── TLS Termination           │   │
│  │  ├── /app/*    → Static Frontend                         │   │
│  │  ├── /api/*    → Node.js App (127.0.0.1:3001)           │   │
│  │  ├── /s/*      → Node.js App (share links)              │   │
│  │  └── /health   → Node.js App                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─── Docker Internal Network (kdt-internal) ──────────────┐   │
│  │                                                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────┐            │   │
│  │  │ Node.js  │  │ Postgres │  │   Redis    │            │   │
│  │  │ App      │  │    :5432 │  │     :6379  │            │   │
│  │  │   :3001  │  │          │  │            │            │   │
│  │  └──────────┘  └──────────┘  └────────────┘            │   │
│  │                                                          │   │
│  │  ┌────────────┐  ┌──────────┐                           │   │
│  │  │ Meilisearch│  │  ClamAV  │                           │   │
│  │  │      :7700 │  │  (socket)│                           │   │
│  │  └────────────┘  └──────────┘                           │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Encrypted APFS Volume (/Volumes/KDTVault)               │   │
│  │  └── store/ keys/ temp/ quarantine/ audit-exports/       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 10.2 Tailscale Configuration

- **No port forwarding** on the router — the Mac Studio is not directly exposed to the internet
- Tailscale provides a WireGuard-based encrypted tunnel
- Each KDT device has a Tailscale client; access is controlled via Tailscale ACLs
- The vault is accessible at `https://vault.kdt.local` via Tailscale's MagicDNS

**Tailscale ACL (tailscale.com/admin):**
```json
{
    "acls": [
        {
            "action": "accept",
            "src": ["group:kdt-employees"],
            "dst": ["tag:kdt-vault:443"]
        }
    ],
    "groups": {
        "group:kdt-employees": ["user1@kdt.com", "user2@kdt.com"]
    },
    "tagOwners": {
        "tag:kdt-vault": ["group:kdt-admins"]
    }
}
```

### 10.3 Firewall Rules (macOS pf)

```bash
# /etc/pf.conf additions
# Block all inbound except Tailscale and Caddy

block in all
pass in on lo0 all
pass in on utun+ all          # Tailscale interface
pass in proto tcp to port 443  # HTTPS (Caddy)
pass out all                   # Allow all outbound
```

### 10.4 Rate Limiting

```typescript
// middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Global API rate limit
export const globalLimiter = rateLimit({
    store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }),
    windowMs: 60 * 1000,    // 1 minute
    max: 100,                // 100 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } }
});

// Strict limit for auth endpoints
export const authLimiter = rateLimit({
    store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }),
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 20,                     // 20 auth attempts per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
});

// Upload rate limit (per user, not IP)
export const uploadLimiter = rateLimit({
    store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }),
    windowMs: 60 * 1000,
    max: 10,
    keyGenerator: (req) => req.auth.user.id,
});
```

### 10.5 CORS Configuration

```typescript
// config/cors.ts
import cors from 'cors';

export const corsOptions: cors.CorsOptions = {
    origin: process.env.CORS_ORIGIN || 'https://vault.kdt.local',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials: true,       // Required for httpOnly cookies
    maxAge: 86400,           // Preflight cache: 24 hours
};
```

---

## 11. Monitoring & Alerting

### 11.1 Health Check Endpoint

```typescript
// routes/health.ts
router.get('/health', async (req, res) => {
    const checks = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            database: await checkPostgres(),
            redis: await checkRedis(),
            meilisearch: await checkMeilisearch(),
            clamav: await checkClamav(),
            storage: await checkStorage(),
        },
        system: {
            memory_used_mb: Math.round(process.memoryUsage.rss() / 1048576),
            disk_usage_percent: await getDiskUsage('/Volumes/KDTVault'),
            active_sessions: await getActiveSessionCount(),
        }
    };
    
    const allHealthy = Object.values(checks.services).every(s => s.status === 'ok');
    res.status(allHealthy ? 200 : 503).json(checks);
});
```

**Response:**
```json
{
    "status": "ok",
    "timestamp": "2026-04-06T20:00:00Z",
    "uptime": 86400,
    "services": {
        "database": { "status": "ok", "latency_ms": 2 },
        "redis": { "status": "ok", "latency_ms": 1 },
        "meilisearch": { "status": "ok", "latency_ms": 3 },
        "clamav": { "status": "ok", "last_update": "2026-04-06T02:00:00Z" },
        "storage": { "status": "ok", "used_percent": 34, "free_gb": 1320 }
    },
    "system": {
        "memory_used_mb": 847,
        "disk_usage_percent": 34,
        "active_sessions": 8
    }
}
```

### 11.2 Metrics Collection

```typescript
// services/metrics.ts

interface SystemMetrics {
    disk_usage_percent: number;
    disk_free_bytes: number;
    cpu_load_1m: number;
    memory_used_percent: number;
    active_sessions: number;
    failed_auths_1h: number;
    file_operations_1h: number;
    total_files: number;
    total_storage_bytes: number;
}

// Collected every 60 seconds, stored in Redis with 24h TTL
async function collectMetrics(): Promise<SystemMetrics> {
    return {
        disk_usage_percent: await getDiskUsage('/Volumes/KDTVault'),
        disk_free_bytes: await getDiskFree('/Volumes/KDTVault'),
        cpu_load_1m: os.loadavg()[0],
        memory_used_percent: (1 - os.freemem() / os.totalmem()) * 100,
        active_sessions: await db('sessions')
            .where('revoked', false)
            .where('expires_at', '>', new Date())
            .count('* as count')
            .then(r => r[0].count),
        failed_auths_1h: await db('audit_logs')
            .where('action', 'auth.login_failed')
            .where('timestamp', '>', new Date(Date.now() - 3600000))
            .count('* as count')
            .then(r => r[0].count),
        file_operations_1h: await db('audit_logs')
            .where('resource_type', 'file')
            .where('timestamp', '>', new Date(Date.now() - 3600000))
            .count('* as count')
            .then(r => r[0].count),
        total_files: await db('files').whereNull('deleted_at').count('* as count').then(r => r[0].count),
        total_storage_bytes: await db('files').whereNull('deleted_at').sum('size as total').then(r => r[0].total || 0),
    };
}
```

### 11.3 Alert Configuration

```typescript
// services/alerts.ts

interface AlertRule {
    name: string;
    condition: (metrics: SystemMetrics) => boolean;
    severity: 'info' | 'warning' | 'critical';
    cooldownMinutes: number;  // Don't re-alert within this window
    message: (metrics: SystemMetrics) => string;
}

const ALERT_RULES: AlertRule[] = [
    {
        name: 'disk_warning',
        condition: (m) => m.disk_usage_percent >= 80,
        severity: 'warning',
        cooldownMinutes: 60,
        message: (m) => `⚠️ Disk usage at ${m.disk_usage_percent}% — consider cleanup`
    },
    {
        name: 'disk_critical',
        condition: (m) => m.disk_usage_percent >= 90,
        severity: 'critical',
        cooldownMinutes: 15,
        message: (m) => `🚨 CRITICAL: Disk usage at ${m.disk_usage_percent}% — immediate action required`
    },
    {
        name: 'failed_auths',
        condition: (m) => m.failed_auths_1h > 10,
        severity: 'warning',
        cooldownMinutes: 30,
        message: (m) => `🔐 ${m.failed_auths_1h} failed auth attempts in the last hour`
    },
    {
        name: 'high_memory',
        condition: (m) => m.memory_used_percent > 90,
        severity: 'warning',
        cooldownMinutes: 30,
        message: (m) => `💾 Memory usage at ${Math.round(m.memory_used_percent)}%`
    }
];

// Alert delivery
async function sendAlert(rule: AlertRule, metrics: SystemMetrics) {
    const message = rule.message(metrics);
    
    // Discord webhook
    await fetch(process.env.DISCORD_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
    });
    
    // Email (for critical alerts)
    if (rule.severity === 'critical') {
        await sendEmail({
            to: process.env.ALERT_EMAIL_TO!,
            subject: `[KDT Vault] ${rule.severity.toUpperCase()}: ${rule.name}`,
            body: message
        });
    }
}
```

### 11.4 SSL Certificate Monitoring

Caddy handles certificate renewal automatically. A daily check verifies cert validity:

```bash
#!/bin/bash
# /opt/kdt-vault/scripts/check-cert.sh
EXPIRY=$(echo | openssl s_client -connect localhost:443 -servername vault.kdt.local 2>/dev/null \
    | openssl x509 -noout -enddate 2>/dev/null \
    | cut -d= -f2)

EXPIRY_EPOCH=$(date -j -f "%b %d %H:%M:%S %Y %Z" "$EXPIRY" +%s 2>/dev/null)
NOW_EPOCH=$(date +%s)
DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))

if [ "$DAYS_LEFT" -lt 14 ]; then
    curl -H "Content-Type: application/json" \
        -d "{\"content\":\"⚠️ TLS certificate expires in ${DAYS_LEFT} days\"}" \
        "${DISCORD_WEBHOOK_URL}"
fi
```

---

## 12. Frontend-Backend Integration

### 12.1 Architecture

```
┌────────────────────────────────────────────┐
│                  Caddy                      │
│                                            │
│   /app/*  →  Static Next.js export         │
│   /api/*  →  Reverse proxy to Node.js      │
│   /s/*    →  Reverse proxy to Node.js      │
│                                            │
└────────────────────────────────────────────┘
```

**Next.js** is built as a static export (`next export`) and served directly by Caddy. Alternatively, Next.js can run in SSR mode proxied by Caddy.

### 12.2 Authentication Flow (Browser)

```
Browser                         Caddy                 Node.js API
   │                              │                       │
   │  POST /api/v1/auth/login     │                       │
   │  {email, password}           │                       │
   │─────────────────────────────>│──────────────────────>│
   │                              │                       │
   │                              │  Set-Cookie:          │
   │                              │    access_token=...;  │
   │                              │    HttpOnly; Secure;  │
   │                              │    SameSite=Strict;   │
   │                              │    Path=/api          │
   │                              │  Set-Cookie:          │
   │                              │    refresh_token=...; │
   │                              │    HttpOnly; Secure;  │
   │                              │    SameSite=Strict;   │
   │                              │    Path=/api/v1/auth  │
   │                              │  Set-Cookie:          │
   │                              │    csrf_token=...;    │
   │                              │    Secure;            │
   │                              │    SameSite=Strict    │
   │<─────────────────────────────│<──────────────────────│
   │                              │                       │
   │  GET /api/v1/files           │                       │
   │  Cookie: access_token=...    │                       │
   │  X-CSRF-Token: ...           │                       │
   │─────────────────────────────>│──────────────────────>│
   │                              │                       │
```

**Key decisions:**
- **httpOnly cookies** — tokens never exposed to JavaScript (XSS-proof)
- **Secure flag** — cookies only sent over HTTPS
- **SameSite=Strict** — no cross-origin cookie sending
- **Path scoping** — refresh token only sent to `/api/v1/auth` endpoints

### 12.3 CSRF Protection

Double-submit cookie pattern:

1. On login, server sets a non-httpOnly cookie `csrf_token` with a random value
2. Frontend reads `csrf_token` from the cookie and includes it as `X-CSRF-Token` header on every mutating request (POST, PUT, DELETE)
3. Server compares the header value to the cookie value — must match
4. Since the cookie is `SameSite=Strict`, cross-origin requests can't include it

```typescript
// middleware/csrf.ts
function csrfProtection(req: Request, res: Response, next: NextFunction) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    
    const cookieToken = req.cookies['csrf_token'];
    const headerToken = req.headers['x-csrf-token'];
    
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return res.status(403).json({
            success: false,
            error: { code: 'CSRF_VALIDATION_FAILED', message: 'Invalid CSRF token' }
        });
    }
    next();
}
```

### 12.4 Real-Time Updates (SSE)

Server-Sent Events for live notifications without WebSocket complexity:

```typescript
// routes/events.ts
router.get('/events', authenticate, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const userId = req.auth.user.id;
    
    // Subscribe to Redis pub/sub for this user's events
    const subscriber = redisClient.duplicate();
    subscriber.subscribe(`user:${userId}:events`);
    
    subscriber.on('message', (channel, message) => {
        res.write(`data: ${message}\n\n`);
    });
    
    // Heartbeat every 30s to keep connection alive
    const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n');
    }, 30000);
    
    req.on('close', () => {
        clearInterval(heartbeat);
        subscriber.unsubscribe();
        subscriber.quit();
    });
});
```

**Event types:**
```json
{"type": "file.uploaded", "data": {"file_id": "uuid", "name": "report.pdf"}}
{"type": "share.accessed", "data": {"share_id": "uuid", "accessor": "user@kdt.com"}}
{"type": "alert", "data": {"severity": "warning", "message": "Disk usage at 80%"}}
{"type": "classification.changed", "data": {"file_id": "uuid", "new_level": "cui"}}
```

### 12.5 Frontend API Client

```typescript
// lib/api.ts (Next.js frontend)

class VaultAPI {
    private baseUrl = '/api/v1';
    
    private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const csrfToken = this.getCsrfToken();
        
        const res = await fetch(`${this.baseUrl}${path}`, {
            credentials: 'include',  // Send cookies
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
                ...options.headers,
            },
            ...options,
        });
        
        if (res.status === 401) {
            // Try refresh
            const refreshed = await this.refreshToken();
            if (refreshed) return this.request(path, options);
            window.location.href = '/login';
            throw new Error('Session expired');
        }
        
        const data = await res.json();
        if (!data.success) throw new ApiError(data.error);
        return data.data;
    }
    
    private getCsrfToken(): string {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('csrf_token='))
            ?.split('=')[1] || '';
    }
    
    private async refreshToken(): Promise<boolean> {
        try {
            const res = await fetch(`${this.baseUrl}/auth/token/refresh`, {
                method: 'POST',
                credentials: 'include',
            });
            return res.ok;
        } catch {
            return false;
        }
    }
    
    // Files
    listFiles = (params: FileListParams) => this.request<FileList>(`/files?${qs(params)}`);
    getFile = (id: string) => this.request<File>(`/files/${id}`);
    uploadFile = (id: string, file: Blob, summary?: string) => {
        const form = new FormData();
        form.append('file', file);
        if (summary) form.append('change_summary', summary);
        return this.request<UploadResult>(`/files/${id}/upload`, {
            method: 'POST',
            headers: {},  // Let browser set Content-Type with boundary
            body: form,
        });
    };
    downloadFile = (id: string) => window.open(`${this.baseUrl}/files/${id}/download`);
    
    // Search
    search = (params: SearchParams) => this.request<SearchResult>(`/search?${qs(params)}`);
    
    // Audit
    getAuditLogs = (params: AuditParams) => this.request<AuditList>(`/audit/logs?${qs(params)}`);
}

export const api = new VaultAPI();
```

---

## 13. Security Hardening Checklist

### 13.1 Dependency Management

- [ ] All npm dependencies pinned to exact versions (`package-lock.json` committed)
- [ ] `npm audit` run weekly via cron; critical vulnerabilities patched within 24h
- [ ] No `eval()`, `new Function()`, or dynamic `require()` in application code
- [ ] Docker base images pinned to specific digests, not `:latest`
- [ ] Dependabot / Renovate configured for automated PR on security updates

### 13.2 HTTP Security Headers (Helmet.js)

```typescript
import helmet from 'helmet';

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],  // Required for some UI frameworks
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'none'"],
            frameSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: [],
        }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    dnsPrefetchControl: { allow: false },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssProtection: false,  // Deprecated; CSP is the modern replacement
}));
```

### 13.3 Input Validation (Zod)

```typescript
import { z } from 'zod';

// Every endpoint validates input with Zod schemas
const loginSchema = z.object({
    email: z.string().email().max(255),
    password: z.string().min(1).max(1000),
});

const fileCreateSchema = z.object({
    name: z.string().min(1).max(500)
        .regex(/^[^<>:"/\\|?*\x00-\x1f]+$/),  // No path traversal chars
    parent_folder_id: z.string().uuid().optional(),
    classification: z.enum(['public', 'internal', 'cui', 'cui_specified']).default('internal'),
});

const classifySchema = z.object({
    classification: z.enum(['public', 'internal', 'cui', 'cui_specified']),
    reason: z.string().min(10).max(1000),  // Must justify classification changes
});

const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    per_page: z.coerce.number().int().min(1).max(100).default(50),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).default('desc'),
});

// Middleware factory
function validate(schema: z.ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid request data',
                    details: result.error.issues
                }
            });
        }
        req.validated = result.data;
        next();
    };
}
```

### 13.4 SQL Injection Prevention

- **All queries** use Knex.js parameterized bindings — no string concatenation
- Raw SQL used only for migrations and the audit immutability trigger
- Example of correct usage:

```typescript
// ✅ Correct — parameterized
const files = await db('files')
    .where({ owner_id: userId, classification: level })
    .whereNull('deleted_at')
    .orderBy('updated_at', 'desc')
    .limit(50);

// ✅ Correct — parameterized raw
const results = await db.raw(
    'SELECT * FROM files WHERE name ILIKE ? AND classification <= ?',
    [`%${searchTerm}%`, userClearance]
);

// ❌ NEVER — string interpolation
// const results = await db.raw(`SELECT * FROM files WHERE name = '${userInput}'`);
```

### 13.5 File Type Validation

```typescript
import { fileTypeFromBuffer } from 'file-type';

async function validateFileType(buffer: Buffer, claimedMimeType: string): Promise<boolean> {
    // Check magic bytes
    const detected = await fileTypeFromBuffer(buffer);
    
    // Allow plain text files (no magic bytes)
    if (!detected && claimedMimeType.startsWith('text/')) return true;
    
    // Reject if magic bytes don't match claimed type
    if (detected && detected.mime !== claimedMimeType) {
        throw new ValidationError(
            `File type mismatch: claimed ${claimedMimeType}, detected ${detected.mime}`
        );
    }
    
    // Block dangerous file types
    const BLOCKED_TYPES = [
        'application/x-executable',
        'application/x-msdos-program',
        'application/x-msdownload',
        'application/x-sh',
        'application/x-shellscript',
    ];
    
    if (detected && BLOCKED_TYPES.includes(detected.mime)) {
        throw new ValidationError(`File type ${detected.mime} is not allowed`);
    }
    
    return true;
}
```

### 13.6 Log Sanitization

```typescript
// No sensitive data in logs
const SENSITIVE_FIELDS = [
    'password', 'password_hash', 'mfa_secret', 'token', 'refresh_token',
    'access_token', 'secret', 'key', 'authorization', 'cookie'
];

function sanitizeForLogging(obj: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeForLogging(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
```

### 13.7 Full Checklist

| Category | Item | Status |
|---|---|---|
| **Dependencies** | All packages pinned to exact versions | ☐ |
| **Dependencies** | `npm audit` shows 0 critical/high | ☐ |
| **Dependencies** | Docker images pinned to SHA digests | ☐ |
| **Transport** | TLS 1.3 enforced (Caddy default) | ☐ |
| **Transport** | HSTS header with preload | ☐ |
| **Auth** | Passwords hashed with argon2id | ☐ |
| **Auth** | MFA enforced for all users | ☐ |
| **Auth** | JWT signed with RS256 | ☐ |
| **Auth** | Refresh token rotation implemented | ☐ |
| **Auth** | Brute force protection active | ☐ |
| **Auth** | Passwords checked against breached DB | ☐ |
| **Headers** | Helmet.js configured | ☐ |
| **Headers** | CSP in enforce mode | ☐ |
| **Headers** | X-Frame-Options: DENY | ☐ |
| **Headers** | X-Content-Type-Options: nosniff | ☐ |
| **Input** | All endpoints validated with Zod | ☐ |
| **Input** | File types validated via magic bytes | ☐ |
| **Input** | Max file size enforced | ☐ |
| **Database** | Parameterized queries only | ☐ |
| **Database** | Audit table is immutable | ☐ |
| **Database** | Separate DB roles (app, audit, readonly) | ☐ |
| **Storage** | Files encrypted with AES-256-GCM | ☐ |
| **Storage** | APFS volume encrypted | ☐ |
| **Storage** | FileVault on boot drive | ☐ |
| **Network** | No ports exposed except 443 + Tailscale | ☐ |
| **Network** | Internal services on localhost only | ☐ |
| **Network** | Rate limiting on all endpoints | ☐ |
| **Network** | CORS restricted to vault domain | ☐ |
| **Scanning** | ClamAV on all uploads | ☐ |
| **Scanning** | ClamAV signatures updated daily | ☐ |
| **Logging** | No secrets in log output | ☐ |
| **Logging** | Audit logs exported and backed up daily | ☐ |
| **Cookies** | httpOnly + Secure + SameSite=Strict | ☐ |
| **Cookies** | CSRF double-submit pattern | ☐ |
| **Backup** | Daily encrypted database backups | ☐ |
| **Backup** | Monthly backup restoration test | ☐ |
| **Backup** | Backup checksums verified | ☐ |

---

## Appendix A: NIST 800-171 Control Mapping

| Control Family | Control | KDT Vault Implementation |
|---|---|---|
| **3.1** Access Control | 3.1.1 Limit system access | RBAC + clearance-based access |
| | 3.1.2 Limit transactions/functions | Role permissions JSON |
| | 3.1.5 Least privilege | Default role is `viewer`, escalation requires admin |
| | 3.1.22 Control CUI on public systems | Classification levels prevent CUI exposure |
| **3.3** Audit | 3.3.1 Create audit records | Append-only audit_logs table |
| | 3.3.2 Unique trace to user | user_id + session_id on every log entry |
| | 3.3.4 Alert on audit failure | Health check monitors audit pipeline |
| **3.5** Identification & Auth | 3.5.1 Identify system users | Unique user accounts, no shared credentials |
| | 3.5.2 Authenticate users | Password + MFA (TOTP/WebAuthn) |
| | 3.5.3 Multi-factor auth | Required for all users |
| **3.8** Media Protection | 3.8.1 Protect CUI on media | APFS encryption + per-file AES-256-GCM |
| | 3.8.9 Protect backup CUI | GPG-encrypted backups |
| **3.12** Security Assessment | 3.12.1 Assess controls | Compliance dashboard + weekly audits |
| | 3.12.3 Monitor controls | Real-time alerts + health checks |
| **3.13** System & Comm Protection | 3.13.1 Monitor communications | TLS 1.3 + Tailscale encryption |
| | 3.13.8 CUI in transit | All traffic encrypted |
| **3.14** System & Info Integrity | 3.14.2 Malicious code protection | ClamAV scanning |
| | 3.14.6 Monitor system | Metrics collection + alerting |

---

## Appendix B: Quick Start for Developers

```bash
# 1. Clone and setup
git clone git@github.com:kdt/vault.git
cd vault

# 2. Copy environment template
cp .env.example .env
# Edit .env with generated passwords (openssl rand -base64 32)

# 3. Generate JWT key pair
mkdir -p secrets
openssl genrsa -out secrets/jwt-private.pem 2048
openssl rsa -in secrets/jwt-private.pem -pubout -out secrets/jwt-public.pem

# 4. Start services
docker compose up -d

# 5. Run migrations
docker exec kdt-app npx knex migrate:latest

# 6. Seed default data
docker exec kdt-app npx knex seed:run

# 7. Create admin user
docker exec kdt-app node scripts/create-admin.js \
    --email admin@kdt.com \
    --name "Admin" \
    --password "$(openssl rand -base64 24)"

# 8. Verify
curl -k https://localhost/health
```

---

*Document maintained by KDT Engineering. Last updated: April 2026.*
