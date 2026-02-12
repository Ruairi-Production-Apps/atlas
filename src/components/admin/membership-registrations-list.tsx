"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Download, Search, FileText, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { CsvMemberImport } from "./csv-member-import"

interface MembershipRegistrationsListProps {
    groupId: string
}

export function MembershipRegistrationsList({ groupId }: MembershipRegistrationsListProps) {
    const [registrations, setRegistrations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const { toast } = useToast()

    useEffect(() => {
        fetchRegistrations()
    }, [groupId])

    const fetchRegistrations = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/organizations/group/${groupId}/membership/registrations`)
            if (!response.ok) throw new Error("Failed to load registrations")
            const data = await response.json()
            setRegistrations(data.registrations || [])
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const getParentName = (reg: any): string => {
        return reg.submission_data?.parent_name || 'N/A'
    }

    const getChildren = (reg: any): { name: string; dob: string }[] => {
        return reg.submission_data?.children || []
    }

    const getChildrenSummary = (reg: any): string => {
        const children = getChildren(reg)
        if (children.length === 0) return 'No children'
        return children.map(c => c.name).join(', ')
    }

    const filteredRegistrations = registrations.filter(reg => {
        const term = searchTerm.toLowerCase()
        const parentName = getParentName(reg).toLowerCase()
        const childNames = getChildren(reg).map(c => c.name.toLowerCase()).join(' ')
        return parentName.includes(term) || childNames.includes(term)
    })

    const getStatusBadge = (reg: any) => {
        if (reg.payment_status === 'paid') {
            return <Badge className="bg-green-100 text-green-700 border-green-200">Paid</Badge>
        }

        // Check schedules for arrears
        const now = new Date()
        const schedules = reg.payment_schedules || reg.membership_payment_schedules || []
        const overdue = schedules.some((s: any) =>
            s.status === 'pending' && new Date(s.due_date) < now
        )

        if (overdue) return <Badge variant="destructive">Arrears</Badge>

        const paidCount = schedules.filter((s: any) => s.status === 'paid').length
        if (paidCount > 0) return <Badge variant="secondary">Partial</Badge>

        return <Badge variant="outline">Pending</Badge>
    }

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <CsvMemberImport groupId={groupId} onImportComplete={fetchRegistrations} />
                <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* CSV Import Section */}
            <CsvMemberImport groupId={groupId} onImportComplete={fetchRegistrations} />

            {/* Registrations List */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by member or parent name..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm" className="w-full md:w-auto">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[30px]"></TableHead>
                                <TableHead>Parent Name</TableHead>
                                <TableHead>Children</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total Fee</TableHead>
                                <TableHead className="text-right">Paid</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRegistrations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                        No registrations found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRegistrations.map((reg) => {
                                    const schedules = reg.payment_schedules || reg.membership_payment_schedules || []
                                    const totalPaid = schedules
                                        .filter((s: any) => s.status === 'paid')
                                        .reduce((acc: number, s: any) => acc + (parseFloat(s.amount) || 0), 0)
                                    const totalFee = parseFloat(reg.total_fee) || parseFloat(reg.net_fee) || 0
                                    const balance = totalFee - totalPaid
                                    const children = getChildren(reg)
                                    const isExpanded = expandedRows.has(reg.id)

                                    return (
                                        <React.Fragment key={reg.id}>
                                            <TableRow
                                                key={reg.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => toggleRow(reg.id)}
                                            >
                                                <TableCell>
                                                    {children.length > 0 && (
                                                        isExpanded
                                                            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                            : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{getParentName(reg)}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {getChildrenSummary(reg)}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(reg)}</TableCell>
                                                <TableCell className="text-right">€{totalFee.toFixed(2)}</TableCell>
                                                <TableCell className="text-right text-emerald-600">€{totalPaid.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {balance > 0 ? (
                                                        <span className="text-amber-600">€{balance.toFixed(2)}</span>
                                                    ) : (
                                                        <span className="text-emerald-600">€0.00</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            {isExpanded && children.length > 0 && (
                                                <TableRow key={`${reg.id}-children`}>
                                                    <TableCell></TableCell>
                                                    <TableCell colSpan={6} className="py-3 bg-muted/20">
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Children</p>
                                                            {children.map((child: any, ci: number) => (
                                                                <div key={ci} className="flex items-center gap-4 text-sm">
                                                                    <span className="font-medium">{child.name}</span>
                                                                    {child.dob && (
                                                                        <span className="text-muted-foreground text-xs">
                                                                            DOB: {child.dob}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    )
}
