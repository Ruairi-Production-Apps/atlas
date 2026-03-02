# Events System Update

PRD: Event Registration & Forms – Payments Refactor

Product

Atlas (Scout Hub 2026)

Area

Events → Event Forms → Payments & Registration

Problem Statement

Event payment logic currently lives at the Event level, tightly coupled to event configuration. This limits flexibility and makes it harder to support:
	•	Multiple registration flows per event
	•	Different pricing strategies per form
	•	Future extensions (donations, add-ons, deposits, split payments)

Scouters think in terms of “this form takes payment”, not “this event takes payment”.

Goal

Move payment logic from the Event to the Form, while keeping the Event as the canonical source of scheduling, visibility, and capacity.

This enables:
	•	Google Forms–level flexibility
	•	Scouting-specific pricing models
	•	Clearer mental model for organizers
	•	Easier future extensions

⸻

High-Level Design Decision

Payments belong to Forms, not Events
	•	An Event can have multiple Forms
	•	Each Form independently decides:
	•	whether payment is required
	•	how pricing works
	•	how much to charge
	•	Events without forms remain valid (informational events)

⸻

Form Builder Structure (New)

Each Event Form is split into four tabs:

1. Fields
	•	Existing drag-and-drop field builder
	•	No changes required
	•	Includes Participants, Group, Section-aware inputs, etc.

2. Settings

Form-level configuration:
	•	Form title & description
	•	Submit button text
	•	Capacity overrides (optional)
	•	Visibility overrides (optional)
	•	Confirmation behaviour (redirect vs message)

3. Payments

New dedicated tab for all payment logic.

Payment Enablement
	•	Toggle: “Require payment to submit this form”

Pricing Model
	•	Per Youth Member
	•	Per Scouter
	•	Per Participant (mixed)
	•	Per Group (flat fee)
	•	Fixed Price (single amount)
	•	Free (explicit)

Pricing Fields
	•	Youth price (€)
	•	Scouter price (€)
	•	Group price (€)
	•	Optional admin notes (not public)

Payment Options (Future-proof)
	•	Full payment
	•	Split payments (e.g. 2–3 instalments)
	•	Optional deposit
	•	Donations (separate flow)

Stripe Behaviour
	•	Uses connected Stripe account for the owning organisation
	•	Atlas fee (if applicable) calculated transparently
	•	Net amount clearly shown to organiser

4. Confirmations

Post-submission behaviour:
	•	Confirmation message
	•	Confirmation email toggle
	•	Admin notification toggle
	•	Receipt email (Stripe)
	•	Optional redirect URL

⸻

Event vs Form Responsibilities

Event owns:
	•	Title, description, images
	•	Dates and location
	•	Default visibility rules
	•	Default capacity
	•	Tags & discovery
	•	Publishing state

Form owns:
	•	Registration flow
	•	Fields collected
	•	Payment logic
	•	Pricing model
	•	Submission handling
	•	Confirmations

⸻

User Experience Rationale

For Scouters
	•	“This is the form people fill out”
	•	“This form takes payment”
	•	No need to understand Stripe or pricing models at event level

For Parents
	•	Clear pricing per child / per group
	•	Clear confirmation and receipts
	•	Less confusion around what they are paying for

⸻

Migration Plan (High Level)
	•	Existing Event-level payment settings:
	•	Auto-migrated into the default Event Form
	•	Events without forms remain unchanged
	•	Backward compatibility maintained

⸻

Non-Goals (Out of Scope)
	•	Redesign of drag-and-drop inputs
	•	Reworking participant field internals
	•	Advanced accounting exports
	•	Replacing MMS functionality

⸻

Success Criteria
	•	Scouters can create:
	•	Free events
	•	Paid events
	•	Group-priced events
	•	Multi-participant registrations
	•	Payment logic is clear, predictable, and extensible
	•	No loss of existing functionality
	•	Forms feel first-class, not secondary

⸻

Notes for Future Iterations
	•	Discounts & voucher codes
	•	Automatic waitlists
	•	Refund workflows
	•	Attendance tracking tied to payments
	•	Donation-only forms (no event)





Lastly....
Add the ability to choose a 'Key Contact' from the parent org of an event, if at least one Key Contact exists. Then on the public frontend page this person appears as 'Event Organiser Info'
