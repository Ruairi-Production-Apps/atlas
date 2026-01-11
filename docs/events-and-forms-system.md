# Events and Event Forms System Documentation

## Overview
The Scout Hub 2026 platform includes a comprehensive Events system that allows organizations (Provinces, Counties, Groups, and Teams) to create, manage, and publish events. Each event can have custom registration forms built using a drag-and-drop form builder.

---

## Table of Contents
1. [Event Structure](#event-structure)
2. [Event Forms System](#event-forms-system)
3. [Database Schema](#database-schema)
4. [Form Builder Features](#form-builder-features)
5. [Event Visibility & Pricing](#event-visibility--pricing)
6. [Field Types Available](#field-types-available)
7. [User Flows](#user-flows)

---

## Event Structure

### Core Event Properties

Events are scoped to organizations and contain the following key information:

**Basic Information:**
- `title` - Event name
- `slug` - URL-friendly identifier (auto-generated)
- `body` - Rich text description
- `featured_image_url` - Hero image for the event
- `tags` - Array of tags for categorization

**Scheduling:**
- `start_date` - Event start date and time
- `end_date` - Optional end date and time
- `location` - Physical location text
- `google_map_link` - Optional map link

**Capacity Management:**
- `capacity_groups` - Number of groups that can register
- `capacity_scouters` - Number of scouters that can attend
- `capacity_youth` - Number of youth members that can attend

**Visibility & Access:**
- `visibility` - Controls who can see and register for the event
  - `open_to_all` - Anyone can register
  - `sections_only` - Restricted to specific youth sections
  - `adults_only` - Scouters and parents only
- `selected_section_types` - Array of section types (beavers, cubs, scouts, ventures, rovers)

**Pricing:**
- `pricing_mode` - How pricing is calculated
  - `per_scout` - Individual pricing
  - `per_group` - Flat rate per group
- `price_youth` - Price per youth member
- `price_scouter` - Price per scouter
- `price` - General/group price

**Registration Settings:**
- `require_participant_info` - Boolean to require detailed participant information
- `require_payment` - Boolean to enable payment requirement

**Publishing:**
- `published` - Boolean for publish status
- `published_at` - Timestamp when first published
- `author_id` - User who created the event
- `scope_type` - Organization type (province, county, group, team)
- `scope_id` - Organization UUID

---

## Event Forms System

The event forms system allows event organizers to create custom registration forms using a drag-and-drop interface.

### Form Structure

Each event can have one or more forms:

**Event Form Properties:**
- `id` - Unique form identifier
- `event_id` - Reference to parent event
- `title` - Form name (e.g., "Registration Form", "Medical Information")
- `description` - Form instructions
- `button_text` - Custom submit button text
- `published` - Whether the form is active

**Form Fields:**
Each form contains multiple fields with:
- `field_type` - Type of input field (see Field Types section)
- `label` - Display label for the field
- `required` - Whether the field must be filled
- `display_order` - Position in the form (supports drag-and-drop reordering)
- `options` - Array of choices (for select, multi-select, radio)
- `participants_config` - Configuration for participant collection fields
- `validation_rules` - Custom validation rules
- `number_config` - Min/max values for number fields
- `date_config` - Date range constraints
- `address_config` - Address field configuration
- `content_config` - Styling for heading/paragraph fields

---

## Database Schema

### Events Table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  featured_image_url TEXT,
  body TEXT,
  tags TEXT[],
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  google_map_link TEXT,
  price DECIMAL(10, 2),
  capacity_groups INTEGER,
  capacity_scouters INTEGER,
  capacity_youth INTEGER,
  scope_type scope_type NOT NULL,
  scope_id UUID NOT NULL,
  visibility event_visibility NOT NULL DEFAULT 'open_to_all',
  selected_section_types TEXT[],
  pricing_mode event_pricing_mode DEFAULT 'per_scout',
  price_scouter DECIMAL(10, 2),
  price_youth DECIMAL(10, 2),
  require_participant_info BOOLEAN DEFAULT false,
  require_payment BOOLEAN DEFAULT false,
  author_id UUID REFERENCES auth.users(id),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Event Forms Table
```sql
CREATE TABLE event_forms (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  button_text TEXT DEFAULT 'Submit',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Form Fields Table
```sql
CREATE TABLE form_fields (
  id UUID PRIMARY KEY,
  form_id UUID REFERENCES event_forms(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL,
  label TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  options TEXT[],
  participants_config JSONB DEFAULT '{}'::JSONB,
  validation_rules JSONB,
  number_config JSONB,
  date_config JSONB,
  address_config JSONB,
  content_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Event Sections Junction Table
```sql
CREATE TABLE event_sections (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  UNIQUE(event_id, section_id)
);
```

---

## Form Builder Features

### Drag-and-Drop Interface
- **@dnd-kit** library for smooth drag-and-drop
- Real-time reordering of form fields
- Visual feedback during dragging
- Automatic saving of field order

### Field Management
- **Add Fields**: Click field type to add to form
- **Edit Fields**: Click edit icon to modify field properties
- **Delete Fields**: Remove fields with confirmation
- **Duplicate**: Clone existing fields (future feature)

### Field Configuration Options

#### Common to All Fields:
- Label text
- Required/Optional toggle
- Help text
- Placeholder text

#### Field-Specific Options:

**Text Fields (Short & Long):**
- Character limits
- Validation patterns
- Placeholder suggestions

**Select/Multi-Select/Radio:**
- Add/remove options
- Default values
- Option reordering

**Number Fields:**
- Minimum value
- Maximum value
- Step increment
- Decimal places

**Date/DateTime:**
- Min/max date ranges
- Default to today
- Time picker inclusion

**Participants:**
- Number of participants to collect
- What information to collect per participant:
  - First Name
  - Last Name
  - Age
  - Section
  - Dietary Requirements
  - Medical Information

**Address:**
- Include street address
- Include city/town
- Include county
- Include eircode/postal code
- Include country

**Content Fields (Heading, Paragraph, Section Break):**
- No "Required" checkbox (not applicable)
- Custom styling options
- Rich text for paragraphs

---

## Event Visibility & Pricing

### Visibility Modes

**1. Open to All** (`open_to_all`)
- Any registered user can view and register
- Suitable for public events
- No section restrictions

**2. Youth Members** (`sections_only`)
- Restricted to specific youth sections
- Organizer selects which sections (Beavers, Cubs, Scouts, Ventures, Rovers)
- Section badges displayed on event cards and detail pages
- Filterable by section on events listing

**3. Adults Only** (`adults_only`)
- Only scouters and parents can register
- No youth participation
- Suitable for training events, meetings, etc.

### Pricing Modes

**Per Scout** (`per_scout`)
- Individual pricing per attendee
- Separate rates for youth and scouters
- `price_youth`: Cost per youth member
- `price_scouter`: Cost per scouter/adult

**Per Group** (`per_group`)
- Flat rate regardless of participant count
- Single `price` value
- Suitable for group bookings

---

## Field Types Available

The form builder supports 17 different field types:

### Input Fields
1. **Short Text** - Single-line text input
2. **Long Text** - Multi-line textarea
3. **Email** - Email validation
4. **Phone** - Phone number input
5. **Number** - Numeric input with min/max
6. **Date** - Date picker
7. **DateTime** - Date and time picker
8. **Checkbox** - Single checkbox (yes/no)

### Choice Fields
9. **Select** - Dropdown single-choice
10. **Multi-Select** - Dropdown multiple-choice
11. **Radio** - Radio button single-choice

### Special Fields
12. **Group** - Group/organization selector
13. **Participants** - Collect data for multiple participants
14. **Address** - Structured address collection

### Content/Layout Fields
15. **Heading** - Section headings (H1-H6)
16. **Paragraph** - Instructional text
17. **Section Break** - Visual separator

---

## User Flows

### Event Creation Flow (Scouter/Admin)

1. **Navigate to Events**
   - `/scouter/organizations/[id]/events`

2. **Create New Event**
   - Fill in basic details (title, dates, location)
   - Set visibility and pricing
   - Upload featured image
   - Write event description
   - Publish or save as draft

3. **Create Registration Form (Optional)**
   - Navigate to event forms section
   - Create new form
   - Add form title and description
   - Drag and drop fields onto form
   - Configure each field
   - Set custom button text
   - Publish form

4. **Manage Registrations**
   - View registered participants
   - Export registration data
   - Send communications to registrants

### Event Registration Flow (User)

1. **Browse Events**
   - `/events` - Public events listing
   - Filter by section, date, location
   - View event cards with key details

2. **View Event Details**
   - `/events/[slug]` - Individual event page
   - See full description, dates, location
   - View section badges (if applicable)
   - Check pricing and capacity

3. **Register for Event**
   - Click "Register" button
   - Fill out registration form(s)
   - Submit participant information
   - Complete payment (if required)
   - Receive confirmation

---

## Recent Enhancements

### Section Filtering System
- Events can be filtered by youth section on the events listing page
- "All" button to clear section filters
- Section badges displayed on individual event pages
- Section filters are visible by default when "Youth Members" audience is selected

### Form Builder Improvements
- Fixed label persistence for Heading, Paragraph, and Section Break fields
- "Required" checkbox hidden for non-input field types (heading, paragraph, section_break)
- Improved field type icons and labels

---

## Component Locations

### Key Components:
- **Form Builder**: `/src/components/admin/form-builder.tsx`
- **Events Client**: `/src/app/events/events-client.tsx`
- **Events Filter**: `/src/components/events/events-filter.tsx`
- **Event Detail Page**: `/src/app/events/[slug]/page.tsx`

### API Routes:
- `/api/events` - Event CRUD operations
- `/api/events/[eventId]` - Individual event operations
- `/api/organizations/[type]/[id]/events` - Organization-scoped events
- `/api/organizations/[type]/[id]/events/[eventId]/forms` - Form management

---

## Future Enhancements Planned

Based on `planning/events-system-update.md`:

1. **Key Contact System**
   - Add ability to choose a 'Key Contact' from the parent organization
   - Display as 'Event Organiser Info' on public frontend
   - Include contact details for inquiries

2. **Additional Features** (from planning notes)
   - Online payment integration
   - Waitlist management
   - Automated email reminders
   - Certificate generation
   - Attendance tracking

---

## Technical Notes

### Auto-Generated Fields:
- `slug`: Generated from title + UUID substring
- `published_at`: Set when `published` changes from false to true
- `updated_at`: Automatically updated on any change

### Row Level Security (RLS):
- Events are publicly readable
- Authenticated users with org permissions can manage
- Forms inherit permissions from parent event

### Performance Optimizations:
- Indexed on `scope`, `dates`, `published status`, and `slug`
- Efficient querying with proper foreign keys
- Cascade deletes maintain data integrity

---

**Last Updated**: December 13, 2025
**Version**: 1.0
**System**: Scout Hub 2026
