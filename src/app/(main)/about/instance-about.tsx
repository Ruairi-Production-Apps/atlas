'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { updateAboutPageContent } from '@/app/(main)/scouter/site-settings/actions'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

interface InstanceAboutProps {
    settingsId: string
    content: string
    siteTitle: string
}

export function InstanceAbout({ settingsId, content, siteTitle }: InstanceAboutProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(content)
    const [loading, setLoading] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        async function checkAdmin() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data: roles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
            if (roles?.some(r => r.role === 'sysadmin' || r.role === 'admin')) {
                setIsAdmin(true)
            }
        }
        checkAdmin()
    }, [])

    const handleSave = async () => {
        setLoading(true)
        try {
            await updateAboutPageContent(settingsId, editContent)
            toast({ title: "About page updated", description: "Changes are now live." })
            setIsEditing(false)
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-24 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold tracking-tight">About {siteTitle}</h1>
                {isAdmin && !isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <RichTextEditor
                        content={editContent}
                        onChange={setEditContent}
                        placeholder="Write about your organization..."
                        className="min-h-[400px]"
                    />
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => { setIsEditing(false); setEditContent(content) }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="prose prose-lg max-w-none dark:prose-invert">
                    {content ? (
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                    ) : (
                        <p className="text-muted-foreground text-lg">
                            {isAdmin
                                ? 'No content yet. Click "Edit" to add information about your organization.'
                                : `Welcome to ${siteTitle}.`
                            }
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
