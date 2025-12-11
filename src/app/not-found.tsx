import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Force dynamic rendering to support the dynamic Header (which uses cookies)
export const dynamic = 'force-dynamic'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
            <h2 className="text-4xl font-bold tracking-tight">404 - Not Found</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
            </p>
            <div className="flex gap-4 mt-4">
                <Button variant="outline" asChild>
                    <Link href="javascript:history.back()">Go Back</Link>
                </Button>
                <Button asChild>
                    <Link href="/">Return Home</Link>
                </Button>
            </div>
        </div>
    )
}
