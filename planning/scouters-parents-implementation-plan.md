# Scouters and Parents System - Implementation Plan

## Overview
Refactor the Group Users tab to separate Scouters and Parents with improved add/invite workflows.

## Current State Analysis
- **Component**: `organization-users-tab.tsx`
- **Current Add Dialog**: `add-organization-member-dialog.tsx`
- **Members**: All users shown in single table
- **Roles**: Stored in user_roles table with role field

## Database Changes Needed

### 1. Invitation Links Table (new)
```sql
CREATE TABLE invitation_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_type TEXT NOT NULL, -- 'province', 'county', 'group', 'team'
    organization_id UUID NOT NULL,
    role TEXT NOT NULL, -- 'scouter', 'parent'
    section_ids TEXT[], -- for scouters
    is_section_lead BOOLEAN, -- for scouters
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Pending Invitations Table (new)
```sql
CREATE TABLE pending_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    organization_type TEXT NOT NULL,
    organization_id UUID NOT NULL,
    role TEXT NOT NULL,
    section_ids TEXT[],
    is_section_lead BOOLEAN,
    invited_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(email, organization_id, role)
);
```

## Implementation Phases

### Phase 1: UI Restructuring ✅
**Files to modify:**
- `src/components/admin/organization-users-tab.tsx`

**Changes:**
1. Split members list into two sections: Scouters and Parents
2. Filter members by role ('scouter' vs 'parent')
3. Add section headers with appropriate buttons for each
4. Two buttons per section:
   - "Add [Scouter/Parent]" - for existing users
   - "Invite New User" - for invitations

### Phase 2: Add Existing User Modal ✅
**Files to modify:**
- `src/components/admin/add-organization-member-dialog.tsx`

**Changes:**
1. Accept `role` prop ('scouter' or 'parent')
2. Update title based on role
3. Add search functionality with debounce
4. Show "No user found" message with "Invite new user" link
5. If scouter, show section selection and lead checkbox

### Phase 3: Invite New User Modal 🆕
**New file:**
- `src/components/admin/invite-user-dialog.tsx`

**Features:**
1. Tabs for two invite methods:
   - **Create and Invite**: Email input + role-specific fields
   - **Invite by Link**: Generate shareable link
2. For Scouters: Section selection + Section Lead checkbox
3. For Parents: Email only
4. Integration with SendGrid for email invites
5. Link generation with expiry (7 days default)

### Phase 4: API Routes 🆕

#### 4.1 Search Users API
**New file:** `src/app/api/users/search/route.ts`
```typescript
GET /api/users/search?q=email@example.com
Response: { users: [...] }
```

#### 4.2 Create and Invite User API
**New file:** `src/app/api/invitations/create/route.ts`
```typescript
POST /api/invitations/create
Body: {
  email, organizationType, organizationId, 
  role, sectionIds?, isSectionLead?
}
Response: { success, invitationId }
```
- Creates pending_invitation record
- Sends SendGrid email with activation link

#### 4.3 Generate Invitation Link API
**New file:** `src/app/api/invitations/link/route.ts`
```typescript
POST /api/invitations/link
Body: {
  organizationType, organizationId, 
  role, sectionIds?, isSectionLead?
}
Response: { invitationUrl, expiresAt }
```
- Creates invitation_links record with unique token
- Returns shareable URL

#### 4.4 Accept Invitation Link API
**New file:** `src/app/api/invitations/accept/[token]/route.ts`
```typescript
GET /api/invitations/accept/[token]
Response: { valid, redirectUrl, organizationData }
```
- Validates token
- Returns pre-fill data for signup

### Phase 5: Signup Flow Enhancement 🆕
**Files to modify:**
- `src/app/signup/page.tsx`

**Changes:**
1. Check URL for invitation token parameter
2. If token present, validate and pre-fill:
   - Group/organization
   - Role (hidden, auto-selected)
3. After signup, auto-assign role based on invitation

### Phase 6: SendGrid Integration 🆕
**New file:** `src/lib/sendgrid.ts`

**Features:**
1. Send invitation emails
2. Template variables: 
   - Organization name
   - Inviter name
   - Activation link
   - Role (Scouter/Parent)

## Component Structure

```
organization-users-tab.tsx (modified)
├── Scouters Section
│   ├── Add Scouter (AddOrganizationMemberDialog with role='scouter')
│   ├── Invite New User (InviteUserDialog with role='scouter')
│   └── Scouters Table
└── Parents Section
    ├── Add Parent (AddOrganizationMemberDialog with role='parent')
    ├── Invite New User (InviteUserDialog with role='parent')
    └── Parents Table

add-organization-member-dialog.tsx (modified)
├── Search input with debounce
├── User dropdown results
├── Section selection (if scouter)
├── Section Lead checkbox (if scouter)
└── "Invite new user" fallback

invite-user-dialog.tsx (new)
├── Tab: Create and Invite
│   ├── Email input
│   ├── Section selection (if scouter)
│   ├── Section Lead checkbox (if scouter)
│   └── Send Invitation button
└── Tab: Invite by Link
    ├── Link display
    ├── Expiry info
    └── Copy button
```

## Testing Checklist
- [ ] Scouters and Parents sections render correctly
- [ ] Add existing scouter flow works
- [ ] Add existing parent flow works
- [ ] Invite new scouter via email works
- [ ] Invite new parent via email works
- [ ] Generate invitation link works
- [ ] Invitation link signup flow works
- [ ] SendGrid emails are sent
- [ ] Expired links are rejected
- [ ] Used links cannot be reused

## Environment Variables Needed
```
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...
SENDGRID_INVITATION_TEMPLATE_ID=...
```

## Priority Order
1. Phase 1 (UI Restructuring) - Core visual changes
2. Phase 2 (Add Existing User) - Existing functionality enhancement
3. Phase 4.1 (Search API) - Required for Phase 2
4. Phase 3 (Invite Modal) - New invitation system
5. Phase 4.2-4.4 (Invitation APIs) - Backend for Phase 3
6. Phase 6 (SendGrid) - Email functionality
7. Phase 5 (Signup Enhancement) - Complete the flow
