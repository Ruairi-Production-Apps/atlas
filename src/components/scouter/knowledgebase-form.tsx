"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Loader2, Save, X, Trash2, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { getUserOrganizations } from '@/lib/supabase/scouter-queries'
import { Badge } from '@/components/ui/badge'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { useToast } from '@/components/ui/use-toast'
import { KBFeaturedImageUpload } from './kb-featured-image-upload'
import { TagInput } from '@/components/ui/tag-input'
import { upsertKnowledgebaseArticle } from '@/app/(main)/scouter/knowledgebase/actions'

interface KnowledgebaseArticleFormProps {
    article?: any
    organizations: any[]
}

export function KnowledgebaseArticleForm({ article, organizations }: KnowledgebaseArticleFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    // Form State
    const [title, setTitle] = useState(article?.title || '')
    const [description, setDescription] = useState(article?.description || '')
    const [scopeType, setScopeType] = useState<string>(article?.scope_type || '')
    const [scopeId, setScopeId] = useState<string>(article?.scope_id || '')
    const [body, setBody] = useState(article?.body || '')
    const [tags, setTags] = useState<string[]>(article?.tags || [])
    const [categories, setCategories] = useState<string[]>(article?.categories || [])
    const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(article?.featured_image_url || null)
    const [published, setPublished] = useState(article?.published || false)
    const [showOnOrgPage, setShowOnOrgPage] = useState<boolean>(article?.show_on_org_page ?? true)

    // Sections Selection
    const [selectedSections, setSelectedSections] = useState<string[]>(article?.section_types || [])

    // Adventure Skill
    const [adventureSkill, setAdventureSkill] = useState<string>(article?.adventure_skill || '')

    // Files State
    const [existingFiles, setExistingFiles] = useState<any[]>(article?.knowledgebase_files || [])
    const [newFiles, setNewFiles] = useState<{ file: File, is_embedded: boolean }[]>([])

    // Initialize scope if creating new and orgs exist
    useEffect(() => {
        if (!article && organizations.length > 0 && !scopeId) {
            setScopeType(organizations[0].type)
            setScopeId(organizations[0].id)
        }
    }, [article, organizations, scopeId])

    const handleTagsChange = (newTags: string[]) => {
        setTags(newTags)
    }

    const handleNewFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesToAdd = Array.from(e.target.files).map(file => ({
                file,
                is_embedded: false
            }))
            setNewFiles(prev => [...prev, ...filesToAdd])
        }
    }

    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index))
    }

    const toggleNewFileEmbed = (index: number, checked: boolean) => {
        setNewFiles(prev => prev.map((item, i) =>
            i === index ? { ...item, is_embedded: checked } : item
        ))
    }

    const toggleExistingFileEmbed = async (fileId: string, checked: boolean) => {
        // Optimistic update
        setExistingFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, is_embedded: checked } : f
        ))

        try {
            const { error } = await supabase
                .from('knowledgebase_files')
                .update({ is_embedded: checked })
                .eq('id', fileId)

            if (error) throw error
        } catch (error) {
            console.error('Error updating file embed status:', error)
            toast({ variant: "destructive", title: "Error", description: "Failed to update embed status" })
            // Revert on error
            setExistingFiles(prev => prev.map(f =>
                f.id === fileId ? { ...f, is_embedded: !checked } : f
            ))
        }
    }

    const handleDeleteExistingFile = async (fileId: string, fileName: string) => {
        if (!confirm(`Are you sure you want to delete ${fileName}?`)) return

        try {
            // Delete from Storage first functionality not fully implemented strictly requiring path, 
            // but we can delete the record which cascades if we wanted, or kept it simple.
            // For now, we just delete the DB record.
            const { error } = await supabase
                .from('knowledgebase_files')
                .delete()
                .eq('id', fileId)

            if (error) throw error

            setExistingFiles(prev => prev.filter(f => f.id !== fileId))
            toast({ title: "File Deleted", description: "File removed successfully" })
        } catch (error: any) {
            console.error('Error deleting file:', error)
            toast({ variant: "destructive", title: "Error", description: "Failed to delete file" })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            if (!scopeId || !scopeType) {
                alert("Please select an organization")
                return
            }

            const articleData = {
                title,
                description,
                body,
                tags,
                categories,
                section_types: selectedSections,
                adventure_skill: adventureSkill || null,
                scope_type: scopeType,
                scope_id: scopeId,
                featured_image_url: featuredImageUrl,
                published,
                published_at: published ? (article?.published_at || new Date().toISOString()) : null,
                author_id: user.id,
                show_on_org_page: showOnOrgPage
            }

            let savedArticleId = article?.id

            const savedArticle = await upsertKnowledgebaseArticle(articleData, article?.id)
            savedArticleId = savedArticle.id

            // Handle New File Uploads
            if (newFiles.length > 0 && savedArticleId) {
                for (const newFileItem of newFiles) {
                    const file = newFileItem.file
                    const fileExt = file.name.split('.').pop()
                    const filePath = `${savedArticleId}/${Math.random().toString(36).substring(7)}.${fileExt}`

                    // Upload to Storage
                    const { error: uploadError } = await supabase.storage
                        .from('knowledgebase-files')
                        .upload(filePath, file)

                    if (uploadError) {
                        console.error('Error uploading file:', uploadError)
                        toast({ variant: "destructive", title: "Upload Error", description: `Failed to upload ${file.name}` })
                        continue
                    }

                    // Get Public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('knowledgebase-files')
                        .getPublicUrl(filePath)

                    // Save to DB
                    const { error: fileDbError } = await supabase
                        .from('knowledgebase_files')
                        .insert({
                            article_id: savedArticleId,
                            file_name: file.name,
                            file_path: filePath, // Added newly
                            file_url: publicUrl,
                            file_size: file.size,
                            mime_type: file.type,
                            is_embedded: newFileItem.is_embedded
                        })

                    if (fileDbError) {
                        console.error('Error saving file record:', fileDbError)
                        toast({ variant: "destructive", title: "Database Error", description: `Failed to save record for ${file.name}` })
                    }
                }
            }

            toast({
                title: "Success",
                description: article ? "Article updated successfully." : "Article created successfully.",
            })

            // Refresh or Redirect
            if (article) {
                setNewFiles([])
                // Optionally reload data? But we might just redirect or stay.
                // For now, we manually reload window or router refresh?
                // router.refresh() 
                // But better to clear new files and maybe fetch latest file list if we stayed.
                // The parent edit page logic did loadData(). 
                // We'll just refresh via router for simplicity.
                router.refresh()
            } else {
                router.push(`/scouter/knowledgebase/${savedArticleId}/edit`)
            }

        } catch (error: any) {
            console.error('Error saving article:', error)
            toast({ variant: "destructive", title: "Error", description: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{article ? 'Edit Article' : 'Article Details'}</CardTitle>
                <CardDescription>
                    {article ? 'Manage article content and files.' : 'Basic information about this article.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Featured Image */}
                    {scopeId && (
                        <div className="space-y-2 border p-4 rounded-md bg-muted/20">
                            <KBFeaturedImageUpload
                                organizationId={scopeId}
                                organizationType={scopeType as any} // Cast safely as types align
                                eventId={article?.id || null}
                                currentImageUrl={featuredImageUrl}
                                onImageUpdate={setFeaturedImageUrl}
                                isDraft={!article?.id} // Add explicit draft mode flag if needed or handle internal upload logic
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g., How to set up a tent"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Short Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Brief summary shown in lists..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="body">Content</Label>
                        <RichTextEditor
                            content={body}
                            onChange={(content) => setBody(content)}
                            placeholder="Enter the full article content..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <TagInput
                            selectedTags={tags}
                            onTagsChange={handleTagsChange}
                            placeholder="Select or create tags..."
                        />
                    </div>

                    {/* Categories Multi-Select */}
                    <div className="space-y-2 border p-4 rounded-md bg-muted/20">
                        <Label className="mb-2 block">Categories</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {['Adventure Skills', 'ONE Programme', 'Training', 'Games', 'Youth Programme', 'Book/Guide', 'Session Plan', 'Safeguarding', 'Other'].map((category) => (
                                <div key={category} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`category-${category}`}
                                        checked={categories.includes(category)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setCategories(prev => [...prev, category])
                                            } else {
                                                setCategories(prev => prev.filter(c => c !== category))
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor={`category-${category}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {category}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="scope">Publish As</Label>
                        <Select
                            value={scopeType === 'sitewide' ? 'sitewide' : scopeId}
                            onValueChange={(val) => {
                                setScopeId(val)
                                const org = organizations.find(o => o.id === val)
                                if (val === 'sitewide') {
                                    setScopeType('sitewide')
                                    // For sitewide, we can typically use a 'zero' UUID or a specific system UUID.
                                    // For simplicity, we'll use the user's ID or a constant system ID if we had one.
                                    // Using a zero UUID is a common convention for "no specific parent".
                                    setScopeId('00000000-0000-0000-0000-000000000000')
                                } else if (org) {
                                    setScopeType(org.type)
                                    setScopeId(val)
                                }
                            }}
                            disabled={!!article} // Usually scope shouldn't change after creation easily, or maybe it can?
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Organization" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sitewide">
                                    Sitewide (All Users)
                                </SelectItem>
                                {organizations.map(org => (
                                    <SelectItem key={org.id} value={org.id}>
                                        {org.name} ({org.type})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Section Types Selector */}
                    <div className="space-y-2 border p-4 rounded-md bg-muted/20">
                        <Label className="mb-2 block">Applicable Sections (Optional)</Label>
                        <div className="grid grid-cols-2 gap-4">
                            {['Beavers', 'Cubs', 'Scouts', 'Ventures', 'Rovers'].map((section) => (
                                <div key={section} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`section-${section}`}
                                        checked={selectedSections.includes(section)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedSections(prev => [...prev, section])
                                            } else {
                                                setSelectedSections(prev => prev.filter(s => s !== section))
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor={`section-${section}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {section}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Adventure Skills Selector */}
                    <div className="space-y-2 border p-4 rounded-md bg-muted/20">
                        <Label htmlFor="adventureSkill">Adventure Skill (Optional)</Label>
                        <Select
                            value={adventureSkill || "None"}
                            onValueChange={(val) => setAdventureSkill(val === "None" ? "" : val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Adventure Skill" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="None">None</SelectItem>
                                {['Camping', 'Emergencies', 'Hillwalking', 'Backwoods', 'Pioneering', 'Rowing', 'Paddling', 'Air', 'Sailing'].map(skill => (
                                    <SelectItem key={skill} value={skill}>
                                        {skill}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Published Status */}
                    <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="published"
                                checked={published}
                                onCheckedChange={(checked) => setPublished(checked as boolean)}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <label
                                    htmlFor="published"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    Publish Article
                                </label>
                                <p className="text-sm text-muted-foreground">
                                    Make this article visible to other users immediately.
                                </p>
                            </div>
                        </div>

                        {/* Show on Org Page Option (Only show if not sitewide) */}
                        {scopeType !== 'sitewide' && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="showOnOrgPage"
                                    checked={showOnOrgPage}
                                    onCheckedChange={(checked) => setShowOnOrgPage(checked as boolean)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <label
                                        htmlFor="showOnOrgPage"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        Display on Organization Page
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                        If checked, this article will appear on the Knowledgebase tab of the selected organization's page.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* File Upload Section */}
                    <div className="space-y-4">
                        <Label>Files & Attachments</Label>

                        {/* Existing Files List */}
                        {existingFiles.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Attached Files:</p>
                                {existingFiles.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/10">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText className="h-4 w-4 shrink-0 text-primary" />
                                            <div className="flex flex-col">
                                                <a href={file.file_url} target="_blank" rel="noreferrer" className="text-sm hover:underline truncate">
                                                    {file.file_name}
                                                </a>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Checkbox
                                                        id={`existing-embed-${file.id}`}
                                                        checked={file.is_embedded}
                                                        onCheckedChange={(checked) => toggleExistingFileEmbed(file.id, checked as boolean)}
                                                        className="h-3.5 w-3.5"
                                                    />
                                                    <Label htmlFor={`existing-embed-${file.id}`} className="text-xs text-muted-foreground font-normal cursor-pointer">
                                                        Embed
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDeleteExistingFile(file.id, file.file_name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* New Files List (Pending Upload) */}
                        {newFiles.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">New Files to Upload:</p>
                                {newFiles.map((item, index) => (
                                    <div key={index} className="flex flex-col gap-2 p-3 border rounded-md bg-muted/20">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium truncate">{item.file.name}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeNewFile(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`embed-${index}`}
                                                checked={item.is_embedded}
                                                onCheckedChange={(checked) => toggleNewFileEmbed(index, checked as boolean)}
                                            />
                                            <label htmlFor={`embed-${index}`} className="text-xs text-muted-foreground cursor-pointer">
                                                Embed in article view (Images/PDF only)
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Input
                                id="file-upload"
                                type="file"
                                multiple
                                onChange={handleNewFileSelect}
                                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
                            />
                            <p className="text-xs text-muted-foreground">
                                Upload images, PDFs, or documents. Check "Embed" to display them inline on the article page.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-end pt-6">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/scouter/dashboard?tab=knowledgebase">
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Saving...' : (article ? 'Update Article' : 'Create Article')}
                        </Button>
                    </div>

                </form>
            </CardContent>
        </Card>
    )
}
