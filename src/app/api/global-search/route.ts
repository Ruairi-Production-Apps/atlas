
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] })
    }

    const supabase = await createClient()
    const term = `%${query}%`

    try {
        // Run queries in parallel
        const [
            teams,
            provinces,
            counties,
            groups,
            news,
            events,
            products,
            articles
        ] = await Promise.all([
            // 0. Teams (Adventure Teams)
            supabase
                .from('adventure_teams')
                .select('id, name, slug, logo_url')
                .ilike('name', term)
                .is('deleted_at', null)
                .limit(5),
            // 1. Provinces
            supabase
                .from('provinces')
                .select('id, name, slug, logo_url')
                .ilike('name', term)
                .is('deleted_at', null)
                .limit(5),

            // 2. Counties
            supabase
                .from('counties')
                .select('id, name, slug, logo_url, province:provinces(name)')
                .ilike('name', term)
                .is('deleted_at', null)
                .limit(5),

            // 3. Groups
            supabase
                .from('groups')
                .select('id, name, slug, logo_url, county:counties(name)')
                .ilike('name', term)
                .is('deleted_at', null)
                .limit(5),

            // 4. News
            supabase
                .from('news_posts')
                .select('id, title, slug, published_at')
                .eq('published', true)
                .ilike('title', term)
                .is('deleted_at', null)
                .order('published_at', { ascending: false })
                .limit(5),

            // 5. Events
            supabase
                .from('events')
                .select('id, title, slug, start_date')
                .eq('published', true)
                .ilike('title', term)
                .is('deleted_at', null)
                .order('start_date', { ascending: true })
                .limit(5),

            // 6. Products
            supabase
                .from('store_products')
                .select('id, title')
                .eq('published', true)
                .ilike('title', term)
                .limit(5),

            // 7. Knowledgebase
            supabase
                .from('knowledgebase_articles')
                .select('id, title, slug')
                .eq('published', true)
                .ilike('title', term)
                .limit(5)
        ])

        // Format results
        const results = []

        // Orgs
        if (provinces.data) {
            results.push(...provinces.data.map(p => ({
                id: p.id,
                type: 'province',
                title: p.name,
                subtitle: 'Province',
                url: `/provinces/${p.slug}`,
                category: 'Directory',
                image: p.logo_url
            })))
        }
        if (counties.data) {
            results.push(...counties.data.map(c => ({
                id: c.id,
                type: 'county',
                title: c.name,
                subtitle: `County in ${(c.province as any)?.name}`,
                url: `/counties/${c.slug}`,
                category: 'Directory',
                image: c.logo_url
            })))
        }
        if (groups.data) {
            results.push(...groups.data.map(g => ({
                id: g.id,
                type: 'group',
                title: g.name,
                subtitle: `Group in ${(g.county as any)?.name}`,
                url: `/groups/${g.slug}`,
                category: 'Directory',
                image: g.logo_url
            })))
        }

        // Teams
        if (teams.data) {
            results.push(...teams.data.map(t => ({
                id: t.id,
                type: 'team',
                title: t.name,
                subtitle: 'Adventure Skills Team',
                url: `/teams/${t.slug}`,
                category: 'Directory',
                image: t.logo_url
            })))
        }

        // News
        if (news.data) {
            results.push(...news.data.map(n => ({
                id: n.id,
                type: 'news',
                title: n.title,
                subtitle: new Date(n.published_at!).toLocaleDateString(),
                url: `/news/${n.slug}`,
                category: 'News'
            })))
        }

        // Events
        if (events.data) {
            results.push(...events.data.map(e => ({
                id: e.id,
                type: 'event',
                title: e.title,
                subtitle: new Date(e.start_date).toLocaleDateString(),
                url: `/events/${e.slug}`,
                category: 'Events'
            })))
        }

        // Products
        if (products.data) {
            results.push(...products.data.map(p => ({
                id: p.id,
                type: 'product',
                title: p.title,
                subtitle: 'Store Product',
                url: `/store/product/${p.id}`, // Assuming this route
                category: 'Store'
            })))
        }

        // Knowledgebase
        if (articles.data) {
            results.push(...articles.data.map(a => ({
                id: a.id,
                type: 'article',
                title: a.title,
                subtitle: 'Knowledgebase Article',
                url: `/knowledgebase/${a.slug}`,
                category: 'Knowledgebase'
            })))
        }

        return NextResponse.json({ results })

    } catch (error: any) {
        console.error('Search error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
