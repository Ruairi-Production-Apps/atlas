
# Content Management Guide

Use the links below to quickly access and edit key content files in your project.

## 1. Global Metadata (Title, Description)
- **File:** `src/app/layout.tsx`
- **Location:** `metadata` object (Lines 20-23)
- **Content:**
  - `title`: "Atlas - Scouting Ireland Platform"
  - `description`: "A platform for Scouters to plan and manage their activities across Ireland."

## 2. Homepage Content
- **File:** `src/app/page.tsx`
- **Sections:**
  - **Hero Section:** "Welcome to Atlas", Logo, Intro Text (Lines 50-90)
  - **Events Calendar Section:** Header and Filter Card (Lines 93-120)
  - **Features Grid:** Cards for Provinces, Counties, Groups, News, etc. (Lines 123-245)
  - **CTA Section:** "Join Atlas" text and button (Lines 248-256)

## 3. About Page
- **File:** `src/app/about/page.tsx`
- **Content:**
  - Intro text about Atlas
  - Pricing details ("free of charge", Stripe fees)
  - Resources and Tools cards

## 4. Privacy Policy
- **File:** `src/app/privacy-policy/page.tsx`
- **Content:**
  - Full text of the Privacy Policy (11 Sections)
  - Contact email addresses (`support@atlashub.ie`, `admin@atlashub.ie`)
  - Terms regarding data retention and deletion

## 5. Layout Components (Header & Footer)
- **Header:** `src/components/layout/header-wrapper.tsx` (and inner `header.tsx`)
- **Footer:** `src/components/layout/footer.tsx`
  - *Note: These contain navigation links and footer text/copyright info.*
