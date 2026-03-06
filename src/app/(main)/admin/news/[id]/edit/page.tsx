import { createClient } from "@/lib/supabase/server"
import { AdminEditNewsClient } from "./client"
import { notFound } from "next/navigation"

export default async function AdminEditNewsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: post } = await supabase
        .from('news_posts')
        .select('*')
        .eq('id', id)
        .single()

    if (!post) {
        return notFound()
    }

    return <AdminEditNewsClient post={post} />
}
