"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Download, Search, ChevronDown, ChevronRight, Trash2, Plus, X, Pencil, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { CsvMemberImport } from "./csv-member-import"

interface MembershipRegistrationsListProps {
    groupId: string
}

interface NewChild {
    first_name: string
    last_name: string
    dob: string
}

const EMPTY_CHILD: NewChild = { first_name: '', last_name: '', dob: '' }

export function MembershipRegistrationsList({ groupId }: MembershipRegistrationsListProps) {
    const [registrations, setRegistrations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
    const [editEmailReg, setEditEmailReg] = useState<{ id: string; email: string; field: 'parent_email' | 'parent_2_email' } | null>(null)
    const [editEmailValue, setEditEmailValue] = useState('')
    const [editEmailSaving, setEditEmailSaving] = useState(false)
    const [sendReminderReg, setSendReminderReg] = useState<{ id: string; name: string } | null>(null)
    const [reminders, setReminders] = useState<any[]>([])
    const [selectedReminderId, setSelectedReminderId] = useState<string>('')
    const [sendingReminder, setSendingReminder] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [addingSaving, setAddingSaving] = useState(false)
    const [newParent, setNewParent] = useState({ first_name: '', last_name: '', email: '' })
    const [newParent2, setNewParent2] = useState({ first_name: '', last_name: '', email: '' })
    const [newChildren, setNewChildren] = useState<NewChild[]>([{ ...EMPTY_CHILD }])
    const [newTotalFee, setNewTotalFee] = useState('')
    const [newAmountPaid, setNewAmountPaid] = useState('')
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

    const getParentEmail = (reg: any): string => {
        return reg.submission_data?.parent_email || reg.parent?.email || 'N/A'
    }

    const getParent2Email = (reg: any): string => {
        return reg.submission_data?.parent_2_email || ''
    }

    const getParent2Name = (reg: any): string => {
        return reg.submission_data?.parent_2_name || ''
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
        const parentEmail = getParentEmail(reg).toLowerCase()
        const childNames = getChildren(reg).map(c => c.name.toLowerCase()).join(' ')
        return parentName.includes(term) || parentEmail.includes(term) || childNames.includes(term)
    })

    const getStatusBadge = (reg: any) => {
        if (reg.payment_status === 'paid') {
            return <Badge className="bg-green-100 text-green-700 border-green-200">Paid</Badge>
        }

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
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handleDelete = async (registrationId: string) => {
        setDeletingId(registrationId)
        try {
            const response = await fetch(`/api/organizations/group/${groupId}/membership/registrations`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: JSON.stringify({ registrationId }),
            })
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to delete')
            }
            toast({ title: "Deleted", description: "Registration removed successfully." })
            setRegistrations(prev => prev.filter(r => r.id !== registrationId))
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setDeletingId(null)
            setConfirmDeleteId(null)
        }
    }

    const handleEditEmail = async () => {
        if (!editEmailReg) return
        // Allow empty value for parent_2_email (to clear it), but require value for parent_email
        if (editEmailReg.field === 'parent_email' && !editEmailValue) return
        setEditEmailSaving(true)
        try {
            const response = await fetch(`/api/organizations/group/${groupId}/membership/registrations`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: JSON.stringify({ registrationId: editEmailReg.id, email: editEmailValue, field: editEmailReg.field }),
            })
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update email')
            }
            toast({ title: "Email updated", description: "The email address has been changed." })
            setRegistrations(prev => prev.map(r => {
                if (r.id !== editEmailReg.id) return r
                return {
                    ...r,
                    submission_data: { ...r.submission_data, [editEmailReg.field]: editEmailValue }
                }
            }))
            setEditEmailReg(null)
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setEditEmailSaving(false)
        }
    }

    const openSendReminderDialog = async (reg: any) => {
        setSendReminderReg({ id: reg.id, name: getParentName(reg) })
        setSelectedReminderId('')
        if (reminders.length === 0) {
            try {
                const res = await fetch(`/api/organizations/group/${groupId}/membership/reminders`)
                const data = await res.json()
                setReminders(data.reminders || [])
                if (data.reminders?.length === 1) setSelectedReminderId(data.reminders[0].id)
            } catch {
                toast({ title: "Error", description: "Failed to load email templates.", variant: "destructive" })
            }
        } else if (reminders.length === 1) {
            setSelectedReminderId(reminders[0].id)
        }
    }

    const handleSendReminder = async () => {
        if (!sendReminderReg || !selectedReminderId) return
        setSendingReminder(true)
        try {
            const res = await fetch(`/api/organizations/group/${groupId}/membership/reminders/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: JSON.stringify({ reminderId: selectedReminderId, registrationId: sendReminderReg.id }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to send')
            toast({ title: "Reminder sent", description: `Email sent to ${sendReminderReg.name}.` })
            setSendReminderReg(null)
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setSendingReminder(false)
        }
    }

    const resetAddForm = () => {
        setNewParent({ first_name: '', last_name: '', email: '' })
        setNewParent2({ first_name: '', last_name: '', email: '' })
        setNewChildren([{ ...EMPTY_CHILD }])
        setNewTotalFee('')
        setNewAmountPaid('')
    }

    const handleAddParent = async () => {
        if (!newParent.email || !newParent.first_name || !newParent.last_name) {
            toast({ title: "Error", description: "Parent first name, last name, and email are required.", variant: "destructive" })
            return
        }

        const validChildren = newChildren.filter(c => c.first_name.trim())
        if (validChildren.length === 0) {
            toast({ title: "Error", description: "At least one child is required.", variant: "destructive" })
            return
        }

        setAddingSaving(true)
        try {
            // Build CSV-style row for the import endpoint
            const row: Record<string, string> = {
                parent_email: newParent.email,
                parent_first_name: newParent.first_name,
                parent_last_name: newParent.last_name,
                ...(newParent2.email ? {
                    parent_2_email: newParent2.email,
                    parent_2_first_name: newParent2.first_name,
                    parent_2_last_name: newParent2.last_name,
                } : {}),
                total_fee: newTotalFee || '0',
                amount_paid: newAmountPaid || '0',
            }
            validChildren.forEach((child, i) => {
                const n = i + 1
                row[`child_${n}_first_name`] = child.first_name
                row[`child_${n}_last_name`] = child.last_name
                row[`child_${n}_dob`] = child.dob
            })

            const response = await fetch(`/api/organizations/group/${groupId}/membership/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: JSON.stringify({ rows: [row] }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to add parent')

            if (data.errors?.length > 0) {
                toast({ title: "Warning", description: data.errors[0], variant: "destructive" })
            } else {
                toast({ title: "Success", description: "Parent added successfully." })
            }

            setShowAddModal(false)
            resetAddForm()
            fetchRegistrations()
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" })
        } finally {
            setAddingSaving(false)
        }
    }

    const updateChild = (index: number, field: keyof NewChild, value: string) => {
        setNewChildren(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
    }

    const addChild = () => {
        if (newChildren.length < 5) {
            setNewChildren(prev => [...prev, { ...EMPTY_CHILD }])
        }
    }

    const removeChild = (index: number) => {
        if (newChildren.length > 1) {
            setNewChildren(prev => prev.filter((_, i) => i !== index))
        }
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
            <CsvMemberImport groupId={groupId} onImportComplete={fetchRegistrations} />

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
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button variant="outline" size="sm" className="w-full md:w-auto">
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                        <Button size="sm" className="w-full md:w-auto" onClick={() => setShowAddModal(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Parent
                        </Button>
                    </div>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[30px]"></TableHead>
                                <TableHead>Parent Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Children</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total Fee</TableHead>
                                <TableHead className="text-right">Paid</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRegistrations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
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
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-1 group">
                                                            <span>{getParentEmail(reg)}</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    const currentEmail = getParentEmail(reg)
                                                                    setEditEmailReg({ id: reg.id, email: currentEmail, field: 'parent_email' })
                                                                    setEditEmailValue(currentEmail)
                                                                }}
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                        <div className="flex items-center gap-1 group">
                                                            {getParent2Email(reg) ? (
                                                                <>
                                                                    <span className="text-xs">{getParent2Email(reg)}</span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            setEditEmailReg({ id: reg.id, email: getParent2Email(reg), field: 'parent_2_email' })
                                                                            setEditEmailValue(getParent2Email(reg))
                                                                        }}
                                                                    >
                                                                        <Pencil className="h-2.5 w-2.5" />
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-5 px-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        setEditEmailReg({ id: reg.id, email: '', field: 'parent_2_email' })
                                                                        setEditEmailValue('')
                                                                    }}
                                                                >
                                                                    <Plus className="h-3 w-3 mr-0.5" /> 2nd parent
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
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
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            title="Send reminder email"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                openSendReminderDialog(reg)
                                                            }}
                                                        >
                                                            <Send className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setConfirmDeleteId(reg.id)
                                                            }}
                                                            disabled={deletingId === reg.id}
                                                        >
                                                            {deletingId === reg.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {isExpanded && children.length > 0 && (
                                                <TableRow key={`${reg.id}-children`}>
                                                    <TableCell></TableCell>
                                                    <TableCell colSpan={8} className="py-3 bg-muted/20">
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

            {/* Send Reminder Dialog */}
            <Dialog open={!!sendReminderReg} onOpenChange={(open) => !open && setSendReminderReg(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Reminder Email</DialogTitle>
                        <DialogDescription>
                            Choose a template to send to <strong>{sendReminderReg?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        {reminders.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No email templates found. Create one under Membership → Communications.</p>
                        ) : (
                            reminders.map((r) => (
                                <div
                                    key={r.id}
                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedReminderId === r.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                                    onClick={() => setSelectedReminderId(r.id)}
                                >
                                    <div className={`mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 ${selectedReminderId === r.id ? 'border-primary bg-primary' : 'border-muted-foreground'}`} />
                                    <div>
                                        <p className="text-sm font-medium">{r.subject}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{r.body_text?.slice(0, 100)}...</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSendReminderReg(null)}>Cancel</Button>
                        <Button onClick={handleSendReminder} disabled={sendingReminder || !selectedReminderId}>
                            {sendingReminder && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Send
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Email Dialog */}
            <Dialog open={!!editEmailReg} onOpenChange={(open) => !open && setEditEmailReg(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editEmailReg?.field === 'parent_2_email' ? 'Second Parent Email' : 'Change Email Address'}</DialogTitle>
                        <DialogDescription>
                            {editEmailReg?.field === 'parent_2_email'
                                ? 'Set or update the second parent email. Leave blank to remove.'
                                : 'Update the email address that payment reminders are sent to for this registration.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="edit_email">Email Address</Label>
                        <Input
                            id="edit_email"
                            type="email"
                            value={editEmailValue}
                            onChange={(e) => setEditEmailValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleEditEmail()}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditEmailReg(null)}>Cancel</Button>
                        <Button onClick={handleEditEmail} disabled={editEmailSaving || !editEmailValue}>
                            {editEmailSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Registration?</DialogTitle>
                        <DialogDescription>
                            This will permanently remove this parent&apos;s registration and all associated payment schedules. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
                            disabled={!!deletingId}
                        >
                            {deletingId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Parent Dialog */}
            <Dialog open={showAddModal} onOpenChange={(open) => { if (!open) { setShowAddModal(false); resetAddForm() } }}>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Parent</DialogTitle>
                        <DialogDescription>
                            Add a new parent registration manually. This will create a user account if one doesn&apos;t exist.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="parent_first">First Name *</Label>
                                <Input
                                    id="parent_first"
                                    value={newParent.first_name}
                                    onChange={(e) => setNewParent(p => ({ ...p, first_name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="parent_last">Last Name *</Label>
                                <Input
                                    id="parent_last"
                                    value={newParent.last_name}
                                    onChange={(e) => setNewParent(p => ({ ...p, last_name: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="parent_email">Email *</Label>
                            <Input
                                id="parent_email"
                                type="email"
                                value={newParent.email}
                                onChange={(e) => setNewParent(p => ({ ...p, email: e.target.value }))}
                            />
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <p className="text-sm font-medium mb-3">Second Parent (optional)</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="parent2_first">First Name</Label>
                                    <Input
                                        id="parent2_first"
                                        value={newParent2.first_name}
                                        onChange={(e) => setNewParent2(p => ({ ...p, first_name: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="parent2_last">Last Name</Label>
                                    <Input
                                        id="parent2_last"
                                        value={newParent2.last_name}
                                        onChange={(e) => setNewParent2(p => ({ ...p, last_name: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1 mt-3">
                                <Label htmlFor="parent2_email">Email</Label>
                                <Input
                                    id="parent2_email"
                                    type="email"
                                    value={newParent2.email}
                                    onChange={(e) => setNewParent2(p => ({ ...p, email: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Children</Label>
                                {newChildren.length < 5 && (
                                    <Button variant="ghost" size="sm" onClick={addChild}>
                                        <Plus className="h-3 w-3 mr-1" /> Add Child
                                    </Button>
                                )}
                            </div>
                            {newChildren.map((child, i) => (
                                <div key={i} className="flex items-end gap-2">
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xs">First Name *</Label>
                                        <Input
                                            value={child.first_name}
                                            onChange={(e) => updateChild(i, 'first_name', e.target.value)}
                                            placeholder="First name"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xs">Last Name</Label>
                                        <Input
                                            value={child.last_name}
                                            onChange={(e) => updateChild(i, 'last_name', e.target.value)}
                                            placeholder="Last name"
                                        />
                                    </div>
                                    <div className="w-32 space-y-1">
                                        <Label className="text-xs">DOB</Label>
                                        <Input
                                            value={child.dob}
                                            onChange={(e) => updateChild(i, 'dob', e.target.value)}
                                            placeholder="DD/MM/YYYY"
                                        />
                                    </div>
                                    {newChildren.length > 1 && (
                                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 shrink-0" onClick={() => removeChild(i)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="total_fee">Total Fee (€)</Label>
                                <Input
                                    id="total_fee"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newTotalFee}
                                    onChange={(e) => setNewTotalFee(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="amount_paid">Amount Paid (€)</Label>
                                <Input
                                    id="amount_paid"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newAmountPaid}
                                    onChange={(e) => setNewAmountPaid(e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowAddModal(false); resetAddForm() }}>Cancel</Button>
                        <Button onClick={handleAddParent} disabled={addingSaving}>
                            {addingSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Add Parent
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
