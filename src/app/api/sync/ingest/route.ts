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
            default:
                return NextResponse.json<SyncResponse>(
                    { success: false, error: 'Invalid entity type' },
                    { status: 400 }
                );
        }

        if (action === 'delete') {
            // In a real scenario, we'd delete by remote_id. For now, using slug as proxy.
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('slug', data.slug);

            if (error) throw error;
        } else if (action === 'upsert') {
            // Prepare data for Hub storage
            // We might need to override the author_id or scope_id since they are foreign keys
            const hubData = {
                ...data,
                // For the Hub, we might want to preserve the original ID if we treat it as the source of truth,
                // but it's safer to let the Hub generate its own or use the remote ID.
                // For now, we'll try to keep it simple.
                scope_type: data.scope_type,
                scope_id: data.scope_id,
                // author_id might need to be nulled or set to a "System" user on the Hub
                author_id: null,
            };

            const { error } = await supabase
                .from(table)
                .upsert(hubData, { onConflict: 'slug' });

            if (error) throw error;
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
