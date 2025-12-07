"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FormSubmissionsListProps {
    formId: string
    eventId: string
    organizationId: string
    organizationType: string
}

export function FormSubmissionsList({ formId, eventId, organizationId, organizationType }: FormSubmissionsListProps) {
    const [submissions, setSubmissions] = useState<any[]>([])
    const [fields, setFields] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [viewSubmission, setViewSubmission] = useState<any | null>(null)

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const response = await fetch(`/api/organizations/${organizationType}/${organizationId}/events/${eventId}/forms/${formId}/submissions`)
                if (!response.ok) throw new Error("Failed to load submissions")
                const data = await response.json()
                setSubmissions(data.submissions || [])
                setFields(data.fields || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchSubmissions()
    }, [formId, eventId, organizationId, organizationType])

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                Error: {error}
            </div>
        )
    }

    if (submissions.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    No submissions yet.
                </CardContent>
            </Card>
        )
    }

    const formatValue = (value: any, type: string) => {
        if (value === null || value === undefined) return '-'

        if (type === 'participants' && Array.isArray(value)) {
            return `${value.length} Participant${value.length !== 1 ? 's' : ''}`
        }

        if (Array.isArray(value)) {
            return value.join(', ')
        }

        if (typeof value === 'object') {
            return JSON.stringify(value)
        }

        return value.toString()
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Submissions ({submissions.length})</CardTitle>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    {fields.slice(0, 5).map(field => (
                                        <TableHead key={field.id} className="capitalize whitespace-nowrap">
                                            {field.label}
                                        </TableHead>
                                    ))}
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((sub) => (
                                    <TableRow key={sub.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {new Date(sub.created_at).toLocaleDateString()}
                                        </TableCell>
                                        {fields.slice(0, 5).map(field => (
                                            <TableCell key={`${sub.id}-${field.id}`} className="max-w-[200px] truncate">
                                                {formatValue(sub.submission_data[field.id], field.field_type)}
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setViewSubmission(sub)}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {viewSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewSubmission(null)}>
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-background z-10 border-b">
                            <CardTitle>Submission Details</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setViewSubmission(null)}>Close</Button>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold block text-muted-foreground">Submission Date</span>
                                    {new Date(viewSubmission.created_at).toLocaleString()}
                                </div>
                                <div>
                                    <span className="font-semibold block text-muted-foreground">ID</span>
                                    {viewSubmission.id}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {fields.map(field => {
                                    const value = viewSubmission.submission_data[field.id]
                                    return (
                                        <div key={field.id} className="border-b pb-4 last:border-0">
                                            <h4 className="font-medium mb-2">{field.label}</h4>
                                            {field.field_type === 'participants' && Array.isArray(value) ? (
                                                <div className="space-y-3">
                                                    {value.map((p: any, idx: number) => (
                                                        <div key={idx} className="bg-muted p-3 rounded-md text-sm">
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {Object.entries(p).map(([key, val]) => (
                                                                    key !== 'type' && (
                                                                        <div key={key}>
                                                                            <span className="text-xs text-muted-foreground capitalize block">
                                                                                {key.replace(/_/g, ' ')}
                                                                            </span>
                                                                            <span>{String(val || '-')}</span>
                                                                        </div>
                                                                    )
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-sm bg-muted/30 p-2 rounded">
                                                    {formatValue(value, field.field_type)}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    )
}
