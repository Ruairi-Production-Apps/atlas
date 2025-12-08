"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Trash2 } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export interface ContactInput {
    id: string // temporary ID for UI key
    name: string
    title: string
    email: string
    display_order: number
}

interface ContactListInputProps {
    contacts: ContactInput[]
    onChange: (contacts: ContactInput[]) => void
}

export function ContactListInput({ contacts, onChange }: ContactListInputProps) {
    const addContact = () => {
        const newContact: ContactInput = {
            id: `temp-${Date.now()}`,
            name: "",
            title: "",
            email: "",
            display_order: contacts.length,
        }
        onChange([...contacts, newContact])
    }

    const updateContact = (id: string, field: keyof ContactInput, value: string) => {
        onChange(contacts.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ))
    }

    const removeContact = (id: string) => {
        onChange(contacts.filter(c => c.id !== id))
    }

    return (
        <div className="space-y-4">
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">No.</TableHead>
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
                                            className="h-8"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={contact.title}
                                            onChange={(e) => updateContact(contact.id, 'title', e.target.value)}
                                            placeholder="Chairperson"
                                            className="h-8"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={contact.email}
                                            onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                                            placeholder="email@example.com"
                                            className="h-8"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeContact(contact.id)}
                                            className="text-destructive hover:text-destructive/90 h-8 w-8"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Button type="button" variant="outline" onClick={addContact} className="w-full border-dashed">
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
            </Button>
        </div>
    )
}
