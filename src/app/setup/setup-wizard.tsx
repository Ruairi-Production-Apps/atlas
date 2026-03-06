"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search, Building2, Map, Globe, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { initializeInstance, getOrganizationsByType, SetupData, getDbStatus, runDbInitialization, checkSysadminExists, runDbReset } from "./actions"
import { useRouter } from "next/navigation"

export function InstanceSetupWizard() {
    const [step, setStep] = useState(0) // Start at DB check
    const [dbHealthy, setDbHealthy] = useState(false)
    const [needsAdmin, setNeedsAdmin] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const [data, setData] = useState<SetupData>({
        orgType: 'group',
        orgId: '',
        name: '',
        slug: '',
        siteTitle: '',
        syncEnabled: true,
        adminEmail: '',
        adminPassword: '',
        adminName: ''
    })

    const [orgs, setOrgs] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")

    // Check DB status and admin status on mount
    useEffect(() => {
        const checkStatus = async () => {
            const status = await getDbStatus()

            if (status.isFullyInitialized) {
                router.push('/dashboard')
                return
            }

            if (status.tablesExist) {
                setDbHealthy(true)
                try {
                    const adminExists = await checkSysadminExists()
                    setNeedsAdmin(!adminExists)
                } catch (e) {
                    // If user_roles table missing or other DB error, assume we need an admin
                    console.error('Error checking admin status:', e)
                    setNeedsAdmin(true)
                }
                setStep(1)
            } else {
                setDbHealthy(false)
                setStep(0)
            }
        }

        checkStatus()
    }, [router])

    // Fetch orgs when type changes
    useEffect(() => {
        if (step === 2) {
            setLoading(true)
            getOrganizationsByType(data.orgType)
                .then(setOrgs)
                .catch(err => setError(err.message))
                .finally(() => setLoading(false))
        }
    }, [data.orgType, step])

    const filteredOrgs = orgs.filter(o =>
        o.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleNext = () => {
        if (step === 1 && !data.orgType) return
        if (step === 2 && (!data.name || !data.slug)) return
        if (step === 3) {
            if (needsAdmin) {
                setStep(4)
            } else {
                setStep(5)
            }
            return
        }
        if (step === 4 && (!data.adminEmail || !data.adminPassword)) return
        setStep(step + 1)
    }

    const handleBack = () => {
        if (step === 5 && !needsAdmin) {
            setStep(3)
        } else {
            setStep(step - 1)
        }
    }

    const handleComplete = async () => {
        setLoading(true)
        setError(null)
        try {
            // Auto-generate site title if missing
            const finalData = { ...data, siteTitle: data.siteTitle || data.name };
            await initializeInstance(finalData)
            setStep(6) // Success step
            setTimeout(() => {
                router.push('/dashboard')
                router.refresh()
            }, 3000)
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    const handleInitDb = async () => {
        setLoading(true)
        setError(null)
        try {
            await runDbInitialization()
            setDbHealthy(true)

            // Wait slightly for PostgREST cache to catch up
            await new Promise(resolve => setTimeout(resolve, 800))

            // Re-check admin status after DB is ready
            const adminExists = await checkSysadminExists()
            setNeedsAdmin(!adminExists)

            setStep(1)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const steps = []
    if (!dbHealthy) steps.push(0)
    steps.push(1, 2, 3)
    if (needsAdmin) steps.push(4)
    steps.push(5)

    return (
        <div className="w-full min-h-screen bg-white flex flex-col">
            {/* Main Header Section */}
            <div className="w-full bg-slate-50 border-b py-12 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <img src="/images/atlas/AtlasLogo.png" alt="Atlas" className="h-20 mx-auto mb-6" />
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl">Instance Setup</h1>
                    <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">Configure your branding and connectivity to the Atlas Hub.</p>

                    {/* Stepper - centered in the header area */}
                    <div className="mt-12 flex justify-center pb-4 overflow-visible">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {steps.map((i, idx) => (
                                <div key={i} className="flex items-center">
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center border-2 text-base font-bold transition-all shadow-sm",
                                        step === i ? "border-primary bg-primary text-white" :
                                            step > i ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white text-slate-400"
                                    )}>
                                        {step > i ? <CheckCircle2 className="w-6 h-6" /> : i}
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div className={cn(
                                            "w-12 sm:w-24 h-1 mx-2 rounded-full transition-colors",
                                            step > i ? "bg-primary" : "bg-slate-200"
                                        )} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area - Wide & Airy */}
            <div className="flex-grow w-full py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    {error && (
                        <div className="mb-10 p-6 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                            <ShieldCheck className="w-6 h-6 shrink-0" />
                            <div className="font-semibold text-base">{error}</div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Main Step Content */}
                        <div className="lg:col-span-12">
                            {step === 0 && (
                                <Card className="shadow-2xl border-none ring-1 ring-slate-200 rounded-3xl overflow-hidden">
                                    <CardHeader>
                                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <CardTitle>Database Setup</CardTitle>
                                        <CardDescription>We need to prepare your Supabase database. If you have a partial setup, you may need to reset it first.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            This will create the core tables (settings, groups, roles, and profiles).
                                        </p>
                                    </CardContent>
                                    <CardFooter className="flex flex-col gap-3">
                                        <Button className="w-full" onClick={handleInitDb} disabled={loading}>
                                            {loading ? <><Loader2 className="animate-spin mr-2 w-4 h-4" /> Initializing...</> : "Initialize Database"}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full text-xs text-muted-foreground hover:text-destructive"
                                            onClick={async () => {
                                                if (confirm("DANGER: This will wipe your Atlas tables and start fresh. Continue?")) {
                                                    setLoading(true)
                                                    await runDbReset()
                                                    window.location.reload()
                                                }
                                            }}
                                            disabled={loading}
                                        >
                                            Wipe Database & Reset Setup
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )}

                            {step === 1 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Organization Type</CardTitle>
                                        <CardDescription>What kind of entity does this Atlas instance represent?</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <RadioGroup
                                            value={data.orgType}
                                            onValueChange={(val: any) => setData({ ...data, orgType: val })}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            {[
                                                { id: 'group', name: 'Group', desc: 'A local Scouting group', icon: Building2 },
                                                { id: 'county', name: 'County', desc: 'A Scouting county', icon: Map },
                                                { id: 'province', name: 'Province', desc: 'A Scouting province', icon: Globe },
                                                { id: 'adventure_team', name: 'Skill Team', desc: 'An Adventure Skills team', icon: ShieldCheck },
                                            ].map((item) => (
                                                <Label
                                                    key={item.id}
                                                    className={cn(
                                                        "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer",
                                                        data.orgType === item.id && "border-primary"
                                                    )}
                                                >
                                                    <RadioGroupItem value={item.id} className="sr-only" />
                                                    <item.icon className="mb-3 h-6 w-6" />
                                                    <span className="font-semibold">{item.name}</span>
                                                    <span className="text-xs text-muted-foreground text-center mt-1">{item.desc}</span>
                                                </Label>
                                            ))}
                                        </RadioGroup>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full" onClick={handleNext}>Continue <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                    </CardFooter>
                                </Card>
                            )}

                            {step === 2 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Organization Details</CardTitle>
                                        <CardDescription>Enter the primary details for your {data.orgType.replace('_', ' ')}.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Organization Name</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const slug = val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                                    setData({ ...data, name: val, slug: slug, siteTitle: data.siteTitle || val });
                                                }}
                                                placeholder="e.g. 1st Kilcoona Scouts"
                                            />
                                            <p className="text-xs text-muted-foreground italic">We'll use this to set up your URLs and branding.</p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between gap-4">
                                        <Button variant="outline" onClick={handleBack}>Back</Button>
                                        <Button className="flex-grow" onClick={handleNext} disabled={!data.name || !data.slug}>Continue <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                    </CardFooter>
                                </Card>
                            )}

                            {step === 3 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Branding & Basic Setup</CardTitle>
                                        <CardDescription>How should your site appear to users?</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="siteTitle">Site Title</Label>
                                            <Input
                                                id="siteTitle"
                                                value={data.siteTitle}
                                                onChange={(e) => setData({ ...data, siteTitle: e.target.value })}
                                                placeholder="e.g. 1st Irish Scouting Group"
                                            />
                                            <p className="text-xs text-muted-foreground">This appears in the browser tab and header.</p>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-0.5">
                                                <Label>Sync to Atlas Hub</Label>
                                                <p className="text-xs text-muted-foreground">List your organization in the central directory. Later you can choose to list specific events, news, and resources there too.</p>
                                            </div>
                                            <Switch
                                                checked={data.syncEnabled}
                                                onCheckedChange={(val) => setData({ ...data, syncEnabled: val })}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between gap-4">
                                        <Button variant="outline" onClick={handleBack}>Back</Button>
                                        <Button className="flex-grow" onClick={handleNext}>Confirm Details <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                    </CardFooter>
                                </Card>
                            )}

                            {step === 4 && (
                                <Card>
                                    <CardHeader>
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <CardTitle>Administrative Account</CardTitle>
                                        <CardDescription>Create your primary system administrator account.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="adminName">Full Name</Label>
                                            <Input
                                                id="adminName"
                                                value={data.adminName}
                                                onChange={(e) => setData({ ...data, adminName: e.target.value })}
                                                placeholder="e.g. Ruairi McNamee"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="adminEmail">Email Address</Label>
                                            <Input
                                                id="adminEmail"
                                                type="email"
                                                value={data.adminEmail}
                                                onChange={(e) => setData({ ...data, adminEmail: e.target.value })}
                                                placeholder="admin@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="adminPassword">Password</Label>
                                            <Input
                                                id="adminPassword"
                                                type="password"
                                                value={data.adminPassword}
                                                onChange={(e) => setData({ ...data, adminPassword: e.target.value })}
                                                placeholder="••••••••"
                                            />
                                            <p className="text-xs text-muted-foreground">Minimum 8 characters. You'll use this to log in to the dashboard.</p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between gap-4">
                                        <Button variant="outline" onClick={handleBack}>Back</Button>
                                        <Button className="flex-grow" onClick={handleNext} disabled={!data.adminEmail || !data.adminPassword}>Confirm Admin <ChevronRight className="ml-2 w-4 h-4" /></Button>
                                    </CardFooter>
                                </Card>
                            )}

                            {step === 5 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Ready to Launch?</CardTitle>
                                        <CardDescription>Review your settings before initializing the instance.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-muted-foreground">Organization:</span><span className="font-medium">{data.name}</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="font-medium capitalize">{data.orgType.replace('_', ' ')}</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">Site Title:</span><span className="font-medium">{data.siteTitle}</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">Hub Sync:</span><span className="font-medium">{data.syncEnabled ? "Enabled" : "Disabled"}</span></div>
                                            {needsAdmin && (
                                                <div className="flex justify-between border-t pt-2 mt-2"><span className="text-muted-foreground">Admin User:</span><span className="font-medium">{data.adminEmail}</span></div>
                                            )}
                                        </div>
                                        <p className="text-xs text-center text-muted-foreground px-4">
                                            By clicking Initialize, we will set up your local branding and prepare your Atlas instance for use.
                                        </p>
                                    </CardContent>
                                    <CardFooter className="flex flex-col gap-4">
                                        <Button className="w-full py-6 text-lg" onClick={handleComplete} disabled={loading}>
                                            {loading ? <><Loader2 className="animate-spin mr-2 w-5 h-5" /> Initializing...</> : "Initialize Atlas Instance"}
                                        </Button>
                                        <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleBack} disabled={loading}>Back</Button>
                                    </CardFooter>
                                </Card>
                            )}

                            {step === 6 && (
                                <Card className="text-center py-12 rounded-3xl shadow-xl border-none ring-1 ring-slate-100 mt-12">
                                    <CardContent className="space-y-6 pt-12">
                                        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto transition-all animate-bounce">
                                            <CheckCircle2 className="w-12 h-12" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-slate-900">Setup Complete!</h2>
                                            <p className="text-lg text-muted-foreground mt-4">Redirecting you to your dashboard...</p>
                                        </div>
                                        <Loader2 className="animate-spin mx-auto w-8 h-8 text-primary mt-8" />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
