# Gear Lists - Implementation Plan

## Overview
Create a Gear Lists system that allows scouters to create, manage, and share packing/equipment lists for events and camps. Gear lists can be standalone or linked to events.

---

## Feature Requirements

### Core Functionality:
1. **Create/Edit/Delete Gear Lists** - Scouters can manage gear lists within their organization
2. **Link to Events (Optional)** - Associate gear lists with specific events
3. **Share Links** - Generate shareable public links for viewing
4. **Organization Dashboard Tab** - "Gear" tab for managing lists
5. **Public Frontend Display** - "Gear" tab on org public page if lists exist

### User Roles:
- **Scouters/Admins**: Full CRUD access within their organization
- **Public**: View-only access via share links
- **Parents/Youth**: View organization's gear lists on frontend

---

## Database Schema

### gear_lists Table
```sql
CREATE TABLE gear_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    scope_type scope_type NOT NULL,
    scope_id UUID NOT NULL,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id),
    published BOOLEAN DEFAULT TRUE,
    share_token TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### gear_list_items Table
```sql
CREATE TABLE gear_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gear_list_id UUID NOT NULL REFERENCES gear_lists(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    category TEXT,
    notes TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Implementation Phases

### **Phase 1: Database & Backend** 🗄️

#### 1.1 Database Migration
- Create `gear_lists` table
- Create `gear_list_items` table
- Add indexes for performance
- RLS policies for security
- Triggers for updated_at

#### 1.2 API Routes
- `/api/organizations/[type]/[id]/gear-lists` - List/Create
- `/api/organizations/[type]/[id]/gear-lists/[listId]` - Get/Update/Delete
- `/api/organizations/[type]/[id]/gear-lists/[listId]/items` - Manage items
- `/api/gear-lists/share/[token]` - Public view via share link

---

### **Phase 2: Admin Dashboard UI** 🎨

#### 2.1 Organization Dashboard Tab
**Location**: `/src/components/admin/organization-edit-tabs.tsx`
- Add "Gear" tab after existing tabs

#### 2.2 Gear Lists Management Component
**Location**: `/src/components/admin/organization-gear-tab.tsx`

**Features:**
- List all gear lists for the organization
- "Create New Gear List" button
- Table/grid view with columns:
  - Title
  - Items count
  - Linked event (if any)
  - Share link button
  - Edit/Delete actions

#### 2.3 Gear List Editor/Dialog
**Location**: `/src/components/admin/gear-list-editor.tsx`

**Features:**
- Form for title & description
- Optional event selector
- Drag-and-drop item list (reorderable)
- Add/edit/delete individual items
- Item fields:
  - Item name
  - Quantity
  - Category (dropdown: Clothing, Camping, Safety, Personal, Food, etc.)
  - Notes
- Generate/regenerate share link
- Save/Cancel buttons

---

### **Phase 3: Public Frontend** 🌐

#### 3.1 Organization Public Gear Tab
**Location**: `/src/app/[province_slug]/[county_slug]/[group_slug]/page.tsx`

**Features:**
- New "Gear" tab (only shown if gear lists exist)
- List of published gear lists
- Click to view detail

#### 3.2 Gear List Detail Page
**Location**: `/src/app/gear-lists/[token]/page.tsx`

**Features:**
- Public view accessible via share token
- Display title, description
- Show linked event (if any)
- Categorized item list
- Print-friendly layout
- Copy list to clipboard button

---

## File Structure

```
supabase/migrations/
└── create_gear_lists.sql (NEW)

src/components/admin/
├── organization-edit-tabs.tsx (MODIFY - add Gear tab)
├── organization-gear-tab.tsx (NEW)
└── gear-list-editor.tsx (NEW)

src/components/gear/
├── gear-list-card.tsx (NEW)
└── gear-list-display.tsx (NEW)

src/app/api/
└── organizations/[type]/[id]/
    └── gear-lists/
        ├── route.ts (NEW - list/create)
        ├── [listId]/
        │   ├── route.ts (NEW - get/update/delete)
        │   └── items/
        │       └── route.ts (NEW - manage items)
        └── share/[token]/
            └── route.ts (NEW - public view)

src/app/gear-lists/
└── [token]/
    └── page.tsx (NEW - public view page)

src/app/[province_slug]/[county_slug]/[group_slug]/
└── page.tsx (MODIFY - add Gear tab)
```

---

## Data Model

### GearList
```typescript
interface GearList {
    id: string
    title: string
    description: string | null
    scope_type: 'province' | 'county' | 'group' | 'team'
    scope_id: string
    event_id: string | null
    event_title?: string // joined data
    author_id: string
    published: boolean
    share_token: string
    created_at: string
    updated_at: string
    items?: GearListItem[] // nested items
}
```

### GearListItem
```typescript
interface GearListItem {
    id: string
    gear_list_id: string
    item_name: string
    quantity: number
    category: string | null
    notes: string | null
    display_order: number
    created_at: string
    updated_at: string
}
```

---

## UI/UX Design

### Admin Dashboard View
- **Table Layout**:
  - Row per gear list
  - Columns: Title, Items (count), Event, Share Link, Actions
  - Quick actions: Edit, Delete, Copy Share Link

### Gear List Editor
- **Two-panel layout**:
  - Left: List metadata (title, description, event)
  - Right: Items list with drag handles
- **Item editor**:
  - Inline add item input
  - Category dropdown with icons
  - Quantity stepper
  - Notes expandable

### Public View
- **Clean, printable design**:
  - Organization branding
  - Event info banner (if linked)
  - Items grouped by category
  - Checkboxes for printing/tracking
  - Share link display

---

## Item Categories

Default categories:
- 🎒 **Clothing** - Uniform, rain gear, hiking boots
- ⛺ **Camping Gear** - Tent, sleeping bag, mat
- 🔦 **Safety & Tools** - First aid, flashlight, whistle
- 🧼 **Personal** - Toiletries, towel, medications
- 🍽️ **Food & Cooking** - Water bottle, mess kit, snacks
- 📱 **Electronics** - Phone, charger, camera
- 📄 **Documents** - Permission forms, ID, insurance
- ⚡ **Other** - Miscellaneous items

---

## Share Link Implementation

### Token Generation
```typescript
// Generate unique, URL-safe token
const shareToken = crypto.randomBytes(16).toString('base64url')
```

### Share URL Format
```
https://yourdomain.com/gear-lists/[share-token]
```

### Features:
- Tokens never expire (unless gear list is deleted)
- Can regenerate token to invalidate old links
- No authentication required to view
- Public view respects `published` status

---

## Implementation Order

### Sprint 1: Database & Core API
1. ✅ Create database migration
2. ✅ Create gear lists API routes
3. ✅ Create gear list items API routes
4. ✅ Implement RLS policies

### Sprint 2: Admin Dashboard
1. ✅ Add "Gear" tab to organization dashboard
2. ✅ Create gear lists listing component
3. ✅ Create gear list editor component
4. ✅ Implement drag-and-drop reordering
5. ✅ Share link generation

### Sprint 3: Public Frontend
1. ✅ Create public gear list view page
2. ✅ Add "Gear" tab to organization public page
3. ✅ Implement print-friendly styling
4. ✅ Add copy-to-clipboard functionality

---

## Success Criteria

- [ ] Scouters can create/edit gear lists
- [ ] Items can be reordered via drag-and-drop
- [ ] Gear lists can be linked to events
- [ ] Share links generate and work publicly
- [ ] "Gear" tab appears in org dashboard
- [ ] "Gear" tab appears on public org page (when lists exist)
- [ ] Public view is print-friendly
- [ ] RLS policies prevent unauthorized access

---

## Future Enhancements

1. **Templates** - Save gear lists as templates for reuse
2. **Duplicating** - Clone existing gear lists
3. **Import/Export** - CSV/JSON import/export
4. **Checklists** - Interactive checkboxes for tracking
5. **Participant Lists** - Link to who needs to bring what
6. **Event Integration** - Auto-attach to event detail page

---

**Estimated Time**: 1-2 weeks

**Priority**: Medium

**Dependencies**: Organization dashboard structure already exists ✅
