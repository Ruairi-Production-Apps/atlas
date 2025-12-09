import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminKnowledgebaseManager } from '@/components/admin/admin-knowledgebase-manager'

export default async function AdminKnowledgebasePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Optional: Add strict admin role check here if needed
    // const { data: profile } = await supabase.from('profiles').select('system_role').eq('id', user.id).single()
    // if (profile?.system_role !== 'admin') redirect('/')

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Knowledgebase Management</h1>
            <AdminKnowledgebaseManager user={user} />
        </div>
    )
}
