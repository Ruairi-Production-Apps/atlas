import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { APP_CONFIG, isInstance } from '@/lib/config/app-config'

export async function GET() {
    try {
        const supabase = await createClient()

        // Fetch public site settings for branding/context
        const { data: settings } = await supabase
            .from('site_settings')
            .select('site_title, primary_color, scope_type, scope_id')
            .eq('is_initialized', true)
            .maybeSingle()

        // Fetch upcoming public events
        let query = supabase
            .from('events')
            .select(`
                id,
                title,
                slug,
                start_date,
                end_date,
                location,
                price,
                description:body,
                scope_type,
                scope_id,
                visibility,
                category
            `)
            .eq('published', true)
            .eq('visibility', 'open_to_all')
            .gte('start_date', new Date().toISOString())
            .order('start_date', { ascending: true })
            .limit(50)

        // If in instance mode, filter by this org
        if (isInstance() && APP_CONFIG.homeOrgId) {
            query = query.eq('scope_id', APP_CONFIG.homeOrgId)
        }

        const { data: events, error } = await query

        if (error) throw error

        return NextResponse.json({
            meta: {
                origin: settings?.site_title || "Atlas Instance",
                scope_type: settings?.scope_type,
                scope_id: settings?.scope_id,
                generated_at: new Date().toISOString(),
                is_standalone: true
            },
            events: events || []
        })
    } catch (error: any) {
        console.error('Federation Feed Error:', error)
        return NextResponse.json({ error: 'Failed to fetch events feed' }, { status: 500 })
    }
}
