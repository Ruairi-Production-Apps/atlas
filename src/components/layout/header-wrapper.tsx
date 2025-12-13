import { Header } from './header'

export async function HeaderWrapper() {
    try {
        return await Header()
    } catch (error: any) {
        console.error('[HeaderWrapper] Unexpected error:', error)
        // If Header really fails (shouldn't happen with the fix), render a basic header
        return (
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <a href="/" className="text-2xl font-bold text-primary">
                            Atlas
                        </a>
                    </div>
                </div>
            </header>
        )
    }
}

