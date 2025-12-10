import { z } from 'zod'

export const EventSchema = z.object({
    title: z.string().min(1, "Title is required"),
    featured_image_url: z.string().nullable().optional(),
    body: z.string().nullable().optional(),
    tags: z.array(z.string()).optional().default([]),
    start_date: z.string().datetime({ message: "Invalid start date format" }),
    end_date: z.string().datetime().nullable().optional(),
    location: z.string().nullable().optional(),
    google_map_link: z.string().nullable().optional().or(z.literal('')),

    // Visibility & Access
    visibility: z.enum(['open_to_all', 'members_only', 'sections_only']).default('open_to_all'),
    selected_section_types: z.array(z.string()).optional().default([]),

    // Capacity
    capacity_groups: z.union([z.string(), z.number()]).transform(val => val ? Number(val) : null).nullable().optional(),
    capacity_scouters: z.union([z.string(), z.number()]).transform(val => val ? Number(val) : null).nullable().optional(),
    capacity_youth: z.union([z.string(), z.number()]).transform(val => val ? Number(val) : null).nullable().optional(),

    // Pricing
    require_payment: z.boolean().default(false),
    pricing_mode: z.enum(['per_scout', 'per_group', 'per_person_type']).nullable().optional(),
    payment_method: z.string().nullable().optional(),
    price: z.union([z.string(), z.number()]).transform(val => val ? Number(val) : null).nullable().optional(),
    price_scouter: z.union([z.string(), z.number()]).transform(val => val ? Number(val) : null).nullable().optional(),
    price_youth: z.union([z.string(), z.number()]).transform(val => val ? Number(val) : null).nullable().optional(),

    // Meta
    published: z.boolean().default(false),
    require_participant_info: z.boolean().default(false),
})

export const ImpersonateSchema = z.object({
    target_user_id: z.string().uuid("Invalid User ID format")
})
