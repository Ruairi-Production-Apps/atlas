'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { cn } from '@/lib/utils'
import { useEffect, useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Iframe } from './tiptap-iframe'
import { Link as LinkIcon, Image as ImageIcon, Upload, Loader2, Code } from 'lucide-react'

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
    className?: string
}

export function RichTextEditor({
    content,
    onChange,
    placeholder = 'Start typing...',
    className,
}: RichTextEditorProps) {
    const [linkDialogOpen, setLinkDialogOpen] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(false)
    const [imageUploading, setImageUploading] = useState(false)
    const [embedDialogOpen, setEmbedDialogOpen] = useState(false)
    const [embedCode, setEmbedCode] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // @ts-ignore
                link: false,
            }),
            Placeholder.configure({
                placeholder,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: false,
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-md',
                },
            }),
            Iframe,
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: cn(
                    'focus:outline-none min-h-[200px] p-4 text-foreground',
                    '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6',
                    '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5',
                    '[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4',
                    '[&_p]:mb-4 [&_p]:leading-relaxed',
                    '[&_strong]:font-semibold',
                    '[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4',
                    '[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4',
                    '[&_li]:mb-1',
                    '[&_a]:text-primary [&_a]:underline',
                    '[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-4',
                    '[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4',
                    '[&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_code]:text-sm',
                    '[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:my-4',
                    '[&_hr]:my-6 [&_hr]:border-border',
                    '[&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-md',
                    className
                ),
            },
        },
    })

    // Update editor content when prop changes
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    const handleAddLink = () => {
        if (!editor) return

        const { from, to } = editor.state.selection
        const selectedText = editor.state.doc.textBetween(from, to)

        if (selectedText) {
            setLinkUrl('')
        } else {
            // If no text selected, use current URL if link is selected
            const attrs = editor.getAttributes('link')
            if (attrs.href) {
                setLinkUrl(attrs.href)
                setLinkOpenInNewTab(attrs.target === '_blank')
            } else {
                setLinkUrl('')
            }
        }
        setLinkDialogOpen(true)
    }

    const handleInsertLink = () => {
        if (!editor || !linkUrl.trim()) return

        const { from, to } = editor.state.selection
        const selectedText = editor.state.doc.textBetween(from, to)

        const attrs: any = { href: linkUrl }
        if (linkOpenInNewTab) {
            attrs.target = '_blank'
            attrs.rel = 'noopener noreferrer'
        }

        if (selectedText) {
            // Replace selected text with link
            editor.chain().focus().insertContent(`<a href="${linkUrl}"${linkOpenInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ''}>${selectedText}</a>`).run()
        } else {
            // Insert link at cursor
            editor.chain().focus().insertContent(`<a href="${linkUrl}"${linkOpenInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ''}>${linkUrl}</a>`).run()
        }

        setLinkDialogOpen(false)
        setLinkUrl('')
        setLinkOpenInNewTab(false)
    }

    const handleRemoveLink = () => {
        if (!editor) return
        editor.chain().focus().unsetLink().run()
    }

    const handleInsertEmbed = () => {
        if (!editor || !embedCode.trim()) return

        // Simple parser to extract src, width, height from iframe tag
        const srcMatch = embedCode.match(/src="([^"]+)"/)
        const widthMatch = embedCode.match(/width="([^"]+)"/)
        const heightMatch = embedCode.match(/height="([^"]+)"/)

        if (srcMatch && srcMatch[1]) {
            editor.chain().focus().setIframe({
                src: srcMatch[1],
                width: widthMatch ? widthMatch[1] : '100%',
                height: heightMatch ? heightMatch[1] : 400,
            }).run()
        } else {
            alert('Invalid embed code. Please paste a valid <iframe> tag.')
        }

        setEmbedDialogOpen(false)
        setEmbedCode('')
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Only images (JPEG, PNG, GIF, WebP, SVG) are allowed.')
            return
        }

        // Validate file size (10MB)
        const maxSize = 10 * 1024 * 1024
        if (file.size > maxSize) {
            alert('File size exceeds 10MB limit.')
            return
        }

        handleImageUpload(file)
    }

    const handleImageUpload = async (file: File) => {
        if (!editor) return

        setImageUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload/rich-text-image', {
                method: 'POST',
                headers: {
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload image')
            }

            // Insert image into editor
            editor.chain().focus().setImage({ src: data.url }).run()
        } catch (error: any) {
            alert(error.message || 'Failed to upload image')
        } finally {
            setImageUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    if (!editor) {
        return (
            <div className="border border-input rounded-md bg-background min-h-[200px] p-4">
                <div className="text-muted-foreground text-sm">Loading editor...</div>
            </div>
        )
    }

    const isLinkActive = editor.isActive('link')

    return (
        <div className="border border-input rounded-md bg-background">
            <div className="border-b border-input p-2 flex gap-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={cn(
                        'px-3 py-1.5 text-sm rounded hover:bg-accent cursor-pointer',
                        editor.isActive('bold') && 'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={cn(
                        'px-3 py-1.5 text-sm rounded hover:bg-accent cursor-pointer',
                        editor.isActive('italic') && 'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn(
                        'px-3 py-1.5 text-sm rounded hover:bg-accent cursor-pointer',
                        editor.isActive('heading', { level: 1 }) && 'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                >
                    H1
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn(
                        'px-3 py-1.5 text-sm rounded hover:bg-accent cursor-pointer',
                        editor.isActive('heading', { level: 2 }) && 'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                >
                    H2
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={cn(
                        'px-3 py-1.5 text-sm rounded hover:bg-accent cursor-pointer',
                        editor.isActive('heading', { level: 3 }) && 'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                >
                    H3
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn(
                        'px-3 py-1.5 text-sm rounded hover:bg-accent cursor-pointer',
                        editor.isActive('bulletList') && 'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                >
                    • List
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn(
                        'px-3 py-1.5 text-sm rounded hover:bg-accent cursor-pointer',
                        editor.isActive('orderedList') && 'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                >
                    1. List
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={cn(
                        'px-3 py-1.5 text-sm rounded hover:bg-accent cursor-pointer',
                        editor.isActive('blockquote') && 'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                >
                    "
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="px-3 py-1.5 text-sm rounded hover:bg-accent cursor-pointer"
                >
                    ─
                </button>
                <div className="border-l border-input mx-1" />
                <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            onClick={handleAddLink}
                            className={cn(
                                'px-3 py-1.5 text-sm rounded hover:bg-accent cursor-pointer flex items-center gap-1',
                                isLinkActive && 'bg-primary text-primary-foreground hover:bg-primary/90'
                            )}
                        >
                            <LinkIcon className="h-4 w-4" />
                            Link
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Link</DialogTitle>
                            <DialogDescription>
                                Enter the URL for the link. You can select text first to turn it into a link.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="link-url">URL</Label>
                                <Input
                                    id="link-url"
                                    type="url"
                                    placeholder="https://example.com"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleInsertLink()
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="open-new-tab"
                                    checked={linkOpenInNewTab}
                                    onCheckedChange={(checked) => setLinkOpenInNewTab(checked as boolean)}
                                />
                                <Label htmlFor="open-new-tab" className="cursor-pointer">
                                    Open in new tab
                                </Label>
                            </div>
                            {isLinkActive && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => {
                                        handleRemoveLink()
                                        setLinkDialogOpen(false)
                                    }}
                                >
                                    Remove Link
                                </Button>
                            )}
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setLinkDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="button" onClick={handleInsertLink} disabled={!linkUrl.trim()}>
                                    Insert Link
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={embedDialogOpen} onOpenChange={setEmbedDialogOpen}>
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            className="px-3 py-1.5 text-sm rounded hover:bg-accent cursor-pointer flex items-center gap-1"
                        >
                            <Code className="h-4 w-4" />
                            Embed
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Embed Content</DialogTitle>
                            <DialogDescription>
                                Paste an iframe code to embed content (e.g., Facebook post, YouTube video).
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="embed-code">Embed Code</Label>
                                <textarea
                                    id="embed-code"
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                    placeholder='<iframe src="..."></iframe>'
                                    value={embedCode}
                                    onChange={(e) => setEmbedCode(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setEmbedDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="button" onClick={handleInsertEmbed} disabled={!embedCode.trim()}>
                                    Embed
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    className="px-3 py-1.5 text-sm rounded hover:bg-accent cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                    {imageUploading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <ImageIcon className="h-4 w-4" />
                            Image
                        </>
                    )}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={imageUploading}
                />
            </div>
            <EditorContent editor={editor} />
        </div>
    )
}
