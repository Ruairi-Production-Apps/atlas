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
import { initializeInstance, getOrganizationsByType, SetupData, getDbStatus, runDbInitialization } from "./actions"
import { useRouter } from "next/navigation"

export function InstanceSetupWizard() {
    const [step, setStep] = useState(0) // Start at DB check
    const [dbHealthy, setDbHealthy] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const [data, setData] = useState<SetupData>({
        orgType: 'group',
        orgId: '',
        name: '',
        slug: '',
        siteTitle: '',
        syncEnabled: true
    })

    const [orgs, setOrgs] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")

    // Check DB status on mount
    useEffect(() => {
        getDbStatus().then(status => {
            if (status.isInitialized) {
                setDbHealthy(true)
                setStep(1)
            } else {
                setDbHealthy(false)
                setStep(0)
            }
        })
    }, [])

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
        if (step === 2 && !data.orgId) return
        if (step === 3 && !data.siteTitle) return
        setStep(step + 1)
    }

    const handleBack = () => setStep(step - 1)

    const handleComplete = async () => {
        setLoading(true)
        setError(null)
        try {
            await initializeInstance(data)
            setStep(5) // Success step
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
            setStep(1)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl w-full mx-auto p-4 py-12">
            <div className="mb-8 text-center">
                <img src="/images/atlas/AtlasLogo.png" alt="Atlas" className="h-16 mx-auto mb-4" />
                <h1 className="text-3xl font-bold">Instance Setup</h1>
                <p className="text-muted-foreground mt-2">Configure your Atlas instance to get started.</p>
            </div>

            <div className="flex justify-between mb-8 px-2">
                {[0, 1, 2, 3, 4].map((i) => {
                    if (i === 0 && dbHealthy) return null;
                    return (
                        <div key={i} className="flex items-center">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-medium",
                                step === i ? "border-primary bg-primary text-primary-foreground" :
                                    step > i ? "border-primary bg-primary/10 text-primary" : "border-muted text-muted-foreground"
                            )}>
                                {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
                            </div>
                            {i < 4 && <div className={cn("w-12 h-0.5 mx-2", step > i ? "bg-primary" : "bg-muted")} />}
                        </div>
                    )
                })}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                    {error}
                </div>
            )}

            {step === 0 && (
                <Card>
                    <CardHeader>
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <CardTitle>Database Initialization</CardTitle>
                        <CardDescription>We need to prepare your Supabase database before we can continue.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            This will create the necessary tables and enums to run Atlas.
                        </p>
                        <div className="p-4 bg-muted rounded-md text-xs font-mono">
                            {loading ? "Discovering database..." : "Database tables missing: site_settings, groups"}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleInitDb} disabled={loading}>
                            {loading ? <><Loader2 className="animate-spin mr-2 w-4 h-4" /> Initializing...</> : "Initialize Database"}
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
                                { id: 'group', name: 'Group', desc: 'A local scouting group', icon: Building2 },
                                { id: 'county', name: 'County', desc: 'A scouting county', icon: Map },
                                { id: 'province', name: 'Province', desc: 'A scouting province', icon: Globe },
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
                        <CardTitle>Select {data.orgType.replace('_', ' ')}</CardTitle>
                        <CardDescription>Find your organization in our database.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="border rounded-md max-h-[300px] overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto w-6 h-6 text-muted-foreground" /></div>
                            ) : filteredOrgs.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">No organizations found.</div>
                            ) : (
                                filteredOrgs.map((org) => (
                                    <div
                                        key={org.id}
                                        className={cn(
                                            "flex items-center p-3 cursor-pointer hover:bg-accent border-b last:border-0",
                                            data.orgId === org.id && "bg-primary/5 border-primary/20"
                                        )}
                                        onClick={() => setData({ ...data, orgId: org.id, name: org.name, slug: org.slug, siteTitle: org.name })}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3 shrink-0">
                                            {org.logo_url ? <img src={org.logo_url} className="w-full h-full rounded-full object-cover" /> : <Building2 className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="font-medium text-sm truncate">{org.name}</div>
                                            <div className="text-xs text-muted-foreground">/{org.slug}</div>
                                        </div>
                                        {data.orgId === org.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between gap-4">
                        <Button variant="outline" onClick={handleBack}>Back</Button>
                        <Button className="flex-grow" onClick={handleNext} disabled={!data.orgId}>Continue <ChevronRight className="ml-2 w-4 h-4" /></Button>
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
                                <p className="text-xs text-muted-foreground">List your organization and public events in the central directory.</p>
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
                        <CardTitle>Ready to Launch?</CardTitle>
                        <CardDescription>Review your settings before initializing the instance.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Organization:</span><span className="font-medium">{data.name}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className="font-medium capitalize">{data.orgType.replace('_', ' ')}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Site Title:</span><span className="font-medium">{data.siteTitle}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Hub Sync:</span><span className="font-medium">{data.syncEnabled ? "Enabled" : "Disabled"}</span></div>
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

            {step === 5 && (
                <Card className="text-center py-12">
                    <CardContent className="space-y-6">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Setup Complete!</h2>
                            <p className="text-muted-foreground mt-2">Redirecting you to your dashboard...</p>
                        </div>
                        <Loader2 className="animate-spin mx-auto w-6 h-6 text-primary" />
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
