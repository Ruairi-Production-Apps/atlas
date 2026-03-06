"use client"

import { NewsPostForm } from "@/components/admin/news-post-form"
import { useRouter } from "next/navigation"

export default function AdminCreateNewsPage() {
    const router = useRouter()

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Create National News Post</h1>
            <div className="bg-card border rounded-lg p-6">
                <NewsPostForm
                    organizationId="00000000-0000-0000-0000-000000000000"
                    organizationType="sitewide"
                    onSuccess={() => router.push('/admin/news')}
                    onCancel={() => router.push('/admin/news')}
                />
            </div>
        </div>
    )
}
