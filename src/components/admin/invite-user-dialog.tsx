"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Link as LinkIcon, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InviteUserDialogProps {
    organizationId: string
    organizationType: 'province' | 'county' | 'group' | 'team'
    organizationName: string
    role: 'scouter' | 'parent'
    triggerButton?: React.ReactNode
    onInviteSent?: () => void
}

export function InviteUserDialog({
    organizationId,
    organizationType,
    organizationName,
    role,
    triggerButton,
    onInviteSent
}: InviteUserDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    // Email invite state
    const [email, setEmail] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")

    // Scouter-specific state
    const [activeSections, setActiveSections] = useState<any[]>([])
    const [selectedSections, setSelectedSections] = useState<string[]>([])
    const [isSectionLead, setIsSectionLead] = useState(false)

    // Link invite state
    const [inviteLink, setInviteLink] = useState("")
    const [linkCopied, setLinkCopied] = useState(false)
    const [linkLoading, setLinkLoading] = useState(false)

    // Load sections for groups
    useEffect(() => {
        if (organizationType === 'group' && role === 'scouter') {
            loadSections()
        }
    }, [open, organizationType, role])

    const loadSections = async () => {
        try {
            const response = await fetch(`/api/organizations/group/${organizationId}/sections`)
            const data = await response.json()
            setActiveSections(data.sections || [])
        } catch (error) {
            console.error('Failed to load sections:', error)
        }
    }

    const handleSectionToggle = (sectionId: string) => {
        setSelectedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        )
    }

    const handleCreateAndInvite = async () => {
        if (!email) {
            toast({
                title: "Email Required",
                description: "Please enter an email address.",
                variant: "destructive"
            })
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/invitations/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: JSON.stringify({
                    email,
                    firstName,
                    lastName,
                    organizationId,
                    organizationType,
                    role,
                    sectionIds: role === 'scouter' ? selectedSections : undefined,
                    isSectionLead: role === 'scouter' ? isSectionLead : undefined
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to send invitation')

            toast({
                title: "Invitation Sent",
                description: `An invitation email has been sent to ${email}.`
            })

            resetForm()
            setOpen(false)
            onInviteSent?.()

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateLink = async () => {
        setLinkLoading(true)
        try {
            const response = await fetch('/api/invitations/link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: JSON.stringify({
                    organizationId,
                    organizationType,
                    role,
                    sectionIds: role === 'scouter' ? selectedSections : undefined,
                    isSectionLead: role === 'scouter' ? isSectionLead : undefined
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to generate link')

            setInviteLink(data.invitationUrl)
            toast({
                title: "Link Generated",
                description: "Invitation link created successfully."
            })

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setLinkLoading(false)
        }
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink)
        setLinkCopied(true)
        toast({
            title: "Copied",
            description: "Invitation link copied to clipboard."
        })
        setTimeout(() => setLinkCopied(false), 2000)
    }

    const resetForm = () => {
        setEmail("")
        setFirstName("")
        setLastName("")
        setSelectedSections([])
        setIsSectionLead(false)
        setInviteLink("")
        setLinkCopied(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button>
                        <Mail className="h-4 w-4 mr-2" />
                        Invite New User
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Invite {role === 'parent' ? 'Parent' : 'Scouter'}</DialogTitle>
                    <DialogDescription>
                        Send an invitation email or generate a shareable signup link for {organizationName}.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="email" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="email">Create & Invite</TabsTrigger>
                        <TabsTrigger value="link">Invite by Link</TabsTrigger>
                    </TabsList>

                    <TabsContent value="email" className="space-y-4 mt-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="user@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="John"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                            </div>

                            {role === 'scouter' && organizationType === 'group' && (
                                <div className="space-y-4 pt-4 border-t">
                                    <Label className="text-base font-semibold">Scouter Details</Label>

                                    <div className="space-y-2">
                                        <Label>Sections (Optional)</Label>
                                        <div className="space-y-2">
                                            {activeSections.map(section => (
                                                <div key={section.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`section-${section.id}`}
                                                        checked={selectedSections.includes(section.id)}
                                                        onCheckedChange={() => handleSectionToggle(section.id)}
                                                    />
                                                    <Label htmlFor={`section-${section.id}`} className="font-normal">
                                                        {section.section_type.charAt(0).toUpperCase() + section.section_type.slice(1)}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="section-lead"
                                            checked={isSectionLead}
                                            onCheckedChange={(checked) => setIsSectionLead(!!checked)}
                                            disabled={selectedSections.length === 0}
                                        />
                                        <Label htmlFor="section-lead">Section Lead</Label>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleCreateAndInvite}
                                disabled={loading || !email}
                                className="w-full"
                            >
                                {loading ? "Sending..." : "Send Invitation"}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="link" className="space-y-4 mt-4">
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                Generate a shareable signup link that pre-fills the organization and role information.
                            </div>

                            {role === 'scouter' && organizationType === 'group' && (
                                <div className="space-y-4 pt-2 border-t">
                                    <Label className="text-base font-semibold">Scouter Details</Label>

                                    <div className="space-y-2">
                                        <Label>Sections (Optional)</Label>
                                        <div className="space-y-2">
                                            {activeSections.map(section => (
                                                <div key={section.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`link-section-${section.id}`}
                                                        checked={selectedSections.includes(section.id)}
                                                        onCheckedChange={() => handleSectionToggle(section.id)}
                                                    />
                                                    <Label htmlFor={`link-section-${section.id}`} className="font-normal">
                                                        {section.section_type.charAt(0).toUpperCase() + section.section_type.slice(1)}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="link-section-lead"
                                            checked={isSectionLead}
                                            onCheckedChange={(checked) => setIsSectionLead(!!checked)}
                                            disabled={selectedSections.length === 0}
                                        />
                                        <Label htmlFor="link-section-lead">Section Lead</Label>
                                    </div>
                                </div>
                            )}

                            {!inviteLink ? (
                                <Button
                                    onClick={handleGenerateLink}
                                    disabled={linkLoading}
                                    className="w-full"
                                >
                                    <LinkIcon className="h-4 w-4 mr-2" />
                                    {linkLoading ? "Generating..." : "Generate Invitation Link"}
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="p-3 bg-muted rounded-md break-all text-sm">
                                        {inviteLink}
                                    </div>
                                    <Button
                                        onClick={handleCopyLink}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        {linkCopied ? (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Link
                                            </>
                                        )}
                                    </Button>
                                    <div className="text-xs text-muted-foreground text-center">
                                        Link expires in 7 days
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
