import { cn } from '@/lib/utils'

interface RichTextContentProps {
    content: string
    className?: string
}

export function RichTextContent({ content, className }: RichTextContentProps) {
    if (!content) return null

    return (
        <div
            className={cn(
                'text-foreground',
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
            )}
            dangerouslySetInnerHTML={{ __html: content }}
        />
    )
}
