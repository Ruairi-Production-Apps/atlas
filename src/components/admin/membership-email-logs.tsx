"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, ChevronDown, ChevronRight, AlertCircle } from "lucide-react"

interface EmailLog {
    id: string
    reminder_id: string | null
    trigger_type: 'manual' | 'recurring'
    recipient_email: string
    recipient_name: string | null
    subject: string
    status: 'sent' | 'error'
    error_message: string | null
    created_at: string
    reminder?: { subject: string } | null
}

interface GroupedLog {
    reminderSubject: string
    triggerType: 'manual' | 'recurring'
    totalSent: number
    totalErrors: number
    emails: EmailLog[]
    latestDate: string
}

interface MembershipEmailLogsProps {
    groupId: string
}

export function MembershipEmailLogs({ groupId }: MembershipEmailLogsProps) {
    const [logs, setLogs] = useState<EmailLog[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

    useEffect(() => {
        async function fetchLogs() {
            try {
                const res = await fetch(`/api/organizations/group/${groupId}/membership/reminders/logs`)
                const data = await res.json()
                setLogs(data.logs || [])
            } catch {
                console.error('Failed to fetch email logs')
            } finally {
                setLoading(false)
            }
        }
        fetchLogs()
    }, [groupId])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (logs.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No email logs yet</p>
                    <p className="text-sm mt-1">Logs will appear here after reminder emails are sent.</p>
                </CardContent>
            </Card>
        )
    }

    // Group logs by reminder_id + trigger_type + date (batch)
    // We group by reminder subject and approximate send time (within 5 min window)
    const grouped: GroupedLog[] = []
    const groupMap = new Map<string, GroupedLog>()

    for (const log of logs) {
        const date = new Date(log.created_at)
        // Round to 5-minute window for batching
        const batchTime = new Date(Math.floor(date.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000)).toISOString()
        const key = `${log.reminder_id || 'unknown'}-${log.trigger_type}-${batchTime}`

        if (!groupMap.has(key)) {
            const entry: GroupedLog = {
                reminderSubject: log.reminder?.subject || log.subject,
                triggerType: log.trigger_type,
                totalSent: 0,
                totalErrors: 0,
                emails: [],
                latestDate: log.created_at,
            }
            groupMap.set(key, entry)
            grouped.push(entry)
        }

        const group = groupMap.get(key)!
        group.emails.push(log)
        if (log.status === 'sent') group.totalSent++
        else group.totalErrors++
        if (log.created_at > group.latestDate) group.latestDate = log.created_at
    }

    const toggleGroup = (index: number) => {
        setExpandedGroups(prev => {
            const next = new Set(prev)
            const key = String(index)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    return (
        <div className="space-y-3">
            {grouped.map((group, index) => {
                const isExpanded = expandedGroups.has(String(index))
                return (
                    <Card key={index}>
                        <CardContent className="p-4">
                            <Button
                                variant="ghost"
                                className="w-full justify-start p-0 h-auto hover:bg-transparent"
                                onClick={() => toggleGroup(index)}
                            >
                                <div className="flex items-start justify-between gap-4 w-full">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        )}
                                        <div className="text-left min-w-0">
                                            <p className="font-medium text-sm truncate">{group.reminderSubject}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {new Date(group.latestDate).toLocaleDateString('en-IE', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge variant={group.triggerType === 'recurring' ? 'secondary' : 'outline'}>
                                            {group.triggerType === 'recurring' ? 'Recurring' : 'Manual'}
                                        </Badge>
                                        <Badge className="bg-green-100 text-green-700 border-green-200">
                                            {group.totalSent} sent
                                        </Badge>
                                        {group.totalErrors > 0 && (
                                            <Badge variant="destructive">
                                                {group.totalErrors} failed
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </Button>

                            {isExpanded && (
                                <div className="mt-3 ml-6 border-l-2 border-muted pl-4 space-y-2">
                                    {group.emails.map((email) => (
                                        <div key={email.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {email.status === 'error' ? (
                                                    <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                                                ) : (
                                                    <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                )}
                                                <span className="truncate">
                                                    {email.recipient_name && (
                                                        <span className="font-medium">{email.recipient_name} — </span>
                                                    )}
                                                    {email.recipient_email}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                                                {email.status === 'error' && email.error_message && (
                                                    <span className="text-destructive max-w-[200px] truncate">{email.error_message}</span>
                                                )}
                                                <span>{new Date(email.created_at).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
