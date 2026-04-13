
## Security Scan Summary

I performed a full security scan using the available tools. Here's the summary:

### Secrets Scanning (Gitleaks)
- **Status**: Completed
- **Findings**: No secrets or sensitive data leaks detected
- **Note**: Not a git repository, so only scanned files (no commit history)

### Static Application Security Testing (Semgrep)
- **Status**: Failed
- **Error**: Unicode encoding error ('charmap' codec can't encode character)
- **Recommendation**: Fix encoding issues in source files or run with different locale

### Vulnerability Scanning (Grype)
- **Status**: Completed (output truncated)
- **Findings**: Scanned 1,996 packages
- **Note**: Output was cut off, but likely found vulnerabilities in dependencies (large output suggests issues)

### Infrastructure as Code Scanning (Checkov)
- **Status**: Completed
- **Findings**: 
  - **1 FAILED check**: CKV_DOCKER_3 - Container runs as root user (security risk)
    - File: Dockerfile
    - Recommendation: Create and use a non-root user

### Dockerfile Linting (Hadolint)
- **Status**: Completed
- **Findings**:
  - **1 WARNING**: DL3007 - Using 'latest' tag instead of pinned version
    - File: Dockerfile
    - Recommendation: Pin to specific version (e.g., `node:18-alpine`)

### Overall Assessment
- **Critical Issues**: 1 (running containers as root)
- **Warnings**: 1 (unpinned base image)
- **Recommendations**:
  1. Fix the root user issue in product service Dockerfile
  2. Pin base image versions to prevent unexpected updates
  3. Resolve Semgrep encoding issues for complete SAST coverage
  4. Review Grype output for dependency vulnerabilities

The scan identified some security concerns, particularly around container security best practices. Consider addressing these issues before deployment.

---

## After-Fix Status (2026-04-13)

Applied fixes driven by the Opsera security agent findings:

### Dockerfile hardening — [Dockerfile](../../Dockerfile)
| Finding | Before | After |
|---|---|---|
| **CKV_DOCKER_3** — container runs as root | FAIL (no USER) | FIXED — `USER 1000:1000` added |
| **DL3007** — using `:latest` tag | WARN — `stripe/stripe-cli:latest` | FIXED — pinned to `stripe/stripe-cli:v1.21.8` |

### Build verification
`docker build -t ecart-stripe:hardened .` succeeds against the new Dockerfile (image manifest `sha256:0f285b21d563…`).

### New finding surfaced during the rebuild
- **SecretsUsedInArgOrEnv** (buildkit warning, line 8): `ENV STRIPE_API_KEY=""` defines a placeholder for a secret in the image metadata. The empty default is benign, but downstream operators should always override via `docker run --env-file` / docker-compose `env_file:` rather than baking the key into an image layer. Documented; no code change needed since the default is empty.

### Still outstanding
- Compliance + SQL Opsera agents not yet run.

---

## Re-run #2 (2026-04-13) — Semgrep + Grype with full output

### Semgrep (re-run with `PYTHONIOENCODING=utf-8`, `PYTHONUTF8=1`)
- **Status**: ✅ Completed (no encoding crash). Raw JSON: [semgrep.json](semgrep.json)
- **Configs**: `p/default`, `p/javascript`, `p/nodejs`, `p/owasp-top-ten`
- **Coverage**: 1,129 community rules, 260 applied to 140 git-tracked files
- **Findings**: **18 total** — 7 ERROR · 4 WARNING · 7 INFO

| Severity | Rule | Location | Count |
|---|---|---|---|
| ERROR | `dockerfile.security.missing-user.missing-user` | gateway, auth, user, product, cart-order, payment, frontend Dockerfiles | **7** |
| WARNING | `javascript.express.security.audit.express-path-join-resolve-traversal` | `backend/services/product/controllers/productController.js:195` | 1 |
| WARNING | `javascript.lang.security.audit.path-traversal.path-join-resolve-traversal` | same line as above | 1 |
| WARNING | `yaml.docker-compose.security.no-new-privileges.no-new-privileges` | `docker-compose.yml` (mongodb service) | 1 |
| WARNING | `yaml.docker-compose.security.writable-filesystem-service.writable-filesystem-service` | `docker-compose.yml` (mongodb service) | 1 |
| INFO | `javascript.express.security.audit.express-check-csurf-middleware-usage` | all 6 express servers (no CSRF middleware) | 6 |
| INFO | `javascript.lang.security.audit.unsafe-formatstring` | `backend/services/cart-order/controllers/orderController.js:232` | 1 |

### Grype (re-run, no truncation)
- **Status**: ✅ Completed. Raw outputs: [grype.txt](grype.txt) · [grype.json](grype.json)
- **Findings**: **50 vulnerabilities** across npm dependencies (frontend + 6 backend services)

| Severity | Count | Notable packages |
|---|---|---|
| **Critical** | 2 | `axios@1.13.2` → fixed in 1.15.0 (GHSA-fvcv-3m26-pcqx, GHSA-3p68-rc4w-qgx5) |
| **High** | 28 | `multer`, `node-forge`, `lodash`, `minimatch`, `path-to-regexp`, `flatted`, `serialize-javascript`, `nth-check`, `jsonpath`, `svgo`, `underscore`, `picomatch`, `rollup` |
| **Medium** | 18 | `webpack-dev-server`, `postcss`, `yaml`, `ajv`, `brace-expansion` |
| **Low** | 2 | `qs`, `@tootallnate/once` |

---

## Re-run #2 — Fixes Applied

### 1. Dockerfile `missing-user` — fixed in all 7 service Dockerfiles
Added `USER node` (uid 1000, provided by the `node:18-alpine` base image) before each `CMD`:
- [backend/gateway/Dockerfile](../../backend/gateway/Dockerfile)
- [backend/services/auth/Dockerfile](../../backend/services/auth/Dockerfile)
- [backend/services/user/Dockerfile](../../backend/services/user/Dockerfile)
- [backend/services/product/Dockerfile](../../backend/services/product/Dockerfile)
- [backend/services/cart-order/Dockerfile](../../backend/services/cart-order/Dockerfile)
- [backend/services/payment/Dockerfile](../../backend/services/payment/Dockerfile)
- [frontend/Dockerfile](../../frontend/Dockerfile)

### 2. Path traversal in product controller — fixed
[backend/services/product/controllers/productController.js:195](../../backend/services/product/controllers/productController.js#L195) — the old-image deletion path now resolves against the `uploads/` root and asserts containment with `path.resolve` + `startsWith` before calling `fs.unlinkSync`. Defends against a tampered `product.imageUrl` containing `../` segments.

### 3. Critical axios CVE — bumped across all 8 manifests
`axios ^1.6.5` (resolving to 1.13.2) → `axios ^1.15.0` in:
- `frontend/package.json`
- `backend/gateway/package.json`
- `backend/shared/package.json`
- `backend/services/{auth,user,product,cart-order,payment}/package.json`

Run `npm install` in each to refresh the lockfiles before deploy.

### After-fix delta
| Category | Before | After |
|---|---|---|
| Semgrep ERROR (missing-user) | 7 | **0** (expected on re-scan) |
| Semgrep WARNING (path-traversal in product) | 2 | **0** (expected on re-scan) |
| Grype Critical (axios) | 2 | **0** (after `npm install`) |
| Checkov FAIL + Hadolint DL3007 (root Dockerfile) | 1 + 1 | **0 + 0** |

### Tracked but not fixed in this pass (intentional — out of MVP scope)
- 6× missing CSRF middleware (INFO) — these are token-auth REST APIs behind a gateway; CSRF is mitigated by the JWT-in-Authorization-header pattern. Documented as accepted risk.
- `unsafe-formatstring` in orderController.js:232 — needs review of the format-string source before patching.
- `no-new-privileges` + `writable-filesystem-service` on the mongodb compose service — recommended hardening for prod compose, deferred.
- ~46 remaining Medium/High npm CVEs in transitive deps (mostly under `react-scripts` and `multer 1.x`) — tracked for follow-up; bumping `multer` to 2.x is the next high-impact change but is a breaking API upgrade.
