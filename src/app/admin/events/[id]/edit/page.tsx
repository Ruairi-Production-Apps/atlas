import { createClient } from "@/lib/supabase/server"
import { AdminEditEventClient } from "./client"
import { notFound } from "next/navigation"

export default async function AdminEditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()

    if (!event) {
        return notFound()
    }

    return <AdminEditEventClient event={event} />
}
