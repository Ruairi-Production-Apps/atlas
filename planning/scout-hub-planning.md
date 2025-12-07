# Scout Hub – Planning Document

Scout Hub is a web application that allows Scouts to plan and manage their activities.  
It is built using **Next.js**, **React**, **TypeScript**, **Supabase**, and **ShadCN UI**.

---

## Tech Stack

- React + Next.js (App Router)
- TypeScript
- ShadCN UI
- Supabase (Auth, Postgres DB, Storage)
- Host on Vercel

---

## Product Vision

A single hub for:

- Public information about Provinces, Counties, and Groups
- Public news and events with filtering, search, and calendar views
- Admin tools for creating and managing:
  - News
  - Events
  - Registrations
  - Knowledgebase articles
- Event management including registration and optional payment collection

---

## MVP vs Later

### **In for MVP**

- Public directory of Provinces, Counties, and Groups
- Public news and events
- Roles & permissions (SysAdmin → Provincial → County → Group → Section)
- Basic event creation + public event detail pages
- Event registration (manual or no-payment flow to start)
- Knowledgebase articles + file uploads

### **Out for MVP (Future)**

- Attendance tracking / check-in features
- Complex refunds / partial payments
- Advanced reporting / exports
- White-labelling / custom domains
- Full Stripe Connect automation

---

## Terminology (Scouting)

- **Scouters** → Adult volunteers
- **Youth Members** → Beavers, Cubs, Scouts, Ventures
- **Rovers** → Ages 18–26 (can be a Scouter, a Rover, or both)
- **Organisation** → A Province, County, or Group

---

# User Roles

### **SysAdmin**

- Full access to all data and settings.

### **Provincial Admin**

- Can edit data for a Province.
- Provinces are created by SysAdmin.
- SysAdmin can invite or assign users as Provincial Admins.

### **County Admin**

- Can edit data for a County.
- Counties are created by SysAdmin.
- Can create Groups and assign Group Leaders.

### **Group Leader**

- Can edit data for their Group.
- Can create Sections within the Group.
- Can invite Section Leaders.

### **Section Leader**

- Can edit data for their Section.
- Can invite Members to that Section.

> Users may hold multiple roles across different scopes.

---

# Entities & Fields

## Province / County / Group

Each has:

- Logo
- Name
- Description
- Website
- Email
- Facebook link
- Instagram link
- Public page with:
  - Info tab
  - News tab (searchable)
  - Events tab (searchable, list + calendar views)

### Event Calendar Behaviour

- **Province page**

  - Shows province-level events
  - Shows _all_ County + Group events under that Province

- **County page**

  - Shows county-level events
  - Shows all Group events under that County

- **Group page**
  - Shows group-level events

---

## News Posts

- Title
- Featured image
- Rich text body
- Tags
- Scope (Province / County / Group / Section)
- Searchable in public listings

---

## Events

### Event fields

- Title
- Featured image
- Rich text body
- Tags
- Start date / end date
- Location
- Price
- Capacity

### Visibility options

- Open to all
- Open to one or more Sections
- Scouters only

### Capacity options

- Capacity for:
  - Number of Groups
  - Number of Scouters
  - Number of Youth Members

### Pricing modes

- Pricing per Group
- Pricing per Scout
- Pricing with different prices for Scouters and Youth Members

### Additional Options

- **Require participant information**
  - With drag-and-drop field builder for organisers
- **Require payment**
  - Province / County / Group Admins can attach Stripe keys (full automation later)

---

## Knowledgebase

Each Province, County, and Group can create searchable Knowledgebase articles containing:

- Title
- Rich text body
- Tags
- File uploads (documents)

Search filters by Province, County, or Group.

---

# Site Structure

Global header includes navigation to:

- **Home**
- **Provinces**
  - Directory listing → Public Province pages
- **Counties**
  - Directory listing → Public County pages
- **Groups**
  - Directory listing → Public Group pages
- **Events**
  - Global list or calendar view
  - Shows all events by default
  - Search + filters:
    - Date range
    - Section
    - Province / County / Group
    - “Open to all” / “Scouters only”
- **News**
  - Global list of all news posts
  - Search + tag filtering
- **Knowledgebase**
  - Searchable articles
  - Filter by Province, County, or Group

---

# Architecture Overview

## Frontend

- Next.js App Router
- ShadCN components for dashboard and public site
- SSR/ISR for public pages
- Client-side dashboard tools for authenticated users

## Backend (Supabase)

- **Auth:** email/password or OAuth (optional later)
- **Database:** Postgres + RLS for scoping to user roles
- **Storage:** images, documents, logos, attachments

## RLS Permissions (Conceptual)

- Rows scoped using:

  - `scope_type` = province | county | group | section
  - `scope_id`

- User permissions depend on:
  - role
  - membership scope
  - hierarchy relationship

Example:  
A County Admin can edit events belonging to the County **and** all Groups under it.

---

# Key User Flows

## 1. Role Assignment & Inviting

1. SysAdmin creates Provinces / Counties.
2. SysAdmin invites Provincial Admins.
3. Provincial Admins invite/assign County Admins.
4. County Admins create Groups + assign Group Leaders.
5. Group Leaders create Sections + invite Section Leaders / Members.

---

## 2. Event Creation Flow

1. Admin selects scope (Province / County / Group / Section).
2. Fills event details + capacity + pricing. Capacity and pricing are optional.
3. Optional:
   - Build custom participant form
   - Enable payment requirement
4. Publishes event.
5. Event appears on:
   - Its own scope page
   - Parent calendars

---

## 3. Public Event Discovery

Users can:

- Browse Province/County/Group pages
- Use:
  - Calendar view
  - List view
  - Filters:
    - Section
    - Date range
    - Scouters only
    - Open-to-all

---

## 4. Knowledgebase Flow

1. Admin creates article in their scope.
2. Adds rich text + file uploads.
3. Article appears in global KB and can be filtered by scope.

---

# MVP Roadmap

## **Phase 1 – Structure & Public Pages**

- Organisation hierarchy (Province → County → Group → Section)
- Public pages with Events & News tabs
- Global News, Events, Knowledgebase pages

## **Phase 2 – Auth, Roles, Permissions**

- Supabase Auth + profile
- Membership model (roles + scope)
- RLS rules
- Dashboard shell (ShadCN)

## **Phase 3 – Events & Registration**

- Event creation/edit
- Basic registration flow
- Optional per-participant fields
- Manual payment tracking

---

# End of Document
