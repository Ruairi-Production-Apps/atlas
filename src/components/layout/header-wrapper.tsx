import { Header } from './header'

export async function HeaderWrapper() {
    try {
        return <Header />
    } catch (error: any) {
        // If Header fails, render a basic header without auth
        return (
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <a href="/" className="text-2xl font-bold text-primary">
                            Scout Hub
                        </a>
                        <nav className="hidden md:flex items-center gap-6">
                            <a href="/" className="text-sm font-medium hover:text-primary transition-colors">
                                Home
                            </a>
                            <a href="/provinces" className="text-sm font-medium hover:text-primary transition-colors">
                                Provinces
                            </a>
                            <a href="/counties" className="text-sm font-medium hover:text-primary transition-colors">
                                Counties
                            </a>
                            <a href="/groups" className="text-sm font-medium hover:text-primary transition-colors">
                                Groups
                            </a>
                            <a href="/events" className="text-sm font-medium hover:text-primary transition-colors">
                                Events
                            </a>
                            <a href="/news" className="text-sm font-medium hover:text-primary transition-colors">
                                News
                            </a>
                            <a href="/knowledgebase" className="text-sm font-medium hover:text-primary transition-colors">
                                Knowledgebase
                            </a>
                        </nav>
                        <div className="flex items-center gap-2">
                            <a href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                                Login
                            </a>
                            <a href="/signup" className="text-sm font-medium hover:text-primary transition-colors">
                                Sign Up
                            </a>
                        </div>
                    </div>
                </div>
            </header>
        )
    }
}

