import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/sync/sync-utils';
import { SyncPayload, SyncResponse } from '@/lib/sync/types';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const payload: SyncPayload = await req.json();
        const signature = req.headers.get('x-atlas-signature');
        const token = process.env.ATLAS_SYNC_TOKEN;

        if (!signature || !token || !verifySignature(payload, signature, token)) {
            return NextResponse.json<SyncResponse>(
                { success: false, error: 'Invalid signature or token' },
                { status: 401 }
            );
        }

        const supabase = await createClient();
        const { type, action, data, source } = payload;

        // Handle different entity types
        let table = '';
        switch (type) {
            case 'news': table = 'news_posts'; break;
            case 'event': table = 'events'; break;
            case 'knowledgebase': table = 'knowledgebase_articles'; break;
            case 'organization': table = 'synced_organizations'; break;
            default:
                return NextResponse.json<SyncResponse>(
                    { success: false, error: 'Invalid entity type' },
                    { status: 400 }
                );
        }

        if (action === 'delete') {
            // Ensure we only delete the item belonging to the source organization
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('slug', data.slug)
                .eq('scope_id', data.scope_id);

            if (error) throw error;
        } else if (action === 'upsert') {
            // Prepare data for Hub storage
            if (type === 'organization') {
                const orgData = {
                    remote_id: data.id,
                    name: data.name,
                    slug: data.slug,
                    type: data.type,
                    url: data.url,
                    site_title: data.site_title,
                    logo_url: data.logo_url,
                    contact_email: data.contact_email,
                    sections: data.sections || [],
                    last_pulsed_at: new Date().toISOString()
                };

                const { error } = await supabase
                    .from('synced_organizations')
                    .upsert(orgData, { onConflict: 'remote_id' });

                if (error) throw error;
            } else {
                const hubData = {
                    ...data,
                    scope_type: data.scope_type,
                    scope_id: data.scope_id,
                    author_id: null,
                };

                const { error } = await supabase
                    .from(table)
                    .upsert(hubData, { onConflict: 'slug,scope_id' });

                if (error) throw error;
            }
        }

        return NextResponse.json<SyncResponse>({ success: true });
    } catch (error: any) {
        console.error('[Sync Ingest Error]:', error);
        return NextResponse.json<SyncResponse>(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
