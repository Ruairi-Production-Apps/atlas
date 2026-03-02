"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Clock, Trash2 } from "lucide-react"
import { getOptimizedImageUrl } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface PendingRequestsProps {
    initialRequests: any[]
}

export function PendingRequests({ initialRequests }: PendingRequestsProps) {
    const [requests, setRequests] = useState(initialRequests)
    const [cancellingId, setCancellingId] = useState<string | null>(null)
    const router = useRouter()
    const { toast } = useToast()

    // Sync state when props change
    useEffect(() => {
        setRequests(initialRequests)
    }, [initialRequests])

    if (requests.length === 0) return null

    const handleCancel = async (id: string, groupName: string) => {
        if (!confirm(`Are you sure you want to withdraw your request to join ${groupName}?`)) return

        setCancellingId(id)
        const supabase = createClient()
        const { error } = await supabase
            .from('group_join_requests')
            .delete()
            .eq('id', id)

        if (error) {
            toast({
                variant: "destructive",
                title: "Error cancelling request",
                description: error.message
            })
            setCancellingId(null)
            return
        }

        toast({
            title: "Request withdrawn",
            description: `Successfully withdrawn request for ${groupName}.`
        })

        setRequests(prev => prev.filter(r => r.id !== id))
        setCancellingId(null)
        router.refresh()
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'scouter': return 'Scouter'
            case 'parent': return 'Parent/Guardian'
            case 'both': return 'Scouter & Parent'
            default: return role.charAt(0).toUpperCase() + role.slice(1)
        }
    }

    return (
        <Card className="border-amber-100 dark:border-amber-900/50">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <Clock className="h-5 w-5" />
                    Pending Requests
                </CardTitle>
                <CardDescription>
                    Your applications waiting for review
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {requests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg bg-amber-50/30 dark:bg-amber-900/10 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden text-left">
                                <div className="h-10 w-10 rounded-full border bg-background flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                    {request.group?.logo_url ? (
                                        <img
                                            src={getOptimizedImageUrl(request.group.logo_url, 80)}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Building2 className="h-5 w-5 text-muted-foreground opacity-50" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-semibold text-sm truncate">{request.group?.name || 'Unknown Group'}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-normal shrink-0">
                                            {getRoleLabel(request.requested_role)}
                                        </Badge>
                                        <span className="text-[10px] opacity-70 truncate">
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleCancel(request.id, request.group?.name || 'this group')}
                                    disabled={cancellingId === request.id}
                                >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                    Withdraw
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
