# PRODUCT REQUIREMENT DOCUMENT: Youth Member Registration & Payment System

## SYSTEM OVERVIEW
Atlas Hub requires a registration and payment management system for Scout Groups to collect youth member registrations and process membership fees from parents/guardians. This is a mission-critical feature that Groups use annually.

---

## USER ROLES

**Group Leader (GL):** Administrator who configures registration, manages payments, and views member data

**Parent/Guardian:** End user who completes registration forms and makes payments for their youth members

---

## CORE FEATURES

### 1. REGISTRATION SETUP (Group Leader)

#### 1.1 Introduction & Pricing Configuration

**Intro Text:**
- Rich text editor for welcome message displayed to parents at registration start

**Fee Structure:**
- GL creates one or more line items to compose total fee
- Each line item has:
  - Short plain text description
  - Euro amount (decimal allowed)
- Purpose: Distinguish between Group fee and Scouting Ireland fee

**Multi-Child Discounts:**
- Optional feature GL can enable
- For 2+ youth members registered in same transaction:
  - GL sets discount per additional youth member
  - Discount can be:
    - Fixed euro amount
    - Percentage
  - GL configures discount separately for each line item (Group fee vs SI fee)
- Discount applies per registration event only (not retroactive to existing members)

**Stripe Fee Display:**
- Show GL estimated net income after Stripe fees (Ireland rates)

#### 1.2 Payment Methods Configuration

GL selects one or more payment methods to enable for parents:

**Option 1: Weekly Payments**
- GL sets: Start date, End date
- System calculates weekly payment amount
- GL chooses: Add rounding to final payment OR distribute across all payments
- GL sets: Auto-recurring via Stripe OR manual parent-initiated payments
- Missed payment handling - GL configures:
  - Continue with regular payment amount (missed payments accumulate as arrears)
  - OR spread missed payments across remaining schedule
- Parents can make full or partial payment toward outstanding balance anytime

**Option 2: Monthly Payments**
- Same configuration options as weekly payments
- GL sets: Start date, End date
- System calculates monthly payment amount
- GL chooses: Add rounding to final payment OR distribute across all payments
- GL sets: Auto-recurring via Stripe OR manual parent-initiated payments
- Missed payment handling - GL configures:
  - Continue with regular payment amount (missed payments accumulate as arrears)
  - OR spread missed payments across remaining schedule
- Parents can make full or partial payment toward outstanding balance anytime

**Option 3: Tiered Payment**
- GL sets: Initial payment amount (due at registration)
- GL sets: Date for final balance payment
- Parents can make full or partial payment toward outstanding balance anytime

**Payment Method Switching:**
- Parents can switch between any enabled payment methods mid-term
- System recalculates remaining balance and new schedule

#### 1.3 Section Selection

GL selects which sections are accepting registrations:
- Beavers
- Cubs
- Scouts
- Ventures

(These populate the Section dropdown in youth member repeater field)

#### 1.4 Registration Deadline

- GL can set registration deadline
- System auto-closes registration at deadline

---

### 2. REGISTRATION FORM BUILDER (Group Leader)

GL uses existing Atlas Hub multi-form builder to create registration intake form.

**Form Creation Options:**
1. Start from scratch
2. Start from default template (see below)
3. Start from previous year's form

#### 2.1 Default Template Structure

**SECTION: Parent/Guardian 1**
- Text input: First Name* (required)
- Text input: Last Name* (required)
- Email input: Email* (required)
- Phone input: Phone* (required)
- Field Group: Address
  - Text input: Address Line 1* (required)
  - Text input: Address Line 2 (optional)
  - Select input: County* (required) - populated with all Irish counties
  - Text input: Eircode* (required)

**SECTION: Parent/Guardian 2**
- Text input: First Name (optional)
- Text input: Last Name (optional)
- Email input: Email (optional)
- Phone input: Phone (optional)
- Field Group: Address
  - Text input: Address Line 1 (optional)
  - Text input: Address Line 2 (optional)
  - Select input: County (optional) - populated with all Irish counties
  - Text input: Eircode (optional)

*Note: All Parent/Guardian 2 fields are optional and may be left blank*

**SECTION: Youth Members**
- Repeater field (allows adding multiple youth members)
- For each youth member:
  - Text input: First Name* (required)
  - Text input: Last Name* (required)
  - Date select: Date of Birth* (required)
  - Select input: Section* (required) - populated from sections enabled in setup

**SECTION: Consent**

*Input Group: WhatsApp Consent*
- Label: "WhatsApp Consent"
- Description: "We/I hereby give permission for my/our name and mobile number to be added to my/our child's scouts section WhatsApp group for communication purposes. Please tick the box of parent/Guardian whom you wish to be added to the WhatsApp group (may be both)."
- Checkbox: Parent/Guardian 1 Yes
- Checkbox: Parent/Guardian 2 Yes
- Checkbox: I/We do not Consent

*Input Group: Photography Consent*
- Label: "Photography Consent"
- Description: "Our Group post photos of events/activities in the Section WhatsApp group to keep parents/guardians up to date and engaged. We also post photos up on our Social media accounts in order to promote our group within our community. Please select below if you consent to photos of your children being used in this manner"
- Checkbox: Parent/Guardian 1 Yes
- Checkbox: Parent/Guardian 2 Yes
- Checkbox: I/We do not Consent

**SECTION: Volunteering**

*Input Group: Can you help us?*
- Label: "Can you help us?"
- Description: "Please tick which area you can help out with any of below."
- Checkbox: Become a Scouter
- Checkbox: Help out with fundraising activities
- Checkbox: Other

*Input Group: Skills*
- Label: "Skills"
- Description: "Do you have any specialised skills/knowledge that you could share with the scouting group? If so, please specify:"
- Multi-line text input: Skills

**SECTION: Code of Conduct**

*Input Group: Code of Conduct Consent*
- Label: "Code of Conduct Consent"
- Description: "I/We confirm that I/We have read the Code of Conduct and I/We are committing to and agreeing with the content. Any breach in this code of conduct will be dealt with appropriately and in accordance with the Scouting Ireland complaints and disciplinary process."
- Checkbox: I/We accept the Code of Conduct* (required)

**SECTION: Payment**
- Stripe payment field
- Payment amount calculated based on:
  - Number of youth members being registered
  - Multi-child discount rules (if applicable)
  - Selected payment method (if multiple enabled, parent chooses)
  - For tiered payment: Initial payment amount only

---

### 3. PARENT REGISTRATION FLOW

#### 3.1 Form Completion & Draft Saving

**Navigation:**
- Standard Back/Continue buttons for multi-page form navigation
- "Save" button available on every page
- Parents can save draft and return later via unique link

**Payment Handling:**
- For tiered payment: Initial payment processed during registration
- If payment fails:
  - Form data is saved but not submitted
  - Error message displayed
  - Parent can retry payment

**Automatic Notifications:**
- Payment confirmation emails sent to parents automatically
- Payment receipts generated for each transaction

#### 3.2 Parent Dashboard

Parents can access dashboard to view:
- Their completed form submission
- Payment history (all transactions)
- Current outstanding balance
- Option to make payment toward balance

---

### 4. GROUP LEADER MANAGEMENT INTERFACES

#### 4.1 Members Dashboard

GL views list of all registrants with:
- Form submission data for each family
- List of payments made
- Outstanding balance
- Payment schedule status

#### 4.2 Manual Payment Adjustments

GL can manually adjust outstanding balance for any family:
- Record cash/cheque payments received outside Stripe
- Adjustments deducted from parent's outstanding balance
- Note field to document reason for adjustment

#### 4.3 Payment History

- View payment history per family across multiple years
- Filter and search capabilities

---

### 5. AUTOMATED REMINDERS (Group Leader)

#### 5.1 Reminder Configuration

GL creates reminder emails with:

**Basic Settings:**
- Subject line (supports template tags)
- Rich text body (supports template tags)
- Send to:
  - Parent/Guardian 1 only
  - Both Parent/Guardians (if both emails on file)

**Frequency Rules:**
GL can set either:
1. **Blanket frequency:** Single frequency throughout year
2. **Time-based frequency:** Different frequencies per time period

**Time-Based Example:**
- Every month between 1st Jan and 31st March
- Every 2 weeks between 1st April and 31st June
- System validates no gaps exist between periods

**Template Tags Available:**
Display these tags to GL on reminder configuration page:
- `{parent/guardian 1 first name}`
- `{parent/guardian 2 first name}`
- `{outstanding balance}`

#### 5.2 Reminder Management

GL can view list of all reminders showing:
- Subject line
- Number of emails sent
- Start/end dates (if time-based)
- Current status (active/paused)

Actions available:
- Edit reminder
- Pause/Resume reminder
- Delete reminder

---

### 6. CSV IMPORT FEATURE (Special Case for Existing Groups)

**Use Case:** Some Groups have already collected initial payments via external systems (e.g., WordPress) before migrating to Atlas Hub.

**Import Process:**
1. GL uploads CSV file containing:
   - Parent/guardian details
   - Youth member details
   - Initial payment amount and date
   
2. System creates:
   - Registration records for each family
   - Payment history entries for initial payment
   - Outstanding balance calculated (total fee minus initial payment)

3. GL then configures remaining payment schedule using standard setup options

**CSV Required Fields:**
*(Define specific column names and format during implementation)*

---

## TECHNICAL CONSIDERATIONS

### Payment Processing
- Use Stripe Ireland fee structure for calculations
- Support recurring payment setup via Stripe subscriptions (for auto-recurring options)
- Handle webhook events for payment success/failure

### Data Storage
- Registration forms stored per-family
- Payment records linked to family/registration
- Payment schedule stored separately and recalculated on changes
- Multi-year payment history maintained

### Form State Management
- Save draft functionality requires unique resumption link
- Link sent via email to parent
- Draft expires after [define timeframe]

### Validation Rules
- Required fields enforced on form submission
- Email format validation
- Date format validation for DOB and payment dates
- Payment amount calculations verified server-side

---

## OUT OF SCOPE FOR V1

The following features are explicitly NOT included in version 1:

- Age validation against sections
- Duplicate child detection
- Email verification for parent contacts
- Early payment discounts
- Late payment fees
- Grace periods
- Export functionality for payment data for accounting
- Reconciliation reports (expected vs actual income)
- Automated refund handling (handled manually by GL)
- Automated handling of mid-term child additions (handled manually by GL)

---

## SUCCESS CRITERIA

V1 is successful when:
1. Group Leaders can configure registration with flexible payment options in under 30 minutes
2. Parents can complete registration and make initial payment with <5% payment failure rate
3. Parents can successfully save drafts and resume registration
4. GL can view complete payment status for all families
5. Automated reminders send successfully based on configured schedules
6. CSV import successfully creates registration and payment records for existing Groups

---

## NEXT STEPS AFTER V1 LAUNCH

1. Deploy to 2-3 pilot Groups
2. Gather feedback on:
   - Configuration complexity
   - Parent user experience
   - Missing critical features
   - Pain points in daily use
3. Iterate based on real-world usage

---

**Document Version:** 1.0  
**Date:** 7th February 2026  
**Author:** Ruairi