'use server'

import { createClient } from '@/lib/supabase/server'
import { syncToHub } from '@/lib/sync/sync-service'
import { revalidatePath } from 'next/cache'

export async function upsertKnowledgebaseArticle(data: any, articleId?: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    let result;
    if (articleId) {
        // Update
        const { data: updated, error } = await supabase
            .from('knowledgebase_articles')
            .update(data)
            .eq('id', articleId)
            .select()
            .single()

        if (error) throw error
        result = updated
    } else {
        // Create
        const { data: inserted, error } = await supabase
            .from('knowledgebase_articles')
            .insert(data)
            .select()
            .single()

        if (error) throw error
        result = inserted
    }

    // Sync to Hub
    if (result && result.published) {
        await syncToHub('knowledgebase', 'upsert', result)
    } else if (result && !result.published && articleId) {
        await syncToHub('knowledgebase', 'delete', result)
    }

    revalidatePath('/scouter/knowledgebase')
    return result
}

export async function deleteKnowledgebaseArticle(articleId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Get slug for sync delete
    const { data: article } = await supabase
        .from('knowledgebase_articles')
        .select('slug')
        .eq('id', articleId)
        .single()

    const { error } = await supabase
        .from('knowledgebase_articles')
        .delete()
        .eq('id', articleId)

    if (error) throw error

    // Sync to Hub
    if (article) {
        await syncToHub('knowledgebase', 'delete', article)
    }

    revalidatePath('/scouter/knowledgebase')
    return { success: true }
}
