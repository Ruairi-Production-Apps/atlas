"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import { getUserOrganizations } from '@/lib/supabase/scouter-queries'
import { KnowledgebaseArticleForm } from '@/components/scouter/knowledgebase-form'

export default function EditKnowledgebaseArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [article, setArticle] = useState<any>(null)
    const [organizations, setOrganizations] = useState<any[]>([])

    useEffect(() => {
        const loadData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/login')
                    return
                }

                // Load Organizations
                const orgs = await getUserOrganizations(supabase)
                setOrganizations(orgs)

                // Load Article
                const { data, error } = await supabase
                    .from('knowledgebase_articles')
                    .select('*, knowledgebase_files(*)')
                    .eq('id', id)
                    .single()

                if (error) throw error
                setArticle(data)

            } catch (error) {
                console.error('Error loading article:', error)
                // toast error? useToast is not imported here but handled in form?
                // Ideally we show error page or redirect
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [id, router, supabase])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner size={40} />
            </div>
        )
    }

    if (!article) {
        return <div>Article not found</div>
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <Button variant="ghost" size="sm" asChild className="mb-4">
                    <Link href="/dashboard?tab=knowledgebase">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Knowledge Base
                    </Link>
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Edit Article</h1>
                        <p className="text-muted-foreground">Update content and manage files.</p>
                    </div>
                </div>
            </div>

            <KnowledgebaseArticleForm article={article} organizations={organizations} />
        </div>
    )
}
