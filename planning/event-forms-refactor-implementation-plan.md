# Event Forms Payment Refactor - Implementation Plan

## Overview
Refactor the Events system to move payment logic from the Event level to the Form level, introducing a tabbed form builder with dedicated sections for Settings, Payments, and Confirmations.

---

## Current State Analysis

### Existing Structure:
- **Events Table**: Contains `require_payment`, `pricing_mode`, `price_youth`, `price_scouter`, `price`
- **Event Forms Table**: Basic form metadata (title, description, published)
- **Form Fields Table**: Field definitions with drag-and-drop ordering
- **Form Builder**: Single-page field editor at `/scouter/organizations/[id]/events/[eventId]/forms/[formId]/builder`

### Problems with Current Approach:
1. Payment settings tied to Event, not Form
2. Cannot have different pricing for multiple registration forms
3. No clear separation of concerns
4. Limited flexibility for future features (deposits, installments)

---

## Implementation Phases

### **Phase 1: Database Schema Updates** 🗄️

#### 1.1 Update `event_forms` Table
Add payment-related columns to event_forms:

```sql
ALTER TABLE event_forms ADD COLUMN IF NOT EXISTS require_payment BOOLEAN DEFAULT FALSE;
ALTER TABLE event_forms ADD COLUMN IF NOT EXISTS pricing_model TEXT DEFAULT 'per_youth';
ALTER TABLE event_forms ADD COLUMN IF NOT EXISTS price_youth DECIMAL(10, 2);
ALTER TABLE event_forms ADD COLUMN IF NOT EXISTS price_scouter DECIMAL(10, 2);
ALTER TABLE event_forms ADD COLUMN IF NOT EXISTS price_group DECIMAL(10, 2);
ALTER TABLE event_forms ADD COLUMN IF NOT EXISTS price_fixed DECIMAL(10, 2);
ALTER TABLE event_forms ADD COLUMN IF NOT EXISTS payment_notes TEXT;
ALTER TABLE event_forms ADD COLUMN IF NOT EXISTS button_text TEXT DEFAULT 'Submit';

-- Settings
ALTER TABLE event_forms ADD COLUMN IF NOT EXISTS capacity_override INTEGER;
ALTER TABLE event_forms ADD COLUMN IF NOT EXISTS visibility_override TEXT;

-- Confirmations
ALTER TABLE event_forms ADD COLUMN IF NOT EXISTS confirmation_message TEXT;
ALTER TABLE event_forms ADD COLUMN IF NOT EXISTS send_confirmation_email BOOLEAN DEFAULT TRUE;
ALTER TABLE event_forms ADD COLUMN IF NOT EXISTS send_admin_notification BOOLEAN DEFAULT TRUE;
ALTER TABLE event_forms ADD COLUMN IF NOT EXISTS redirect_url TEXT;
```

#### 1.2 Create `event_key_contacts` Table (for Key Contact feature)
```sql
CREATE TABLE event_key_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id)
);
```

#### 1.3 Keep Event-Level Payment Fields (for backward compatibility)
Mark as deprecated but maintain for migration:
- `require_payment`
- `pricing_mode`
- `price_youth`
- `price_scouter`
- `price`

---

### **Phase 2: Form Builder UI Restructuring** 🎨

#### 2.1 Convert to Tabbed Interface
**Component**: `/src/components/admin/form-builder.tsx`

Transform from single-page to 4-tab layout:
1. **Fields Tab** (existing drag-and-drop)
2. **Settings Tab** (new)
3. **Payments Tab** (new)
4. **Confirmations Tab** (new)

Use ShadCN `Tabs` component for navigation.

#### 2.2 Fields Tab (Minimal Changes)
- Keep existing drag-and-drop field builder
- Keep existing field types
- No changes to field editing logic

#### 2.3 Settings Tab (New Component)
**Location**: `/src/components/admin/form-builder-settings.tsx`

**Fields:**
- Form Title (text input)
- Form Description (textarea)
- Submit Button Text (text input)
- Capacity Override (optional number)
- Visibility Override (optional select)
- Published Toggle

#### 2.4 Payments Tab (New Component)
**Location**: `/src/components/admin/form-builder-payments.tsx`

**Sections:**

**1. Payment Enablement**
- Toggle: "Require payment to submit this form"

**2. Pricing Model** (conditional on payment enabled)
- Radio buttons:
  - Per Youth Member
  - Per Scouter  
  - Per Participant (mixed - both youth & scouter)
  - Per Group (flat fee)
  - Fixed Price (single amount)
  - Free (explicit zero)

**3. Pricing Fields** (conditional based on model)
- Youth Price (€) - show if per_youth or per_participant
- Scouter Price (€) - show if per_scouter or per_participant
- Group Price (€) - show if per_group
- Fixed Price (€) - show if fixed_price
- Admin Notes (textarea, optional)

**4. Stripe Connection Warning**
- Check if organization has `stripe_account_id`
- Show warning if not connected
- Link to connect Stripe

**5. Payment Preview**
- Calculate example pricing
- Show Atlas fee breakdown
- Show net amount to organization

#### 2.5 Confirmations Tab (New Component)
**Location**: `/src/components/admin/form-builder-confirmations.tsx`

**Fields:**
- Confirmation Message (rich text)
- Send Confirmation Email (toggle)
- Send Admin Notification (toggle)
- Redirect URL (optional text input, validated URL)

---

### **Phase 3: Event Key Contact Feature** 👤

#### 3.1 Add Key Contact Selector to Event Form
**Component**: Event creation/edit form

**UI Elements:**
- Dropdown to select from organization members with admin/scouter role
- "Set as Key Contact" toggle
- Display current key contact if set

#### 3.2 Display Key Contact on Event Detail Page
**Component**: `/src/app/events/[slug]/page.tsx`

**Section:** "Event Organiser Info"
- Key Contact name
- Role/position (if available)
- Contact button (opens email/message)
- Avatar image

---

### **Phase 4: API Routes** 🔌

#### 4.1 Update Form Settings API
**Route**: `/api/organizations/[type]/[id]/events/[eventId]/forms/[formId]/settings`

**Methods:**
- `GET` - Fetch all form settings (fields, settings, payments, confirmations)
- `PATCH` - Update specific tab data

#### 4.2 Create Key Contact API
**Route**: `/api/events/[eventId]/key-contact`

**Methods:**
- `GET` - Fetch current key contact
- `POST` - Set key contact
- `DELETE` - Remove key contact

#### 4.3 Stripe Connection Check API
**Route**: `/api/organizations/[type]/[id]/stripe-status`

**Method:**
- `GET` - Return Stripe connection status

---

### **Phase 5: Data Migration** 🔄

#### 5.1 Migration Script
Create migration to move existing event-level payment data to default form:

```sql
-- For each event with require_payment = true
-- Copy payment settings to the first/default form

UPDATE event_forms ef
SET 
    require_payment = e.require_payment,
    pricing_model = e.pricing_mode,
    price_youth = e.price_youth,
    price_scouter = e.price_scouter,
    price_group = e.price,
    price_fixed = e.price
FROM events e
WHERE ef.event_id = e.id
AND e.require_payment = true;
```

#### 5.2 Backward Compatibility
- Keep event-level fields for read-only reference
- Display deprecation notice in admin UI
- Guide users to update forms

---

### **Phase 6: Frontend Form Submission** 📝

#### 6.1 Update Form Submission Flow
**Component**: Public form submission page

**Steps:**
1. Validate all form fields
2. Check if payment required
3. If payment required:
   - Calculate total based on pricing model
   - Create Stripe Payment Intent
   - Redirect to Stripe Checkout
4. Handle Stripe webhook for payment confirmation
5. Store submission data
6. Send confirmations (email/redirect)

#### 6.2 Stripe Integration
- Use organization's `stripe_account_id` (Stripe Connect)
- Calculate Atlas platform fee
- Pass metadata (event, form, submission)

---

## File Structure

```
src/
├── components/
│   └── admin/
│       ├── form-builder.tsx (MODIFY - add tabs)
│       ├── form-builder-settings.tsx (NEW)
│       ├── form-builder-payments.tsx (NEW)
│       ├── form-builder-confirmations.tsx (NEW)
│       └── event-key-contact-selector.tsx (NEW)
├── app/
│   ├── api/
│   │   ├── organizations/[type]/[id]/events/[eventId]/forms/[formId]/
│   │   │   └── settings/
│   │   │       └── route.ts (NEW/MODIFY)
│   │   ├── events/[eventId]/
│   │   │   └── key-contact/
│   │   │       └── route.ts (NEW)
│   │   └── organizations/[type]/[id]/
│   │       └── stripe-status/
│   │           └── route.ts (NEW)
│   └── events/[slug]/
│       └── page.tsx (MODIFY - add key contact display)
└── lib/
    └── stripe/
        ├── form-payment-intent.ts (NEW)
        └── payment-helpers.ts (NEW)

supabase/
└── migrations/
    ├── add_form_payment_fields.sql (NEW)
    ├── add_key_contacts.sql (NEW)
    └── migrate_event_payments_to_forms.sql (NEW)
```

---

## Implementation Order

### **Sprint 1: Database & Settings Tab**
1. Create database migration for form payment fields
2. Create form-builder-settings component
3. Update form-builder.tsx to use tabs
4. Implement Settings tab UI
5. Create/update settings API route
6. Test settings save/load

### **Sprint 2: Payments Tab**
1. Create form-builder-payments component
2. Implement pricing model selector
3. Add conditional price input fields
4. Add Stripe connection check
5. Add payment preview/calculator
6. Test payment configuration

### **Sprint 3: Confirmations Tab & Key Contact**
1. Create form-builder-confirmations component
2. Implement confirmation settings UI
3. Create event_key_contacts table
4. Create event-key-contact-selector component
5. Add key contact to event form
6. Display key contact on event detail page
7. Create key contact API routes

### **Sprint 4: Data Migration & Testing**
1. Write data migration script
2. Run migration on development database
3. Test backward compatibility
4. Update documentation
5. Integration testing

### **Sprint 5: Frontend Submission & Stripe**
1. Update form submission flow
2. Implement Stripe Payment Intent creation
3. Add Stripe Checkout integration
4. Handle payment webhooks
5. Send confirmation emails
6. End-to-end testing

---

## Success Criteria

- [ ] Form builder has 4 clear tabs
- [ ] Each tab saves independently
- [ ] Payment settings are per-form, not per-event
- [ ] Multiple forms can have different pricing
- [ ] Stripe connection is validated before payment enabled
- [ ] Event key contact can be selected and displayed
- [ ] Existing events migrated without data loss
- [ ] Form submission respects new payment logic
- [ ] Confirmation emails and redirects work
- [ ] Documentation updated

---

## Risks & Mitigation

**Risk**: Breaking existing events with payment
**Mitigation**: Keep event-level fields, run migration carefully, test thoroughly

**Risk**: Stripe integration complexity
**Mitigation**: Use existing Stripe Connect setup, leverage webhooks properly

**Risk**: UI becoming too complex
**Mitigation**: Keep tabs simple, hide irrelevant fields, provide good defaults

---

## Testing Plan

### Unit Tests:
- Payment calculation logic
- Pricing model selection
- Stripe connection validation

### Integration Tests:
- Form settings save/load
- Payment intent creation
- Webhook processing
- Email sending

### E2E Tests:
- Create event with paid form
- Submit form with payment
- Verify payment and confirmation
- Check admin notifications

---

**Estimated Time**: 3-4 weeks (depending on team size and Stripe complexity)

**Priority**: High (core revenue feature)

**Dependencies**: Stripe Connect already implemented ✅
