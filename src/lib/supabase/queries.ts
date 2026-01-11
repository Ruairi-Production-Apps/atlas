import { createClient } from '@/lib/supabase/server'

export interface Province {
    id: string
    name: string
    slug: string
    description: string | null
    long_description: string | null
    logo_url: string | null
    website: string | null
    email: string | null
    facebook_url: string | null
    instagram_url: string | null
    created_at: string
    updated_at: string
}

export interface County {
    id: string;
    province_id: string;
    name: string;
    slug: string;
    description: string | null;
    long_description: string | null;
    logo_url: string | null;
    website: string | null;
    email: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface Group {
    id: string;
    county_id: string;
    name: string;
    slug: string;
    description: string | null;
    long_description: string | null;
    logo_url: string | null;
    website: string | null;
    email: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface AdventureTeam extends Province {
    // Same structure as Province
}

export async function getAdventureTeams(): Promise<AdventureTeam[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('adventure_teams')
        .select('id, name, slug, description, long_description, logo_url, website, email, facebook_url, instagram_url, created_at, updated_at')
        .is('deleted_at', null)
        .order('name')

    if (error) throw error
    return data || []
}

export async function getAdventureTeamBySlug(slug: string): Promise<AdventureTeam | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('adventure_teams')
        .select('id, name, slug, description, long_description, logo_url, website, email, facebook_url, instagram_url, created_at, updated_at')
        .eq('slug', slug)
        .is('deleted_at', null)
        .single()

    if (error) return null
    return data
}

export interface Section {
    id: string
    group_id: string
    name: string
    section_type: 'beavers' | 'cubs' | 'scouts' | 'ventures' | 'rovers'
    description: string | null
    created_at: string
    updated_at: string
}

// Province queries
export async function getProvinces(): Promise<Province[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('provinces')
        .select('id, name, slug, description, long_description, logo_url, website, email, facebook_url, instagram_url, created_at, updated_at')
        .is('deleted_at', null)
        .order('name')

    if (error) throw error
    return data || []
}

export async function getProvinceBySlug(slug: string): Promise<Province | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('provinces')
        .select('id, name, slug, description, long_description, logo_url, website, email, facebook_url, instagram_url, created_at, updated_at')
        .eq('slug', slug)
        .is('deleted_at', null)
        .single()

    if (error) return null
    return data
}

// County queries
export async function getCounties(provinceId?: string, search?: string): Promise<County[]> {
    const supabase = await createClient()
    let query = supabase
        .from('counties')
        .select('id, name, slug, province_id, description, long_description, logo_url, website, email, facebook_url, instagram_url, created_at, updated_at')
        .is('deleted_at', null)
        .order('name')

    if (provinceId) {
        query = query.eq('province_id', provinceId)
    }

    if (search) {
        query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
}

export async function getCountyBySlug(slug: string): Promise<County | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('counties')
        .select('id, name, slug, province_id, description, long_description, logo_url, website, email, facebook_url, instagram_url, created_at, updated_at')
        .eq('slug', slug)
        .is('deleted_at', null)
        .single()

    if (error) return null
    return data
}

// Group queries
export async function getGroups(countyId?: string, search?: string): Promise<Group[]> {
    const supabase = await createClient()
    let query = supabase
        .from('groups')
        .select('id, name, slug, county_id, description, long_description, logo_url, website, email, facebook_url, instagram_url, created_at, updated_at')
        .is('deleted_at', null)
        .order('name')

    if (countyId) {
        query = query.eq('county_id', countyId)
    }

    if (search) {
        query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
}

export async function getGroupBySlug(slug: string): Promise<Group | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('groups')
        .select('id, name, slug, county_id, province_id, description, long_description, logo_url, website, email, facebook_url, instagram_url, created_at, updated_at')
        .eq('slug', slug)
        .is('deleted_at', null)
        .single()

    if (error) return null
    return data
}

// Section queries
export async function getSections(groupId: string): Promise<Section[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('sections')
        .select('id, group_id, name, section_type, description, created_at, updated_at')
        .eq('group_id', groupId)
        .order('section_type')

    if (error) throw error
    return data || []
}

// Event interfaces
export interface Event {
    id: string
    title: string
    slug: string
    featured_image_url: string | null
    body: string | null
    tags: string[]
    start_date: string
    end_date: string | null
    location: string | null
    price: number | null
    capacity_groups: number | null
    capacity_scouters: number | null
    capacity_youth: number | null
    scope_type: 'province' | 'county' | 'group' | 'section'
    scope_id: string
    visibility: 'open_to_all' | 'sections_only' | 'scouters_only'
    selected_section_types: string[] | null
    pricing_mode: 'per_group' | 'per_scout' | 'per_person_type' | null
    price_scouter: number | null
    price_youth: number | null
    require_participant_info: boolean
    require_payment: boolean
    category: 'youth_programme' | 'training' | 'national' | 'other' | null
    is_all_day: boolean
    published: boolean
    published_at: string | null
    google_map_link: string | null
    location_type: 'in_person' | 'online'
    online_meeting_link: string | null
    created_at: string
    updated_at: string
}

export interface EventFilters {
    dateFrom?: string
    dateTo?: string
    section?: string
    provinceId?: string
    countyId?: string
    groupId?: string
    visibility?: 'open_to_all' | 'sections_only' | 'scouters_only'
    search?: string
    category?: 'youth_programme' | 'training' | 'national' | 'other'
}

// Event queries
// Event queries
export async function getEvents(filters?: EventFilters): Promise<Event[]> {
    const supabase = await createClient()

    let query: any = supabase
        .from('events')
        .select('id, title, slug, start_date, end_date, location, price, capacity_groups, capacity_scouters, capacity_youth, scope_type, scope_id, visibility, published, published_at, created_at, updated_at')
        .eq('published', true)
        .is('deleted_at', null)
        .order('start_date', { ascending: true })

    if (filters?.section) {
        const sectionLower = filters.section.toLowerCase()
        // Filter using the selected_section_types array column
        query = query.contains('selected_section_types', [sectionLower])
    }

    if (filters?.dateFrom) {
        query = query.gte('start_date', filters.dateFrom)
    }
    if (filters?.dateTo) {
        query = query.lte('start_date', filters.dateTo)
    }
    if (filters?.provinceId) {
        query = query.eq('scope_type', 'province').eq('scope_id', filters.provinceId)
    }
    if (filters?.countyId) {
        query = query.eq('scope_type', 'county').eq('scope_id', filters.countyId)
    }
    if (filters?.groupId) {
        query = query.eq('scope_type', 'group').eq('scope_id', filters.groupId)
    }
    if (filters?.visibility) {
        query = query.eq('visibility', filters.visibility)
    }
    if (filters?.category) {
        query = query.eq('category', filters.category)
    }
    if (filters?.search) {
        const term = filters.search.replace(/,/g, '')
        if (term.trim()) {
            query = query.or(`title.ilike.%${term}%,body.ilike.%${term}%,tags.cs.{${term}}`)
        }
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as unknown as Event[]
}

export async function getEventsPaginated(filters?: EventFilters, page: number = 1, limit: number = 20): Promise<{ data: Event[], count: number }> {
    const supabase = await createClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query: any = supabase
        .from('events')
        .select('*', { count: 'exact' })
        .eq('published', true)
        .is('deleted_at', null)
        .order('start_date', { ascending: true })
        .range(from, to)

    if (filters?.section) {
        const sectionLower = filters.section.toLowerCase()
        // Filter using the selected_section_types array column
        query = query.contains('selected_section_types', [sectionLower])
    }

    if (filters?.dateFrom) {
        query = query.gte('start_date', filters.dateFrom)
    }
    if (filters?.dateTo) {
        query = query.lte('start_date', filters.dateTo)
    }
    if (filters?.provinceId) {
        query = query.eq('scope_type', 'province').eq('scope_id', filters.provinceId)
    }
    if (filters?.countyId) {
        query = query.eq('scope_type', 'county').eq('scope_id', filters.countyId)
    }
    if (filters?.groupId) {
        query = query.eq('scope_type', 'group').eq('scope_id', filters.groupId)
    }
    if (filters?.visibility) {
        query = query.eq('visibility', filters.visibility)
    }
    if (filters?.category) {
        query = query.eq('category', filters.category)
    }
    if (filters?.search) {
        const term = filters.search.replace(/,/g, '')
        if (term.trim()) {
            query = query.or(`title.ilike.%${term}%,body.ilike.%${term}%,tags.cs.{${term}}`)
        }
    }

    const { data, count, error } = await query
    if (error) throw error
    return { data: (data || []) as unknown as Event[], count: count || 0 }
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('events')
        .select('id, title, slug, featured_image_url, body, tags, start_date, end_date, location, price, capacity_groups, capacity_scouters, capacity_youth, scope_type, scope_id, visibility, selected_section_types, pricing_mode, price_scouter, price_youth, require_participant_info, require_payment, category, is_all_day, published, published_at, google_map_link, location_type, online_meeting_link, created_at, updated_at')
        .eq('slug', slug)
        .eq('published', true)
        .is('deleted_at', null)
        .single()

    if (error) return null
    return data
}

// Get events for a scope (province/county/group) including child scopes
export async function getEventsForScope(
    scopeType: 'province' | 'county' | 'group',
    scopeId: string
): Promise<Event[]> {
    const supabase = await createClient()

    // Get direct events for this scope
    let query = supabase
        .from('events')
        .select('*')
        .eq('scope_type', scopeType)
        .eq('scope_id', scopeId)
        .eq('published', true)
        .is('deleted_at', null)
        .order('start_date', { ascending: true })

    const { data: directEvents, error: directError } = await query
    if (directError) throw directError

    // For provinces, also get county and group events
    if (scopeType === 'province') {
        const counties = await getCounties(scopeId)
        const countyIds = counties.map(c => c.id)

        if (countyIds.length > 0) {
            const { data: countyEvents, error: countyError } = await supabase
                .from('events')
                .select('*')
                .eq('scope_type', 'county')
                .in('scope_id', countyIds)
                .eq('published', true)
                .is('deleted_at', null)
                .order('start_date', { ascending: true })

            if (countyError) throw countyError

            // Get groups for all counties
            const allGroups: Group[] = []
            for (const county of counties) {
                const groups = await getGroups(county.id)
                allGroups.push(...groups)
            }
            const groupIds = allGroups.map(g => g.id)

            if (groupIds.length > 0) {
                const { data: groupEvents, error: groupError } = await supabase
                    .from('events')
                    .select('*')
                    .eq('scope_type', 'group')
                    .in('scope_id', groupIds)
                    .eq('published', true)
                    .is('deleted_at', null)
                    .order('start_date', { ascending: true })

                if (groupError) throw groupError

                return [...(directEvents || []), ...(countyEvents || []), ...(groupEvents || [])]
            }

            return [...(directEvents || []), ...(countyEvents || [])]
        }
    }

    // For counties, also get group events
    if (scopeType === 'county') {
        const groups = await getGroups(scopeId)
        const groupIds = groups.map(g => g.id)

        if (groupIds.length > 0) {
            const { data: groupEvents, error: groupError } = await supabase
                .from('events')
                .select('*')
                .eq('scope_type', 'group')
                .in('scope_id', groupIds)
                .eq('published', true)
                .is('deleted_at', null)
                .order('start_date', { ascending: true })

            if (groupError) throw groupError
            return [...(directEvents || []), ...(groupEvents || [])]
        }
    }

    return directEvents || []
}

// News interfaces
export interface NewsPost {
    id: string
    title: string
    slug: string
    description: string | null
    featured_image_url: string | null
    body: string | null
    tags: string[]
    scope_type: 'province' | 'county' | 'group' | 'section'
    scope_id: string
    published: boolean
    published_at: string | null
    created_at: string
    updated_at: string
}

export interface NewsFilters {
    provinceId?: string
    countyId?: string
    groupId?: string
    tag?: string
    search?: string
}

// News queries
export async function getNewsPosts(filters?: NewsFilters): Promise<NewsPost[]> {
    const supabase = await createClient()
    let query = supabase
        .from('news_posts')
        .select('id, title, slug, description, featured_image_url, body, tags, scope_type, scope_id, published, published_at, created_at, updated_at')
        .eq('published', true)
        .is('deleted_at', null)
        .order('published_at', { ascending: false })

    if (filters?.provinceId) {
        query = query.eq('scope_type', 'province').eq('scope_id', filters.provinceId)
    }
    if (filters?.countyId) {
        query = query.eq('scope_type', 'county').eq('scope_id', filters.countyId)
    }
    if (filters?.groupId) {
        query = query.eq('scope_type', 'group').eq('scope_id', filters.groupId)
    }
    if (filters?.tag) {
        query = query.contains('tags', [filters.tag])
    }
    if (filters?.search) {
        const term = filters.search.replace(/,/g, '') // Sanitize comma to prevent breaking OR syntax
        if (term.trim()) {
            query = query.or(`title.ilike.%${term}%,body.ilike.%${term}%`)
        }
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
}

export async function getNewsPostsPaginated(filters?: NewsFilters, page: number = 1, limit: number = 20): Promise<{ data: NewsPost[], count: number }> {
    const supabase = await createClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from('news_posts')
        .select('*', { count: 'exact' })
        .eq('published', true)
        .is('deleted_at', null)
        .order('published_at', { ascending: false })
        .range(from, to)

    if (filters?.provinceId) {
        query = query.eq('scope_type', 'province').eq('scope_id', filters.provinceId)
    }
    if (filters?.countyId) {
        query = query.eq('scope_type', 'county').eq('scope_id', filters.countyId)
    }
    if (filters?.groupId) {
        query = query.eq('scope_type', 'group').eq('scope_id', filters.groupId)
    }
    if (filters?.tag) {
        query = query.contains('tags', [filters.tag])
    }
    if (filters?.search) {
        const term = filters.search.replace(/,/g, '') // Sanitize comma to prevent breaking OR syntax
        if (term.trim()) {
            query = query.or(`title.ilike.%${term}%,body.ilike.%${term}%`)
        }
    }

    const { data, count, error } = await query
    if (error) throw error
    return { data: data || [], count: count || 0 }
}

export async function getNewsPostBySlug(slug: string): Promise<NewsPost | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('news_posts')
        .select('id, title, slug, description, featured_image_url, body, tags, scope_type, scope_id, published, published_at, created_at, updated_at')
        .eq('slug', slug)
        .eq('published', true)
        .is('deleted_at', null)
        .single()

    if (error) return null
    return data
}

export async function getNewsPostsForScope(
    scopeType: 'province' | 'county' | 'group',
    scopeId: string
): Promise<NewsPost[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('news_posts')
        .select('id, title, slug, description, featured_image_url, body, tags, scope_type, scope_id, published, published_at, created_at, updated_at')
        .eq('scope_type', scopeType)
        .eq('scope_id', scopeId)
        .eq('published', true)
        .is('deleted_at', null)
        .order('published_at', { ascending: false })

    if (error) throw error
    return data || []
}

// Knowledgebase interfaces
export interface KnowledgebaseArticle {
    id: string
    title: string
    slug: string
    description: string | null
    body: string | null
    tags: string[]
    scope_type: 'province' | 'county' | 'group' | 'section'
    scope_id: string
    published: boolean
    published_at: string | null
    created_at: string
    updated_at: string
    adventure_skill: string | null
    featured_image_url: string | null
    show_on_org_page: boolean
    section_types: string[]
}

export interface KnowledgebaseFile {
    id: string
    article_id: string
    file_name: string
    file_path: string
    file_url: string
    file_size: number | null
    mime_type: string | null
    is_embedded: boolean
    created_at: string
}

export interface KnowledgebaseFilters {
    provinceId?: string
    countyId?: string
    groupId?: string
    search?: string
    adventureSkills?: string[]
    categories?: string[]
    sections?: string[]
    showOnOrgPage?: boolean
}

// Knowledgebase queries
export async function getKnowledgebaseArticles(filters?: KnowledgebaseFilters): Promise<KnowledgebaseArticle[]> {
    const supabase = await createClient()
    let query = supabase
        .from('knowledgebase_articles')
        .select('id, title, slug, description, body, tags, scope_type, scope_id, published, published_at, created_at, updated_at, adventure_skill, featured_image_url, show_on_org_page, section_types')
        .eq('published', true)
        .order('published_at', { ascending: false })

    if (filters?.provinceId) {
        query = query.eq('scope_type', 'province').eq('scope_id', filters.provinceId)
    }
    if (filters?.countyId) {
        query = query.eq('scope_type', 'county').eq('scope_id', filters.countyId)
    }
    if (filters?.groupId) {
        query = query.eq('scope_type', 'group').eq('scope_id', filters.groupId)
    }
    if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,body.ilike.%${filters.search}%`)
    }
    if (filters?.adventureSkills && filters.adventureSkills.length > 0) {
        query = query.in('adventure_skill', filters.adventureSkills)
    }
    if (filters?.categories && filters.categories.length > 0) {
        query = query.contains('categories', filters.categories)
    }
    if (filters?.sections && filters.sections.length > 0) {
        query = query.contains('section_types', filters.sections)
    }
    if (filters?.showOnOrgPage !== undefined) {
        query = query.eq('show_on_org_page', filters.showOnOrgPage)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
}

export async function getKnowledgebaseArticlesPaginated(filters?: KnowledgebaseFilters, page: number = 1, limit: number = 20): Promise<{ data: KnowledgebaseArticle[], count: number }> {
    const supabase = await createClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from('knowledgebase_articles')
        .select('id, title, slug, description, body, tags, categories, scope_type, scope_id, published, published_at, created_at, updated_at, adventure_skill, featured_image_url, show_on_org_page, section_types', { count: 'exact' })
        .eq('published', true)
        .order('published_at', { ascending: false })
        .range(from, to)

    if (filters?.provinceId) {
        query = query.eq('scope_type', 'province').eq('scope_id', filters.provinceId)
    }
    if (filters?.countyId) {
        query = query.eq('scope_type', 'county').eq('scope_id', filters.countyId)
    }
    if (filters?.groupId) {
        query = query.eq('scope_type', 'group').eq('scope_id', filters.groupId)
    }
    if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,body.ilike.%${filters.search}%`)
    }
    if (filters?.adventureSkills && filters.adventureSkills.length > 0) {
        query = query.in('adventure_skill', filters.adventureSkills)
    }
    if (filters?.categories && filters.categories.length > 0) {
        query = query.contains('categories', filters.categories)
    }
    if (filters?.sections && filters.sections.length > 0) {
        query = query.contains('section_types', filters.sections)
    }
    if (filters?.showOnOrgPage !== undefined) {
        query = query.eq('show_on_org_page', filters.showOnOrgPage)
    }

    const { data, count, error } = await query
    if (error) throw error
    return { data: data || [], count: count || 0 }
}

export async function getKnowledgebaseArticleBySlug(slug: string): Promise<KnowledgebaseArticle | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('knowledgebase_articles')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

    if (error) return null
    return data
}

export async function getKnowledgebaseFiles(articleId: string): Promise<KnowledgebaseFile[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('knowledgebase_files')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
}

// Store queries

export interface StoreProduct {
    id: string
    scope_type: 'province' | 'county' | 'group'
    scope_id: string
    title: string
    short_description: string | null
    description: string | null
    price: number
    quantity: number | null
    tags: string[]
    available_from: string | null
    available_to: string | null
    shipping_enabled: boolean
    shipping_mode: 'flat_rate' | 'per_item' | null
    shipping_cost: number | null
    published: boolean
    image_url: string | null
    created_at: string
    updated_at: string
}

// Store Stats
export interface StoreStats {
    totalProductsSold: number
    grossIncome: number
    netIncome: number
}

export async function getStoreStats(
    scopeType: 'province' | 'county' | 'group',
    scopeId: string
): Promise<StoreStats> {
    const supabase = await createClient()

    // Get all paid orders for this scope
    const { data: orders, error } = await supabase
        .from('store_orders')
        .select(`
            total_amount,
            store_order_items (
                quantity
            )
        `)
        .eq('scope_type', scopeType)
        .eq('scope_id', scopeId)
        .eq('status', 'paid')

    if (error) throw error

    let totalProductsSold = 0
    let grossIncome = 0
    let netIncome = 0

    // Standard Stripe EU Fee estimate: 1.5% + €0.25 
    // This is an ESTIMATE since we don't store exact fees
    const FEE_PERCENT = 0.015
    const FEE_FIXED = 0.25

    if (orders) {
        orders.forEach((order: any) => {
            const amount = Number(order.total_amount) || 0
            grossIncome += amount

            // Calculate est net for this order
            if (amount > 0) {
                const fee = (amount * FEE_PERCENT) + FEE_FIXED
                netIncome += Math.max(0, amount - fee)
            }

            // Count items
            if (order.store_order_items) {
                order.store_order_items.forEach((item: any) => {
                    totalProductsSold += (item.quantity || 0)
                })
            }
        })
    }

    return {
        totalProductsSold,
        grossIncome,
        netIncome
    }
}

export async function getStoreProducts(
    scopeType: 'province' | 'county' | 'group',
    scopeId: string
): Promise<StoreProduct[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .eq('scope_type', scopeType)
        .eq('scope_id', scopeId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
}

// User Account Queries

export interface UserOrganization {
    role: string
    scope_type: 'province' | 'county' | 'group'
    scope_id: string
    name: string
    slug: string
    permissions?: any
    section_name?: string // e.g. "Cubs", "Beavers"
}

export async function getUserOrganizations(userId: string): Promise<UserOrganization[]> {
    const supabase = await createClient()
    const { data: roles, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)

    if (error) throw error
    if (!roles || roles.length === 0) return []

    // Fetch details for each role
    const orgs: UserOrganization[] = []

    for (const role of roles) {
        let tableName = ''
        if (role.scope_type === 'province') tableName = 'provinces'
        if (role.scope_type === 'county') tableName = 'counties'
        if (role.scope_type === 'group') tableName = 'groups'

        if (tableName) {
            const { data: org, error: orgError } = await supabase
                .from(tableName)
                .select('name, slug')
                .eq('id', role.scope_id)
                .single()

            if (org && !orgError) {
                // If section lead, fetch section type/name
                let sectionName = undefined
                const perms = role.permissions as any
                if (perms?.section_id) {
                    const { data: section } = await supabase
                        .from('sections')
                        .select('section_type')
                        .eq('id', perms.section_id)
                        .single()
                    if (section) {
                        sectionName = section.section_type
                        // Capiltalize
                        sectionName = sectionName.charAt(0).toUpperCase() + sectionName.slice(1)
                    }
                }

                orgs.push({
                    role: role.role,
                    scope_type: role.scope_type,
                    scope_id: role.scope_id,
                    name: org.name,
                    slug: org.slug,
                    permissions: perms,
                    section_name: sectionName
                })
            }
        }
    }

    return orgs
}

export interface UserSubmission {
    id: string
    created_at: string
    status: string
    payment_status: string
    total_amount: number | null
    event_title: string
    event_slug: string
    form_title: string
}

export async function getUserSubmissions(userId: string): Promise<UserSubmission[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('form_submissions')
        .select(`
            id,
            created_at,
            submission_data,
            event_form:event_forms (
                title,
                event:events (
                    title,
                    slug
                )
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((sub: any) => ({
        id: sub.id,
        created_at: sub.created_at,
        status: sub.submission_data?.status ?? null,
        payment_status: sub.submission_data?.payment_status ?? null,
        total_amount: sub.submission_data?.total_amount ?? null,
        form_title: sub.event_form?.title || 'Unknown Form',
        event_title: sub.event_form?.event?.title || 'Unknown Event',
        event_slug: sub.event_form?.event?.slug || '#'
    }))
}

export interface UserOrder {
    id: string
    created_at: string
    status: string
    fulfillment_status: 'unfulfilled' | 'shipped' | 'returned'
    shipped_at: string | null
    shipping_details: any
    total_amount: number
    stripe_session_id: string | null
    customer_email: string
    scope_type: string
    scope_id: string
    items_count: number
    store_order_items: {
        id: string
        quantity: number
        unit_price: number
        total_price: number
        store_products: {
            title: string
        }
    }[]
}

export async function getUserOrders(userId: string): Promise<UserOrder[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('store_orders')
        .select(`
            *,
            store_order_items (
                id,
                quantity,
                unit_price,
                total_price,
                store_products (
                    title
                )
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((order: any) => ({
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        fulfillment_status: order.fulfillment_status,
        shipped_at: order.shipped_at,
        shipping_details: order.shipping_details,
        total_amount: order.total_amount,
        stripe_session_id: order.stripe_session_id,
        customer_email: order.customer_email,
        scope_type: order.scope_type,
        scope_id: order.scope_id,
        items_count: order.store_order_items?.length || 0,
        store_order_items: order.store_order_items
    }))
}
// Ticket interfaces
export interface Ticket {
    id: string
    user_id: string
    type: 'question' | 'feature_request' | 'bug_report' | 'other' | 'add_edit_organisation'
    subject: string
    description: string
    status: 'open' | 'completed'
    created_at: string
    updated_at: string
}

export interface TicketReply {
    id: string
    ticket_id: string
    user_id: string | null
    message: string
    created_at: string
}

export interface TicketFilters {
    status?: 'open' | 'completed'
    type?: 'question' | 'feature_request' | 'bug_report' | 'other'
    search?: string
}

// Ticket queries
export async function getTickets(userId: string): Promise<Ticket[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
}

export async function getAllTickets(filters?: TicketFilters): Promise<(Ticket & { user_email?: string, user_name?: string })[]> {
    const supabase = await createClient()

    // Check for sysadmin access securely using the RPC function
    // Note: The RLS policy handles the actual security, this is just for early return/logic if needed
    // But since we are calling a table that has RLS, we just query it.

    let query = supabase
        .from('tickets')
        .select(`
            *,
            profile:profiles(email, first_name, last_name)
        `)
        .order('created_at', { ascending: false })

    if (filters?.status) {
        query = query.eq('status', filters.status)
    }
    if (filters?.type) {
        query = query.eq('type', filters.type)
    }
    if (filters?.search) {
        query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    return (data || []).map((ticket: any) => ({
        ...ticket,
        user_email: ticket.profile?.email,
        user_name: ticket.profile?.first_name && ticket.profile?.last_name
            ? `${ticket.profile.first_name} ${ticket.profile.last_name}`
            : ticket.profile?.email || 'Unknown'
    }))
}

export async function getTicketById(id: string): Promise<Ticket & { user_email?: string, user_name?: string } | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('tickets')
        .select(`
            *,
            profile:profiles(email, first_name, last_name)
        `)
        .eq('id', id)
        .single()

    if (error) return null

    // console.log('[getTicketById] Ticket found:', data.id)

    return {
        ...data,
        user_email: data.profile?.email,
        user_name: data.profile?.first_name && data.profile?.last_name
            ? `${data.profile.first_name} ${data.profile.last_name}`
            : data.profile?.email || 'Unknown'
    }
}

export async function createTicket(ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<Ticket> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('tickets')
        .insert({
            ...ticket,
            status: 'open'
        })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateTicketStatus(id: string, status: 'open' | 'completed'): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
        .from('tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) throw error
}

// Reply queries
export async function getTicketReplies(ticketId: string): Promise<(TicketReply & { user_email?: string, user_name?: string, is_sysadmin?: boolean })[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ticket_replies')
        .select(`
            *,
            profile:profiles(email, first_name, last_name)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

    if (error) throw error

    // Fetch sysadmin status for each user - doing this purely via frontend checks or a separate query might be expensive
    // but the 'is_sysadmin' RPC exists.
    // However, calling RPC for each row is inefficient.
    // For now, we'll return the profile data. The UI can determine if it's the current user or an admin based on context logic if needed.
    // Or we can assume anyone replying who is NOT the ticket owner IS an admin (simplification, but mostly true in this system).

    return (data || []).map((reply: any) => ({
        ...reply,
        user_email: reply.profile?.email,
        user_name: reply.profile?.first_name && reply.profile?.last_name
            ? `${reply.profile.first_name} ${reply.profile.last_name}`
            : reply.profile?.email || 'Unknown'
    }))
}

export async function createTicketReply(reply: Omit<TicketReply, 'id' | 'created_at'>): Promise<TicketReply> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ticket_replies')
        .insert(reply)
        .select()
        .single()

    if (error) throw error
    return data
}

export interface TicketAttachment {
    id: string
    ticket_id: string
    file_name: string
    file_url: string
    file_size: number | null
    mime_type: string | null
    created_at: string
}

export async function createTicketAttachment(attachment: Omit<TicketAttachment, 'id' | 'created_at'>): Promise<TicketAttachment> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ticket_attachments')
        .insert(attachment)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function getTicketAttachments(ticketId: string): Promise<TicketAttachment[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ticket_attachments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
}
