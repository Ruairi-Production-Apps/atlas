# Security Improvements Plan

## Objective
Enhance application security by implementing rate limiting, explicit session management, and secure impersonation.

## Proposed Changes

### 1. Rate Limiting
**Location:** `src/middleware.ts`
**Implementation:**
- Implement a `RateLimiter` using a sliding window algorithm.
- Apply to `/auth/*` and `/api/auth/*` routes to prevent brute force attacks.
- Use an in-memory fallback if Redis is not available, but structure it for easy Upstash integration.

### 2. Session Management
**Location:** `src/middleware.ts`, `src/lib/auth-utils.ts`
**Implementation:**
- Enforce an absolute session timeout (e.g., 24 hours) enforced by the application, regardless of the Supabase token validity.
- Add a `last_active` timestamp cookie to track inactivity (e.g., logout after 30 mins of inactivity).

### 3. Impersonation Security
**Location:** `src/app/api/admin/impersonate/route.ts`, `src/lib/supabase/server-impersonate.ts`
**Implementation:**
- Replace plain `impersonitate_user_id` cookie with a signed JWT.
- Use `jose` library for signing and verification.
- Include `admin_id`, `target_id`, and `exp` claims in the JWT.

## Dependencies
- `jose` for JWT operations.

## Risks
- **Rate Limiting:** In-memory limiting in serverless is not shared across instances. It provides "some" protection but not "strict" global protection without Redis.
- **Session Management:** Aggressive timeouts might annoy users. We will set reasonable defaults (e.g., 7 days absolute, 12 hours inactivity).
