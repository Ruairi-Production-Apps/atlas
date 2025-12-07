"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getUserOrganizations } from '@/lib/supabase/scouter-queries'
import { KnowledgebaseArticleForm } from '@/components/scouter/knowledgebase-form'

export default function NewKnowledgebaseArticlePage() {
    const supabase = createClient()
    const [organizations, setOrganizations] = useState<any[]>([])

    useEffect(() => {
        const loadOrgs = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const orgs = await getUserOrganizations(supabase)
            setOrganizations(orgs)
        }
        loadOrgs()
    }, [supabase])

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <Button variant="ghost" size="sm" asChild className="mb-4">
                    <Link href="/scouter/dashboard?tab=knowledgebase">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Create Article</h1>
                        <p className="text-muted-foreground">Draft a new knowledgebase article.</p>
                    </div>
                </div>
            </div>

            <KnowledgebaseArticleForm organizations={organizations} />
        </div>
    )
}
