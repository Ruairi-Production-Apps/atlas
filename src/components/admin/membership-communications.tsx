"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Plus,
    Trash2,
    Save,
    Mail,
    Send,
    Bell,
    Loader2,
    Clock,
    ChevronDown,
    ChevronRight,
    Info,
} from "lucide-react"

interface FrequencyRules {
    type: 'before_due' | 'after_due' | 'recurring'
    days_before?: number
    days_after?: number
    repeat_interval_days?: number
    max_reminders?: number
}

interface Reminder {
    id?: string
    config_id?: string
    subject: string
    body_text: string
    send_to_both_parents: boolean
    frequency_rules: FrequencyRules
    active: boolean
    last_run_at?: string
}

interface MembershipCommunicationsProps {
    groupId: string
}

const DEFAULT_REMINDER: Reminder = {
    subject: '',
    body_text: '',
    send_to_both_parents: false,
    frequency_rules: {
        type: 'before_due',
        days_before: 3,
    },
    active: true,
}

const TEMPLATE_VARIABLES = [
    { variable: '{{parent_name}}', description: 'Parent\'s full name' },
    { variable: '{{parent_first_name}}', description: 'Parent\'s first name' },
    { variable: '{{child_names}}', description: 'Comma-separated children names' },
    { variable: '{{group_name}}', description: 'Scout group name' },
    { variable: '{{amount_due}}', description: 'Amount currently due' },
    { variable: '{{amount_paid_to_date}}', description: 'Total amount paid so far' },
    { variable: '{{total_balance}}', description: 'Total outstanding balance' },
    { variable: '{{due_date}}', description: 'Next payment due date' },
    { variable: '{{dashboard_link}}', description: 'Link to parent dashboard' },
    { variable: '{{payment_link}}', description: 'Direct link for parent to pay online' },
]

export function MembershipCommunications({ groupId }: MembershipCommunicationsProps) {
    const [reminders, setReminders] = useState<Reminder[]>([])
    const [loading, setLoading] = useState(true)
    const [stripeConnected, setStripeConnected] = useState<boolean | null>(null)
    const [saving, setSaving] = useState<string | null>(null)
    const [sending, setSending] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
    const [confirmingSendId, setConfirmingSendId] = useState<string | null>(null)
    const [showTemplateVars, setShowTemplateVars] = useState(false)
    const { toast } = useToast()

    const fetchReminders = useCallback(async () => {
        setLoading(true)
        try {
            // Check stripe status first
            const stripeRes = await fetch(`/api/organizations/group/${groupId}/financial`)
            if (stripeRes.ok) {
                const stripeData = await stripeRes.json()
                setStripeConnected(!!stripeData.stripe_charges_enabled && !!stripeData.stripe_details_submitted)
            } else {
                setStripeConnected(false)
            }

            const response = await fetch(`/api/organizations/group/${groupId}/membership/reminders`)
            if (!response.ok) throw new Error('Failed to load reminders')
            const data = await response.json()
            setReminders(data.reminders || [])
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }, [groupId, toast])

    useEffect(() => {
        fetchReminders()
    }, [fetchReminders])

    const handleSave = async (reminder: Reminder) => {
        const savingId = reminder.id || 'new'
        setSaving(savingId)
        try {
            const response = await fetch(`/api/organizations/group/${groupId}/membership/reminders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: JSON.stringify(reminder),
            })
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to save reminder')
            }
            toast({ title: "Saved", description: "Reminder saved successfully." })
            setEditingReminder(null)
            await fetchReminders()
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setSaving(null)
        }
    }

    const handleDelete = async (reminderId: string) => {
        if (!confirm('Delete this reminder? This cannot be undone.')) return
        try {
            const response = await fetch(
                `/api/organizations/group/${groupId}/membership/reminders?reminderId=${reminderId}`,
                {
                    method: 'DELETE',
                    headers: { 'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '' },
                }
            )
            if (!response.ok) throw new Error('Failed to delete reminder')
            toast({ title: "Deleted", description: "Reminder deleted." })
            await fetchReminders()
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        }
    }

    const handleToggleActive = async (reminder: Reminder) => {
        await handleSave({ ...reminder, active: !reminder.active })
    }

    const handleSendNow = async (reminderId: string) => {
        setConfirmingSendId(null)
        setSending(reminderId)
        try {
            const response = await fetch(
                `/api/organizations/group/${groupId}/membership/reminders/send`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                    },
                    body: JSON.stringify({ reminderId }),
                }
            )
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to send reminders')
            }
            const result = await response.json()
            if (result.diagnostics || result.details) {
                console.log('Send Now Result:', result)
            }

            if (result.sent === 0) {
                toast({
                    title: "No Emails Sent",
                    description: `${result.message}. Check browser console for details.`,
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Emails Sent",
                    description: `${result.sent} email(s) sent successfully.`,
                })
            }
            await fetchReminders() // Refresh to update last_run_at
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setSending(null)
        }
    }

    const startEditing = (reminder?: Reminder) => {
        setEditingReminder(reminder || { ...DEFAULT_REMINDER })
    }

    const getFrequencyLabel = (rules: FrequencyRules): string => {
        if (rules.type === 'before_due') {
            return `${rules.days_before || 0} day(s) before due date`
        }
        if (rules.type === 'after_due') {
            return `${rules.days_after || 0} day(s) after due date (overdue)`
        }
        if (rules.type === 'recurring') {
            return `Every ${rules.repeat_interval_days || 7} day(s), max ${rules.max_reminders || 3} times`
        }
        return 'Unknown'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (stripeConnected === false) {
        return (
            <Card className="border-amber-200 bg-amber-50">
                <CardContent className="py-8 text-center space-y-4">
                    <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                        <Info className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="max-w-md mx-auto">
                        <h3 className="text-lg font-semibold text-amber-900">Stripe Connect Required</h3>
                        <p className="text-sm text-amber-700 mt-1">
                            To send payment reminders and accept online payments, you must first connect your scout group's Stripe account in the <strong>Financial</strong> tab.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Payment Reminders</h3>
                    <p className="text-sm text-muted-foreground">
                        Configure automated email reminders for upcoming and overdue payments.
                    </p>
                </div>
                <Button onClick={() => startEditing()} size="sm" disabled={!stripeConnected}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Reminder
                </Button>
            </div>

            {/* Template Variables Help */}
            <Card>
                <CardHeader
                    className="py-3 px-4 cursor-pointer"
                    onClick={() => setShowTemplateVars(!showTemplateVars)}
                >
                    <div className="flex items-center gap-2 text-sm">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Template Variables</span>
                        <span className="text-muted-foreground text-xs">— Use these in your subject and body</span>
                        {showTemplateVars
                            ? <ChevronDown className="h-4 w-4 ml-auto" />
                            : <ChevronRight className="h-4 w-4 ml-auto" />
                        }
                    </div>
                </CardHeader>
                {showTemplateVars && (
                    <CardContent className="pt-0 pb-3 px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {TEMPLATE_VARIABLES.map(tv => (
                                <div key={tv.variable} className="flex items-center gap-2 text-sm">
                                    <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{tv.variable}</code>
                                    <span className="text-muted-foreground text-xs">{tv.description}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Editing Form */}
            {editingReminder && (
                <Card className="border-primary">
                    <CardHeader>
                        <CardTitle className="text-base">
                            {editingReminder.id ? 'Edit Reminder' : 'New Reminder'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Email Subject</Label>
                            <Input
                                placeholder="e.g. Payment Reminder: {{group_name}} Membership"
                                value={editingReminder.subject}
                                onChange={e => setEditingReminder(prev => prev ? { ...prev, subject: e.target.value } : null)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Email Body</Label>
                            <Textarea
                                placeholder={"Hi {{parent_name}},\n\nThis is a reminder that a payment of €{{amount_due}} for {{child_names}} is due on {{due_date}}.\n\nView your dashboard: {{dashboard_link}}\n\nThanks,\n{{group_name}}"}
                                value={editingReminder.body_text}
                                onChange={e => setEditingReminder(prev => prev ? { ...prev, body_text: e.target.value } : null)}
                                rows={8}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>When to Send</Label>
                                <Select
                                    value={editingReminder.frequency_rules.type}
                                    onValueChange={(val: FrequencyRules['type']) =>
                                        setEditingReminder(prev => prev ? {
                                            ...prev,
                                            frequency_rules: { ...prev.frequency_rules, type: val }
                                        } : null)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="before_due">Before due date</SelectItem>
                                        <SelectItem value="after_due">After due date (overdue)</SelectItem>
                                        <SelectItem value="recurring">Recurring (repeat)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {editingReminder.frequency_rules.type === 'before_due' && (
                                <div className="space-y-2">
                                    <Label>Days Before</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={editingReminder.frequency_rules.days_before || ''}
                                        onChange={e => setEditingReminder(prev => prev ? {
                                            ...prev,
                                            frequency_rules: { ...prev.frequency_rules, days_before: parseInt(e.target.value) || 0 }
                                        } : null)}
                                    />
                                </div>
                            )}

                            {editingReminder.frequency_rules.type === 'after_due' && (
                                <div className="space-y-2">
                                    <Label>Days After</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={editingReminder.frequency_rules.days_after || ''}
                                        onChange={e => setEditingReminder(prev => prev ? {
                                            ...prev,
                                            frequency_rules: { ...prev.frequency_rules, days_after: parseInt(e.target.value) || 0 }
                                        } : null)}
                                    />
                                </div>
                            )}

                            {editingReminder.frequency_rules.type === 'recurring' && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Repeat Every (days)</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={editingReminder.frequency_rules.repeat_interval_days || ''}
                                            onChange={e => setEditingReminder(prev => prev ? {
                                                ...prev,
                                                frequency_rules: { ...prev.frequency_rules, repeat_interval_days: parseInt(e.target.value) || 7 }
                                            } : null)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Max Reminders</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={editingReminder.frequency_rules.max_reminders || ''}
                                            onChange={e => setEditingReminder(prev => prev ? {
                                                ...prev,
                                                frequency_rules: { ...prev.frequency_rules, max_reminders: parseInt(e.target.value) || 3 }
                                            } : null)}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                            <Switch
                                checked={editingReminder.active}
                                onCheckedChange={checked => setEditingReminder(prev => prev ? { ...prev, active: checked } : null)}
                            />
                            <div>
                                <Label className="cursor-pointer">Enabled</Label>
                                <p className="text-xs text-muted-foreground">If disabled, this reminder will not be sent automatically.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                            <Switch
                                checked={editingReminder.send_to_both_parents}
                                onCheckedChange={checked => setEditingReminder(prev => prev ? { ...prev, send_to_both_parents: checked } : null)}
                            />
                            <div>
                                <Label className="cursor-pointer">Send to both parents</Label>
                                <p className="text-xs text-muted-foreground">If enabled, the reminder will be sent to both parent email addresses on file.</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditingReminder(null)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleSave(editingReminder)}
                                disabled={!editingReminder.subject || !editingReminder.body_text || saving === (editingReminder.id || 'new')}
                            >
                                {saving === (editingReminder.id || 'new') ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Reminder
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Existing Reminders */}
            {reminders.length === 0 && !editingReminder ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No reminders configured</p>
                        <p className="text-sm mt-1">Add a reminder to automatically email parents about upcoming or overdue payments.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {reminders.map(reminder => (
                        <Card
                            key={reminder.id}
                            className={`transition-colors ${!reminder.active ? 'opacity-60' : ''}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span className="font-medium text-sm truncate">{reminder.subject}</span>
                                            {reminder.active ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0">Active</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="shrink-0">Paused</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>{getFrequencyLabel(reminder.frequency_rules)}</span>
                                        </div>
                                        {reminder.last_run_at && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Last sent: {new Date(reminder.last_run_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => reminder.id && setConfirmingSendId(reminder.id)}
                                            disabled={sending === reminder.id}
                                        >
                                            {sending === reminder.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-1" />
                                                    Send Now
                                                </>
                                            )}
                                        </Button>
                                        <Switch
                                            checked={reminder.active}
                                            onCheckedChange={() => handleToggleActive(reminder)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => startEditing(reminder)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => reminder.id && handleDelete(reminder.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            {/* Confirmation Dialog */}
            <Dialog open={!!confirmingSendId} onOpenChange={(open) => !open && setConfirmingSendId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Reminders Now?</DialogTitle>
                        <DialogDescription>
                            This will send the reminder email to <strong>ALL</strong> parents with pending payments immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmingSendId(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => confirmingSendId && handleSendNow(confirmingSendId)}
                        >
                            Send Now
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
