import Link from 'next/link'

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-bold text-lg mb-4">Atlas</h3>
                        <p className="text-sm text-muted-foreground">
                            A platform for Scouts to plan and manage their activities.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/provinces" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Provinces
                                </Link>
                            </li>
                            <li>
                                <Link href="/counties" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Counties
                                </Link>
                            </li>
                            <li>
                                <Link href="/groups" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Groups
                                </Link>
                            </li>
                            <li>
                                <Link href="/events" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Events
                                </Link>
                            </li>
                            <li>
                                <Link href="/events" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Events
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-4">Contact</h3>
                        <p className="text-sm text-muted-foreground">
                            Email: info@scouthub.ie
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Atlas. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
