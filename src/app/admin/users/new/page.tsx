"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { getProvinces, getCounties, getGroups } from "@/lib/supabase/queries"
import { useEffect } from "react"

export default function AddUserPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [provinces, setProvinces] = useState<any[]>([])
    const [counties, setCounties] = useState<any[]>([])
    const [groups, setGroups] = useState<any[]>([])
    const [selectedProvince, setSelectedProvince] = useState<string>("")
    const [selectedCounty, setSelectedCounty] = useState<string>("")
    const [selectedGroup, setSelectedGroup] = useState<string>("")

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "section_leader" as "sysadmin" | "provincial_admin" | "county_admin" | "group_leader" | "section_leader",
        scope_type: "group" as "system" | "province" | "county" | "group" | "section",
        scope_id: "",
        skip_email_verification: false,
    })

    useEffect(() => {
        // Load provinces
        fetch('/api/provinces')
            .then(res => res.json())
            .then(data => setProvinces(data.provinces || []))
            .catch(err => console.error('Failed to load provinces:', err))
    }, [])

    useEffect(() => {
        if (selectedProvince) {
            fetch(`/api/counties?provinceId=${selectedProvince}`)
                .then(res => res.json())
                .then(data => setCounties(data.counties || []))
                .catch(err => console.error('Failed to load counties:', err))
        } else {
            setCounties([])
            setSelectedCounty("")
        }
    }, [selectedProvince])

    useEffect(() => {
        if (selectedCounty) {
            fetch(`/api/groups?countyId=${selectedCounty}`)
                .then(res => res.json())
                .then(data => setGroups(data.groups || []))
                .catch(err => console.error('Failed to load groups:', err))
        } else {
            setGroups([])
            setSelectedGroup("")
        }
    }, [selectedCounty])

    useEffect(() => {
        // Update scope_id based on selections
        if (formData.scope_type === 'province' && selectedProvince) {
            setFormData(prev => ({ ...prev, scope_id: selectedProvince }))
        } else if (formData.scope_type === 'county' && selectedCounty) {
            setFormData(prev => ({ ...prev, scope_id: selectedCounty }))
        } else if (formData.scope_type === 'group' && selectedGroup) {
            setFormData(prev => ({ ...prev, scope_id: selectedGroup }))
        } else {
            setFormData(prev => ({ ...prev, scope_id: "" }))
        }
    }, [formData.scope_type, selectedProvince, selectedCounty, selectedGroup])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user')
            }

            router.push('/admin/users')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Add New User</h1>
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>User Details</CardTitle>
                    <CardDescription>
                        Create a new user and assign them a role in the organization
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role *</Label>
                            <select
                                id="role"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                required
                                value={formData.role}
                                onChange={(e) => {
                                    const role = e.target.value as typeof formData.role
                                    setFormData(prev => ({
                                        ...prev,
                                        role,
                                        scope_type: role === 'sysadmin' ? 'system' :
                                            role === 'provincial_admin' ? 'province' :
                                                role === 'county_admin' ? 'county' :
                                                    role === 'group_leader' ? 'group' : 'section',
                                    }))
                                }}
                            >
                                <option value="sysadmin">System Admin</option>
                                <option value="provincial_admin">Provincial Admin</option>
                                <option value="county_admin">County Admin</option>
                                <option value="group_leader">Group Leader</option>
                                <option value="section_leader">Section Leader</option>
                            </select>
                        </div>

                        {formData.role !== 'sysadmin' && (
                            <>
                                {formData.scope_type === 'province' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="province">Province *</Label>
                                        <select
                                            id="province"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                            required
                                            value={selectedProvince}
                                            onChange={(e) => {
                                                setSelectedProvince(e.target.value)
                                                setSelectedCounty("")
                                                setSelectedGroup("")
                                            }}
                                        >
                                            <option value="">Select a province</option>
                                            {provinces.map((province) => (
                                                <option key={province.id} value={province.id}>
                                                    {province.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {formData.scope_type === 'county' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="province">Province *</Label>
                                            <select
                                                id="province"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                                required
                                                value={selectedProvince}
                                                onChange={(e) => {
                                                    setSelectedProvince(e.target.value)
                                                    setSelectedCounty("")
                                                    setSelectedGroup("")
                                                }}
                                            >
                                                <option value="">Select a province</option>
                                                {provinces.map((province) => (
                                                    <option key={province.id} value={province.id}>
                                                        {province.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="county">County *</Label>
                                            <select
                                                id="county"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                                required
                                                value={selectedCounty}
                                                onChange={(e) => {
                                                    setSelectedCounty(e.target.value)
                                                    setSelectedGroup("")
                                                }}
                                                disabled={!selectedProvince}
                                            >
                                                <option value="">Select a county</option>
                                                {counties.map((county) => (
                                                    <option key={county.id} value={county.id}>
                                                        {county.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                {formData.scope_type === 'group' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="province">Province *</Label>
                                            <select
                                                id="province"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                                required
                                                value={selectedProvince}
                                                onChange={(e) => {
                                                    setSelectedProvince(e.target.value)
                                                    setSelectedCounty("")
                                                    setSelectedGroup("")
                                                }}
                                            >
                                                <option value="">Select a province</option>
                                                {provinces.map((province) => (
                                                    <option key={province.id} value={province.id}>
                                                        {province.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="county">County *</Label>
                                            <select
                                                id="county"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                                required
                                                value={selectedCounty}
                                                onChange={(e) => {
                                                    setSelectedCounty(e.target.value)
                                                    setSelectedGroup("")
                                                }}
                                                disabled={!selectedProvince}
                                            >
                                                <option value="">Select a county</option>
                                                {counties.map((county) => (
                                                    <option key={county.id} value={county.id}>
                                                        {county.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="group">Group *</Label>
                                            <select
                                                id="group"
                                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                                required
                                                value={selectedGroup}
                                                onChange={(e) => setSelectedGroup(e.target.value)}
                                                disabled={!selectedCounty}
                                            >
                                                <option value="">Select a group</option>
                                                {groups.map((group) => (
                                                    <option key={group.id} value={group.id}>
                                                        {group.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="skip_email_verification"
                                checked={formData.skip_email_verification}
                                onChange={(e: any) => setFormData(prev => ({ ...prev, skip_email_verification: e.target.checked }))}
                            />
                            <Label htmlFor="skip_email_verification" className="cursor-pointer">
                                Skip email verification
                            </Label>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create User'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

