# High-Level Plan: Migrate from Per-Org Stripe Keys to Stripe Connect

## 1. Remove Old “Per-Org Key” Approach

- Remove any UI and DB fields where organisations currently enter:
  - `stripe_pk`
  - `stripe_sk`
  - `stripe_webhook_secret`
- Remove logic that initialises Stripe using *org-specific* secret keys.
- Standardise Stripe initialisation to a **single platform secret**:
  - `process.env.STRIPE_PLATFORM_SECRET_KEY`

---

## 2. Add Stripe Connect Fields in Supabase

In the `organisations` table, add:

- `stripe_account_id text`  
- (optional) `stripe_charges_enabled boolean`  
- (optional) `stripe_details_submitted boolean`

These are populated after a successful Stripe Connect OAuth flow.

---

## 3. Implement “Connect with Stripe” OAuth Flow

### 3.1. Create `/api/stripe/connect` route

- Generates a redirect URL to Stripe’s OAuth:
  - Uses `STRIPE_CONNECT_CLIENT_ID`
  - `scope=read_write`
  - `response_type=code`
  - `redirect_uri` → your callback endpoint (e.g. `/api/stripe/callback`)
- Redirects the logged-in org admin to:

  `https://connect.stripe.com/oauth/authorize?...`

### 3.2. Create `/api/stripe/callback` route

- Receives `code` from Stripe.
- Calls `stripe.oauth.token({ grant_type: 'authorization_code', code })`.
- Extracts `stripe_user_id` (e.g. `acct_123...`).
- Saves `stripe_account_id = stripe_user_id` into the organisation record in Supabase.
- Optionally store `stripe_charges_enabled` / `stripe_details_submitted` from the response.

---

## 4. Update Payment Creation Logic to Use `stripeAccount`

- Locate all places where Checkout Sessions (or PaymentIntents) are created.
- Replace any org-specific secret usage with:

  ```ts
  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      line_items: [...],
      success_url: ...,
      cancel_url: ...,
      metadata: { org_id, ... }
    },
    {
      stripeAccount: org.stripe_account_id, // key change
    }
  );