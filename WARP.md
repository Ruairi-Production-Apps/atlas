# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Scout Hub is a Next.js web application for Scouting Ireland that allows Scouts to plan and manage activities across a hierarchical organizational structure (Provinces → Counties → Groups → Sections). Built with Next.js 16, React 19, TypeScript, Supabase, and shadcn/ui.

## Common Commands

### Development
```bash
npm run dev                 # Start development server (http://localhost:3000)
npm run build              # Build for production
npm start                  # Start production server
npm run lint               # Run ESLint
```

### Supabase Local Development
```bash
supabase start             # Start local Supabase instance
supabase stop              # Stop local Supabase instance
supabase db reset          # Reset database (runs migrations + seed data)
supabase migration new <name>  # Create new migration
supabase db push           # Push local migrations to remote
npx tsx scripts/create-sysadmin.ts  # Create system admin user
```

Supabase runs locally at:
- API: http://127.0.0.1:54321
- Studio: http://127.0.0.1:54323
- Inbucket (Email testing): http://127.0.0.1:54324

### Component Management
```bash
npx shadcn@latest add <component>  # Add shadcn/ui component
```

## Architecture

### Organizational Hierarchy

The application models Scouting Ireland's structure:
```
Provinces (e.g., Leinster, Munster)
  └── Counties (e.g., Dublin, Cork)
      └── Groups (e.g., 1st Dublin Scout Group)
          └── Sections (e.g., Beaver Colony, Cub Pack, Scout Troop)
```

Each level has:
- Public pages with info, news, and events
- Admin dashboards for managing content
- Hierarchical role-based permissions

### Role-Based Permissions

Roles are hierarchical and scope-based:
- **SysAdmin**: Full system access
- **Provincial Admin**: Manages province data + all child counties/groups
- **County Admin**: Manages county data + child groups, can create groups and assign group leaders
- **Group Leader**: Manages group data + child sections
- **Section Leader**: Manages section data

Permissions flow down the hierarchy (e.g., County Admin can edit county events AND group events within that county).

### Database Structure

Key tables:
- `provinces`, `counties`, `groups`, `sections` - Organizational hierarchy
- `profiles` - User profiles (synced with auth.users)
- `user_roles` - Role assignments with scope (scope_type + scope_id)
- `events` - Events with capacity, pricing, registration forms
- `news_posts` - News articles
- `knowledgebase_articles` - Documentation/resources
- `organization_members` - Membership tracking with permissions
- `event_registrations` - Event sign-ups with custom form responses
- `event_registration_form_fields` - Dynamic form builder fields

All organizational tables use:
- UUIDs as primary keys
- `slug` fields (auto-generated from name)
- Soft deletes via `deleted_at`
- Timestamps (`created_at`, `updated_at`)
- Standard fields: name, description, logo_url, website, email, social links

### Authentication & Authorization

**Supabase Client Pattern:**
- Server components: `import { createClient } from '@/lib/supabase/server'` then `await createClient()`
- Client components: `import { createClient } from '@/lib/supabase/client'` then `createClient()`
- Middleware: Uses `@supabase/ssr` directly for cookie handling

**Permission Checking:**
- Use `checkOrganizationPermission()` from `@/lib/auth-utils.ts` for scope-based checks
- Checks cascade: sysadmin → organizational role → organization_members permissions
- Example: `await checkOrganizationPermission(supabase, userId, 'group', groupId, 'can_manage_events')`

**Middleware Protection:**
- `/admin/*` routes require authentication (checked in middleware.ts)
- Role verification happens in individual page components using `user_roles` table

**Impersonation:**
- SysAdmin can impersonate users via cookies: `impersonate_user_id`, `impersonate_admin_id`
- Handled in admin layout with ImpersonationBar component

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth pages (login, signup, etc.)
│   ├── admin/                   # Admin dashboard
│   │   ├── organizations/       # Manage provinces, counties, groups
│   │   └── users/               # User management
│   ├── api/                     # API routes
│   │   ├── admin/               # Admin-only endpoints
│   │   └── organizations/       # Public/scoped organization APIs
│   ├── provinces/               # Public province pages
│   ├── counties/                # Public county pages
│   ├── groups/                  # Public group pages
│   ├── events/                  # Event listings and details
│   ├── news/                    # News listings
│   ├── knowledgebase/           # KB articles
│   └── scouter/                 # Scouter-specific features
├── components/
│   ├── admin/                   # Admin-specific components
│   ├── layout/                  # Headers, footers, navigation
│   ├── scouter/                 # Scouter components
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── admin/
│   │   └── queries.ts           # Admin-specific database queries
│   ├── supabase/
│   │   ├── server.ts            # Server-side Supabase client
│   │   ├── client.ts            # Client-side Supabase client
│   │   └── queries.ts           # Shared database queries
│   ├── auth-utils.ts            # Permission checking utilities
│   └── utils.ts                 # General utilities (cn, etc.)
└── middleware.ts                # Auth middleware

supabase/
├── config.toml                  # Local Supabase configuration
├── migrations/                  # Database schema migrations
│   ├── *_create_enums_and_functions.sql
│   ├── *_create_organizational_tables.sql
│   ├── *_create_user_tables.sql
│   ├── *_create_content_tables.sql
│   └── *_create_rls_policies.sql
└── seed.sql                     # Sample data for development
```

### UI Components

**shadcn/ui Configuration:**
- Style: `new-york`
- Using RSC (React Server Components)
- Icon library: lucide-react
- Path aliases: `@/components`, `@/lib`, `@/lib/utils`

**Styling:**
- Tailwind CSS 4 (using new CSS-first configuration)
- Dark mode support via `next-themes`
- Custom color scheme with green primary: `hsl(142.1 76.2% 36.3%)`
- Using `tw-animate-css` for animations

**Key UI Patterns:**
- Rich text editor: TipTap with extensions for images, links, placeholders
- Drag-and-drop: @dnd-kit for form builder and sortable lists
- Dialogs: Radix UI dialog components
- Date pickers: Flatpickr with React wrapper
- Form fields use standard shadcn patterns

### API Route Patterns

**Standard Structure:**
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase.from('table').select('*')
        if (error) throw error
        return NextResponse.json({ data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
```

**Authentication in Routes:**
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

**Permission Checks:**
```typescript
const hasPermission = await checkOrganizationPermission(
    supabase, user.id, organizationType, organizationId
)
if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
```

### Event Management System

Events support complex features:
- **Capacity limits**: Separate caps for groups, scouters, and youth members
- **Pricing modes**: Per group, per scout, or different prices for scouters vs youth
- **Visibility**: Open to all, sections only, or scouters only
- **Custom registration forms**: Drag-and-drop field builder for participant information
- **Payment integration**: Support for Stripe (optional, future feature)
- **Hierarchical display**: County events appear on county + parent province calendar; group events on group + county + province

## Development Guidelines

### TypeScript
- Strict mode enabled
- Define interfaces for all database entities
- Use proper types for Supabase queries (avoid `any`)
- Path alias: `@/*` maps to `src/*`

### Database Queries
- Put shared queries in `src/lib/supabase/queries.ts`
- Admin-specific queries go in `src/lib/admin/queries.ts`
- Always check for soft deletes: `.is('deleted_at', null)`
- Use proper ordering and filtering
- Export TypeScript interfaces for all entities

### RLS (Row Level Security)
- Database uses RLS policies for security
- Policies check `user_roles` table with scope matching
- When writing queries, trust RLS for access control but add application-level checks for better UX
- Test policies thoroughly with different user roles

### Component Organization
- Server Components by default (Next.js 16 App Router)
- Use `'use client'` directive only when needed (interactivity, hooks, etc.)
- Keep business logic in `/lib`, not in components
- Extract reusable UI into `/components/ui` using shadcn patterns

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Slug Generation
- Slugs auto-generate from names via database trigger (`generate_slug()`)
- Format: lowercase, alphanumeric + hyphens, no spaces
- Used for friendly URLs: `/provinces/leinster`, `/groups/1st-dublin-scout-group`

### Error Handling
- Use try-catch blocks in API routes
- Return appropriate HTTP status codes
- Log errors to console for debugging
- Provide user-friendly error messages in UI

## Testing & Quality

### Manual Testing Workflow
1. Reset local database: `supabase db reset`
2. Run dev server: `npm run dev`
3. Test with seed data (4 provinces, 14 counties, 9 groups with sections)
4. Create test users at different role levels
5. Verify permissions cascade correctly

### Key Areas to Test
- Role-based access control at each organizational level
- Event registration flows with custom forms
- Event visibility and filtering across hierarchy
- File uploads (images, documents) via Supabase Storage
- Rich text editor functionality
- Dark mode theme switching

## Important Notes

- **No Tests Yet**: This is MVP development - no test framework configured
- **Local-First Development**: Use local Supabase instance for development
- **Placeholder User IDs**: Seed data uses `00000000-0000-0000-0000-000000000001` for author_id
- **Future Features**: Payment automation (Stripe Connect), white-labeling, advanced analytics
- **React 19**: Uses new React 19 features - ensure compatibility when adding libraries
- **Soft Deletes**: Never hard delete organizational data - use `deleted_at` timestamp
