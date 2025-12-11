# API Standardization Plan

## Objective
Address code review feedback regarding inconsistent error responses and lack of request validation in API routes.

## Proposed Changes

### 1. Standardized Error Handling
**Location:** `src/lib/api-utils.ts`
**Implementation:**
- Create a `handleApiError(error: unknown)` function.
- It will return a `NextResponse` with appropriate status code and JSON body.
- Standard Error Body:
  ```json
  {
    "error": "Human readable message",
    "code": "OPTIONAL_ERROR_CODE",
    "details": "Optional validation details"
  }
  ```

### 2. Request Validation (Zod)
**Location:** `src/lib/validators.ts` (new file) or collinear with routes.
**Implementation:**
- Define Zod schemas for complex inputs (e.g., `EventSchema`, `ImpersonateSchema`).
- Use `parse` or `safeParse` in API routes.
- Return 400 Bad Request if validation fails, with Zod error messages in `details`.

### 3. Refactoring Targets
I will refactor the following key routes to demonstrate and enforce the pattern:
- `src/app/api/organizations/[type]/[id]/events/route.ts` (Complex POST)
- `src/app/api/admin/impersonate/route.ts` (Simple POST)

## Risks
- Changing response formats might break frontend components that rely on specific error shapes (e.g., checking `err.message` vs `err.error`).
- **Mitigation:** I will ensure the top-level `error` property is a string message, which is the most common pattern currently used, adding `details` for extra info.

## Dependencies
- `zod` (Already installed).
