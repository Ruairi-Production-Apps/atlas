"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { DeleteOrganizationDialog } from "./delete-organization-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LogoUpload } from "./logo-upload"
import { Trash2, CheckCircle2 } from "lucide-react"

interface EditOrganizationFormProps {
    organization: any
    type: 'province' | 'county' | 'group'
    provinces?: any[]
    counties?: any[]
    allowDelete?: boolean
}

export function EditOrganizationForm({
    organization,
    type,
    provinces = [],
    counties = [],
    allowDelete = true,
}: EditOrganizationFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [selectedProvince, setSelectedProvince] = useState<string>(organization.province_id || "")
    const [selectedCounty, setSelectedCounty] = useState<string>(organization.county_id || "")
    const [availableCounties, setAvailableCounties] = useState<any[]>(counties)

    const [formData, setFormData] = useState({
        name: organization.name || "",
        description: organization.description || "",
        long_description: organization.long_description || "",
        website: organization.website || "",
        email: organization.email || "",
        facebook_url: organization.facebook_url || "",
        instagram_url: organization.instagram_url || "",
        logo_url: organization.logo_url || "",
    })
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (type === 'group' && selectedProvince) {
            fetch(`/api/counties?provinceId=${selectedProvince}`)
                .then(res => res.json())
                .then(data => setAvailableCounties(data.counties || []))
                .catch(err => console.error('Failed to load counties:', err))
        }
    }, [type, selectedProvince])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const payload: any = {
                name: formData.name,
                description: formData.description || null,
                long_description: formData.long_description || null,
                website: formData.website || null,
                email: formData.email || null,
                facebook_url: formData.facebook_url || null,
                instagram_url: formData.instagram_url || null,
            }

            if (type === 'county') {
                payload.province_id = selectedProvince
            } else if (type === 'group') {
                payload.county_id = selectedCounty
            }

            const response = await fetch(`/api/admin/organizations/${type}/${organization.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update organization')
            }

            // Show success message
            setSuccess(true)
            // Hide success message after 3 seconds
            setTimeout(() => {
                setSuccess(false)
            }, 3000)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>
                    Update the {type} information
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {type === 'county' && (
                        <div className="space-y-2">
                            <Label htmlFor="province_id">Province *</Label>
                            <select
                                id="province_id"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                required
                                value={selectedProvince}
                                onChange={(e) => setSelectedProvince(e.target.value)}
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

                    {type === 'group' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="province_id">Province *</Label>
                                <select
                                    id="province_id"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                    required
                                    value={selectedProvince}
                                    onChange={(e) => {
                                        setSelectedProvince(e.target.value)
                                        setSelectedCounty("")
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
                                <Label htmlFor="county_id">County *</Label>
                                <select
                                    id="county_id"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                                    required
                                    value={selectedCounty}
                                    onChange={(e) => setSelectedCounty(e.target.value)}
                                    disabled={!selectedProvince}
                                >
                                    <option value="">Select a county</option>
                                    {availableCounties.map((county) => (
                                        <option key={county.id} value={county.id}>
                                            {county.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    <LogoUpload
                        organizationId={organization.id}
                        organizationType={type}
                        currentLogoUrl={organization.logo_url}
                        onLogoUpdate={(logoUrl) => setFormData(prev => ({ ...prev, logo_url: logoUrl || "" }))}
                    />

                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Short Description</Label>
                        <textarea
                            id="description"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="A brief description of the organization"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="long_description">Long Description</Label>
                        <RichTextEditor
                            content={formData.long_description}
                            onChange={(content) => setFormData(prev => ({ ...prev, long_description: content }))}
                            placeholder="Enter a detailed description of the organization..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            type="url"
                            value={formData.website}
                            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="facebook_url">Facebook URL</Label>
                        <Input
                            id="facebook_url"
                            type="url"
                            value={formData.facebook_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instagram_url">Instagram URL</Label>
                        <Input
                            id="instagram_url"
                            type="url"
                            value={formData.instagram_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
                        />
                    </div>

                    <div className="flex gap-4 justify-between">
                        <div className="flex gap-4">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Organization'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                        </div>
                        {allowDelete && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setDeleteDialogOpen(true)}
                                className="cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
            <DeleteOrganizationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                organizationName={organization.name}
                organizationType={type}
                onConfirm={handleDelete}
                loading={deleting}
            />
            <Dialog open={success} onOpenChange={setSuccess}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            Success
                        </DialogTitle>
                        <DialogDescription>
                            {type === 'province' && `Province ${formData.name} updated successfully!`}
                            {type === 'county' && `County ${formData.name} updated successfully!`}
                            {type === 'group' && `Group ${formData.name} updated successfully!`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end mt-4">
                        <Button onClick={() => setSuccess(false)}>
                            OK
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    )

    async function handleDelete() {
        setDeleting(true)
        try {
            const response = await fetch(`/api/admin/organizations/${type}/${organization.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                let errorMessage = 'Failed to delete organization'
                try {
                    const data = await response.json()
                    errorMessage = data.error || errorMessage
                } catch (jsonError) {
                    // If JSON parsing fails, try to get text
                    const text = await response.text()
                    errorMessage = text || errorMessage
                }
                throw new Error(errorMessage)
            }

            // Try to parse response, but don't fail if it's empty
            try {
                await response.json()
            } catch (jsonError) {
                // Response might be empty, that's okay
            }

            // Redirect to organizations list with success message
            const typeParam = type === 'province' ? 'province' : type === 'county' ? 'county' : 'group'
            router.push(`/admin/organizations?deleted=${typeParam}&name=${encodeURIComponent(organization.name)}`)
        } catch (error: any) {
            alert(error.message || 'Failed to delete organization')
        } finally {
            setDeleting(false)
            setDeleteDialogOpen(false)
        }
    }
}

