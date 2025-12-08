"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Menu, X } from "lucide-react"

interface NavigationBarProps {
    user: any | null
    isAdmin: boolean
}

export function NavigationBar({ user, isAdmin }: NavigationBarProps) {
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
    const router = useRouter()
    const timeoutRef = React.useRef<NodeJS.Timeout>(null)

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setIsDropdownOpen(true)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsDropdownOpen(false)
        }, 150) // Small delay for usability
    }

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full border-b transition-all duration-300 ease-in-out",
                isScrolled
                    ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 shadow-sm"
                    : "bg-background py-6"
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 transition-transform duration-300">
                        <img
                            src="/images/atlas/AtlasLogo.png"
                            alt="Atlas"
                            className={cn(
                                "w-auto object-contain transition-all duration-300",
                                isScrolled ? "h-12" : "h-20"
                            )}
                        />
                        {/* Text removed as requested */}
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm font-semibold tracking-wide hover:text-primary transition-colors uppercase">
                            Home
                        </Link>
                        <Link href="/about" className="text-sm font-semibold tracking-wide hover:text-primary transition-colors uppercase">
                            About
                        </Link>
                        <Link href="/provinces" className="text-sm font-semibold tracking-wide hover:text-primary transition-colors uppercase">
                            Provinces
                        </Link>
                        <Link href="/counties" className="text-sm font-semibold tracking-wide hover:text-primary transition-colors uppercase">
                            Counties
                        </Link>
                        <Link href="/groups" className="text-sm font-semibold tracking-wide hover:text-primary transition-colors uppercase">
                            Groups
                        </Link>
                        <Link href="/events" className="text-sm font-semibold tracking-wide hover:text-primary transition-colors uppercase">
                            Events
                        </Link>
                        <Link href="/news" className="text-sm font-semibold tracking-wide hover:text-primary transition-colors uppercase">
                            News
                        </Link>
                        <Link href="/knowledgebase" className="text-sm font-semibold tracking-wide hover:text-primary transition-colors uppercase">
                            Knowledgebase
                        </Link>
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        {/* <ModeToggle /> */}{/* Hidden for now */}
                        {user ? (
                            <>
                                <Link href={isAdmin ? "/admin" : "/dashboard"} className="text-sm font-semibold hover:text-primary transition-colors mr-2">
                                    DASHBOARD
                                </Link>

                                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                                    <DropdownMenuTrigger asChild onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                                        <Button variant="ghost" size="icon" className="rounded-full cursor-pointer">
                                            <User className="h-5 w-5" />
                                            <span className="sr-only">Account</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <DropdownMenuItem asChild>
                                            <Link href="/account" className="cursor-pointer">Profile & Settings</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/tickets" className="cursor-pointer">Support Tickets</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href="/login">Log In</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/signup">Sign Up</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex items-center gap-2 md:hidden">
                        {/* <ModeToggle /> */}{/* Hidden for now */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden pt-4 pb-4 space-y-4 border-t mt-4 animate-in slide-in-from-top-2">
                        <nav className="flex flex-col gap-4">
                            <Link href="/" className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                            <Link href="/about" className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                            <Link href="/provinces" className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Provinces</Link>
                            <Link href="/counties" className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Counties</Link>
                            <Link href="/groups" className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Groups</Link>
                            <Link href="/events" className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Events</Link>
                            <Link href="/news" className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>News</Link>
                            <Link href="/knowledgebase" className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Knowledgebase</Link>
                            {user ? (
                                <>
                                    <Link href={isAdmin ? "/admin" : "/dashboard"} className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                                    <Link href="/tickets" className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Support Tickets</Link>
                                    <Link href="/account" className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>My Account</Link>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2 pt-2">
                                    <Button variant="outline" asChild onClick={() => setIsMobileMenuOpen(false)}>
                                        <Link href="/login">Log In</Link>
                                    </Button>
                                    <Button asChild onClick={() => setIsMobileMenuOpen(false)}>
                                        <Link href="/signup">Sign Up</Link>
                                    </Button>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}
