"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Plus, Trash2, GripVertical, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface Contact {
    id: string
    name: string
    title: string
    email: string | null
    display_order: number
}

interface OrganizationContactsManagerProps {
    organizationId: string
    organizationType: 'province' | 'county' | 'group'
}

export function OrganizationContactsManager({ organizationId, organizationType }: OrganizationContactsManagerProps) {
    const [contacts, setContacts] = useState<Contact[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const { toast } = useToast()
    const supabase = createClient()

    useEffect(() => {
        fetchContacts()
    }, [organizationId])

    const fetchContacts = async () => {
        try {
            const { data, error } = await supabase
                .from('organization_contacts')
                .select('*')
                .eq('organization_id', organizationId)
                .order('display_order', { ascending: true })
                .order('created_at', { ascending: true })

            if (error) throw error
            setContacts(data || [])
        } catch (error) {
            console.error('Error fetching contacts:', error)
            toast({
                title: "Error",
                description: "Failed to load contacts",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const addContact = () => {
        const newContact: Contact = {
            id: `temp-${Date.now()}`,
            name: "",
            title: "",
            email: "",
            display_order: contacts.length,
        }
        setContacts([...contacts, newContact])
    }

    const updateContact = (id: string, field: keyof Contact, value: string) => {
        setContacts(contacts.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ))
    }

    const removeContact = (id: string) => {
        setContacts(contacts.filter(c => c.id !== id))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // Split contacts into new (insert) and existing (update)
            const newContacts = contacts
                .filter(c => c.id.startsWith('temp-'))
                .map((c, index) => ({
                    organization_id: organizationId,
                    organization_type: organizationType,
                    name: c.name,
                    title: c.title,
                    email: c.email || null,
                    display_order: index,
                }))

            const existingContacts = contacts
                .filter(c => !c.id.startsWith('temp-'))
                .map((c, index) => ({
                    id: c.id,
                    organization_id: organizationId,
                    organization_type: organizationType,
                    name: c.name,
                    title: c.title,
                    email: c.email || null,
                    display_order: index,
                }))

            // 1. Delete contacts that are no longer in the list
            // First get current IDs in DB
            const { data: currentDbContacts } = await supabase
                .from('organization_contacts')
                .select('id')
                .eq('organization_id', organizationId)

            if (currentDbContacts) {
                const currentIds = contacts.filter(c => !c.id.startsWith('temp-')).map(c => c.id)
                const idsToDelete = currentDbContacts
                    .map(c => c.id)
                    .filter(id => !currentIds.includes(id))

                if (idsToDelete.length > 0) {
                    await supabase
                        .from('organization_contacts')
                        .delete()
                        .in('id', idsToDelete)
                }
            }

            // 2. Insert new contacts
            if (newContacts.length > 0) {
                const { error } = await supabase
                    .from('organization_contacts')
                    .insert(newContacts)

                if (error) throw error
            }

            // 3. Update existing contacts
            if (existingContacts.length > 0) {
                const { error } = await supabase
                    .from('organization_contacts')
                    .upsert(existingContacts)

                if (error) throw error
            }

            toast({
                title: "Success",
                description: "Contacts saved successfully",
            })
            fetchContacts() // Refresh to get real IDs
        } catch (error: any) {
            console.error('Error saving contacts:', error)
            toast({
                title: "Error",
                description: error.message || "Failed to save contacts",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
    }

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Contacts</CardTitle>
                    <CardDescription>
                        Key contacts for this organization
                    </CardDescription>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contacts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                                    No contacts added yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            contacts.map((contact, index) => (
                                <TableRow key={contact.id}>
                                    <TableCell className="font-medium text-muted-foreground">
                                        #{index + 1}
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={contact.name}
                                            onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                                            placeholder="John Doe"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={contact.title}
                                            onChange={(e) => updateContact(contact.id, 'title', e.target.value)}
                                            placeholder="Chairperson"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={contact.email || ''}
                                            onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                                            placeholder="email@example.com"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeContact(contact.id)}
                                            className="text-destructive hover:text-destructive/90"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <div className="mt-4">
                    <Button variant="outline" onClick={addContact} className="w-full border-dashed">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Contact
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
