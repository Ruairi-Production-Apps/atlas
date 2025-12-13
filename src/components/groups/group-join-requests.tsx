"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, UserPlus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

interface JoinRequest {
    id: string
    user_id: string
    group_id: string
    requested_role: string
    message: string | null
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
    requester: {
        first_name: string
        last_name: string
        email: string
    }
}

interface GroupJoinRequestsProps {
    groupId: string
    groupName: string
}

export function GroupJoinRequests({ groupId, groupName }: GroupJoinRequestsProps) {
    const [requests, setRequests] = useState<JoinRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)

    useEffect(() => {
        fetchRequests()
    }, [groupId])

    const fetchRequests = async () => {
        setLoading(true)
        const supabase = createClient()

        const { data, error } = await supabase
            .from('group_join_requests')
            .select(`
                *,
                requester:profiles!user_id(first_name, last_name, email)
            `)
            .eq('group_id', groupId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching join requests:', error)
            toast.error('Failed to load join requests')
        } else if (data) {
            setRequests(data as any)
        }

        setLoading(false)
    }

    const handleApprove = async (request: JoinRequest) => {
        setProcessing(request.id)
        const supabase = createClient()

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Update request status
            const { error: updateError } = await supabase
                .from('group_join_requests')
                .update({
                    status: 'approved',
                    reviewed_by: user.id,
                    reviewed_at: new Date().toISOString()
                })
                .eq('id', request.id)

            if (updateError) throw updateError

            // Create user_roles entries based on requested role
            const rolesToCreate = []
            if (request.requested_role === 'scouter' || request.requested_role === 'both') {
                rolesToCreate.push({
                    user_id: request.user_id,
                    role: 'scouter',
                    scope_type: 'group',
                    scope_id: groupId
                })
            }
            if (request.requested_role === 'parent' || request.requested_role === 'both') {
                rolesToCreate.push({
                    user_id: request.user_id,
                    role: 'parent',
                    scope_type: 'group',
                    scope_id: groupId
                })
            }

            if (rolesToCreate.length > 0) {
                const { error: rolesError } = await supabase
                    .from('user_roles')
                    .insert(rolesToCreate)

                if (rolesError) throw rolesError
            }

            toast.success(`Approved ${request.requester.first_name}'s request!`)
            fetchRequests()
        } catch (error: any) {
            console.error('Error approving request:', error)
            toast.error(error.message || 'Failed to approve request')
        } finally {
            setProcessing(null)
        }
    }

    const handleReject = async (request: JoinRequest) => {
        setProcessing(request.id)
        const supabase = createClient()

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('group_join_requests')
                .update({
                    status: 'rejected',
                    reviewed_by: user.id,
                    reviewed_at: new Date().toISOString()
                })
                .eq('id', request.id)

            if (error) throw error

            toast.success(`Rejected ${request.requester.first_name}'s request`)
            fetchRequests()
        } catch (error: any) {
            console.error('Error rejecting request:', error)
            toast.error(error.message || 'Failed to reject request')
        } finally {
            setProcessing(null)
        }
    }

    const getRoleDisplay = (role: string) => {
        if (role === 'both') return 'Scouter & Parent'
        if (role === 'parent') return 'Parent/Guardian'
        if (role === 'scouter') return 'Scouter'
        return role
    }

    const getStatusBadge = (status: string) => {
        if (status === 'pending') return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
        if (status === 'approved') return <Badge variant="default" className="bg-green-600"><Check className="h-3 w-3 mr-1" />Approved</Badge>
        if (status === 'rejected') return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>
        return <Badge>{status}</Badge>
    }

    const pendingRequests = requests.filter(r => r.status === 'pending')
    const processedRequests = requests.filter(r => r.status !== 'pending')

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Join Requests</CardTitle>
                    <CardDescription>Loading...</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Pending Requests */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Pending Join Requests</CardTitle>
                            <CardDescription>
                                Review and approve requests to join {groupName}
                            </CardDescription>
                        </div>
                        {pendingRequests.length > 0 && (
                            <Badge variant="destructive" className="text-base px-3 py-1">
                                {pendingRequests.length} pending
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {pendingRequests.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg mb-2">No pending requests</p>
                            <p className="text-sm">
                                All join requests have been reviewed
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="flex items-start gap-4 p-4 border rounded-lg bg-card"
                                >
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold">
                                                    {request.requester.first_name} {request.requester.last_name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {request.requester.email}
                                                </p>
                                            </div>
                                            <Badge variant="outline">
                                                {getRoleDisplay(request.requested_role)}
                                            </Badge>
                                        </div>

                                        {request.message && (
                                            <div className="bg-muted p-3 rounded-md">
                                                <p className="text-sm text-muted-foreground mb-1 font-semibold">Message:</p>
                                                <p className="text-sm">{request.message}</p>
                                            </div>
                                        )}

                                        <p className="text-xs text-muted-foreground">
                                            Requested {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2 shrink-0">
                                        <Button
                                            size="sm"
                                            onClick={() => handleApprove(request)}
                                            disabled={processing === request.id}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Check className="h-4 w-4 mr-1" />
                                            {processing === request.id ? 'Processing...' : 'Approve'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleReject(request)}
                                            disabled={processing === request.id}
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Processed Requests History */}
            {processedRequests.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Request History</CardTitle>
                        <CardDescription>Previously reviewed requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {processedRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">
                                            {request.requester.first_name} {request.requester.last_name}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            {getRoleDisplay(request.requested_role)} • {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {getStatusBadge(request.status)}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
