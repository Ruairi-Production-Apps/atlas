# API Standardization Review

## Implemented Changes

### 1. Standardized Error Handling
- **Status:** Implemented.
- **Details:** Created `src/lib/api-utils.ts` which exports `handleApiError`, `unauthorizedResponse`, `forbiddenResponse`, and `notFoundResponse`.
- **Format:** 
  ```json
  {
    "error": "Message",
    "code": "ERROR_CODE",
    "details": { ... } // Optional
  }
  ```

### 2. Request Validation
- **Status:** Implemented.
- **Details:** Created `src/lib/schemas.ts` and defined `EventSchema` and `ImpersonateSchema`.
- **Usage:** Routes now use `Schema.parse(body)` and wrap logic in try-catch blocks that delegate to `handleApiError`.

### 3. Refactored Routes
- **Event Creation:** `src/app/api/organizations/[type]/[id]/events/route.ts` now uses Zod validation for all input fields (including parsing dates, numbers, and enums).
- **Impersonation:** `src/app/api/admin/impersonate/route.ts` now uses Zod validation for `target_user_id` uuid format.

## Outcomes
- **Consistency:** Error responses from these routes now follow a strict structure.
- **Safety:** Inputs are validated before use, reducing runtime errors (e.g. `cannot read properties of undefined`).
- **Maintainability:** Validation logic is separated from business logic.

## Next Steps
- Apply this pattern to the remaining API routes incrementally.
- Monitor for any frontend regressions where components might be expecting non-standard error structures (though standard `error` property was preserved).
