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
import { User, Menu, X, Search } from "lucide-react"
import { GlobalSearchDialog } from "@/components/search/global-search-dialog"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & { image?: string }
>(({ className, title, children, image, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground group",
                        className
                    )}
                    {...props}
                >
                    <div className="flex items-center gap-2 mb-1">
                        {image && (
                            <img
                                src={image}
                                alt=""
                                className="h-6 w-6 object-contain"
                            />
                        )}
                        <div className="text-sm font-medium leading-none">{title}</div>
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground group-hover:text-primary-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"

interface NavigationBarProps {
    user: any | null
    isAdmin: boolean
}

export function NavigationBar({ user, isAdmin }: NavigationBarProps) {
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
    const [isSearchOpen, setIsSearchOpen] = React.useState(false)
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

                        <NavigationMenu>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent text-sm font-semibold tracking-wide hover:text-primary transition-colors uppercase h-auto px-4 py-2 cursor-pointer">
                                        Directory
                                    </NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid w-[400px] gap-3 p-4 md:w-[400px] grid-cols-1">
                                            <ListItem href="/provinces" title="Provinces" image="/images/atlas/province-badge.png">
                                                Browse scouting provinces across Ireland to find regional information.
                                            </ListItem>
                                            <ListItem href="/counties" title="Counties" image="/images/atlas/counties-badge.png">
                                                Explore counties and their local scouting activities.
                                            </ListItem>
                                            <ListItem href="/groups" title="Groups" image="/images/atlas/groups-badge.png">
                                                Find a local scout group near you to join.
                                            </ListItem>
                                            <ListItem href="/teams" title="Adventure Skills Teams" image="/images/atlas/skills-teams-badges.png">
                                                Discover expert teams for skills training and events.
                                            </ListItem>
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>

                        <Link href="/events" className="text-sm font-semibold tracking-wide hover:text-primary transition-colors uppercase">
                            Events Calendar
                        </Link>
                        <Link href="/news" className="text-sm font-semibold tracking-wide hover:text-primary transition-colors uppercase">
                            News
                        </Link>
                        <Link href="/knowledgebase" className="text-sm font-semibold tracking-wide hover:text-primary transition-colors uppercase">
                            Knowledgebase
                        </Link>
                    </nav>

                    <div className="hidden md:flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full cursor-pointer" onClick={() => setIsSearchOpen(true)}>
                            <Search className="h-5 w-5" />
                            <span className="sr-only">Search</span>
                        </Button>
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
                                        <DropdownMenuItem asChild className="focus:bg-primary focus:text-primary-foreground cursor-pointer">
                                            <Link href="/account">Profile & Settings</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="focus:bg-primary focus:text-primary-foreground cursor-pointer">
                                            <Link href="/tickets">Support Tickets</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
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
                        <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => setIsSearchOpen(true)}>
                            <Search className="h-5 w-5" />
                        </Button>
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

                            <div className="space-y-3">
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-xs">Directory</div>
                                <div className="pl-4 flex flex-col gap-3 border-l-2 border-muted ml-1">
                                    <Link href="/provinces" className="text-sm font-medium hover:text-primary block" onClick={() => setIsMobileMenuOpen(false)}>Provinces</Link>
                                    <Link href="/counties" className="text-sm font-medium hover:text-primary block" onClick={() => setIsMobileMenuOpen(false)}>Counties</Link>
                                    <Link href="/groups" className="text-sm font-medium hover:text-primary block" onClick={() => setIsMobileMenuOpen(false)}>Groups</Link>
                                    <Link href="/teams" className="text-sm font-medium hover:text-primary block" onClick={() => setIsMobileMenuOpen(false)}>Teams</Link>
                                </div>
                            </div>

                            <Link href="/events" className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Events Calendar</Link>
                            <Link href="/news" className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>News</Link>
                            <Link href="/knowledgebase" className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Knowledgebase</Link>
                            {user ? (
                                <>
                                    <div className="h-px bg-border my-2" />
                                    <Link href={isAdmin ? "/admin" : "/dashboard"} className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                                    <Link href="/tickets" className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Support Tickets</Link>
                                    <Link href="/account" className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>My Account</Link>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2 pt-2 border-t mt-2">
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
            <GlobalSearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
        </header >
    )
}
