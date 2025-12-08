'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SetupPage() {
    const [email, setEmail] = useState('admin@atlas.local')
    const [password, setPassword] = useState('admin123')
    const [firstName, setFirstName] = useState('System')
    const [lastName, setLastName] = useState('Administrator')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleCreate = async () => {
        setLoading(true)
        setMessage(null)

        try {
            const response = await fetch('/api/admin/create-sysadmin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: `${firstName} ${lastName}`
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create sysadmin')
            }

            setMessage({
                type: 'success',
                text: `Sysadmin created successfully! Email: ${email}, Password: ${password}`,
            })
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.message || 'Failed to create sysadmin',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-12 max-w-md">
            <Card>
                <CardHeader>
                    <CardTitle>Initial Setup</CardTitle>
                    <CardDescription>
                        Create the first sysadmin user for Atlas
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@atlas.local"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="admin123"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="System"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Administrator"
                            />
                        </div>
                    </div>
                    {message && (
                        <div
                            className={`p-3 rounded ${message.type === 'success'
                                ? 'bg-green-50 text-green-800'
                                : 'bg-red-50 text-red-800'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}
                    <Button onClick={handleCreate} disabled={loading} className="w-full">
                        {loading ? 'Creating...' : 'Create Sysadmin'}
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                        Note: This requires SUPABASE_SERVICE_ROLE_KEY to be set in your .env.local
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

