"use client"

import { NewsPostForm } from "@/components/admin/news-post-form"
import { useRouter } from "next/navigation"

interface AdminEditNewsClientProps {
    post: any // Using any for simplicity as NewsPostForm type matches
}

export function AdminEditNewsClient({ post }: AdminEditNewsClientProps) {
    const router = useRouter()

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Edit News Post: {post.title}</h1>
            <div className="bg-card border rounded-lg p-6">
                <NewsPostForm
                    organizationId={post.scope_id}
                    organizationType={post.scope_type}
                    post={post}
                    onSuccess={() => router.push('/admin/news')}
                    onCancel={() => router.push('/admin/news')}
                />
            </div>
        </div>
    )
}
