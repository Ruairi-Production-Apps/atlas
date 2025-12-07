"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

export default function NewOrganizationPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const type = searchParams.get('type') || 'province'

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [provinces, setProvinces] = useState<any[]>([])
    const [counties, setCounties] = useState<any[]>([])
    const [selectedProvince, setSelectedProvince] = useState<string>("")
    const [selectedCounty, setSelectedCounty] = useState<string>("")

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        long_description: "",
        website: "",
        email: "",
        facebook_url: "",
        instagram_url: "",
        province_id: "",
        county_id: "",
        logo_url: "",
    })
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)

    useEffect(() => {
        if (type === 'county' || type === 'group') {
            fetch('/api/provinces')
                .then(res => res.json())
                .then(data => setProvinces(data.provinces || []))
                .catch(err => console.error('Failed to load provinces:', err))
        }
    }, [type])

    useEffect(() => {
        if (type === 'group' && selectedProvince) {
            fetch(`/api/counties?provinceId=${selectedProvince}`)
                .then(res => res.json())
                .then(data => setCounties(data.counties || []))
                .catch(err => console.error('Failed to load counties:', err))
        } else {
            setCounties([])
            setSelectedCounty("")
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

            const response = await fetch(`/api/admin/organizations/${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create organization')
            }

            // Upload logo if file was selected
            if (logoFile && data.organization?.id) {
                try {
                    const logoFormData = new FormData()
                    logoFormData.append('file', logoFile)

                    const logoResponse = await fetch(
                        `/api/admin/organizations/${type}/${data.organization.id}/logo`,
                        {
                            method: 'POST',
                            body: logoFormData,
                        }
                    )

                    if (!logoResponse.ok) {
                        console.error('Failed to upload logo, but organization was created')
                        // Continue anyway - organization was created successfully
                    }
                } catch (logoError) {
                    console.error('Error uploading logo:', logoError)
                    // Continue anyway - organization was created successfully
                }
            }

            // Redirect to edit page with success parameter
            router.push(`/admin/organizations/${data.organization.id}/edit?type=${type}&created=true`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">
                Create New {type.charAt(0).toUpperCase() + type.slice(1)}
            </h1>
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Organization Details</CardTitle>
                    <CardDescription>
                        Create a new {type} in the scouting organization
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
                                        {counties.map((county) => (
                                            <option key={county.id} value={county.id}>
                                                {county.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label>Logo</Label>
                            <div className="flex items-start gap-4">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Logo preview"
                                        className="w-32 h-32 object-contain border border-input rounded-md bg-muted p-2"
                                    />
                                ) : (
                                    <div className="w-32 h-32 border border-dashed border-input rounded-md bg-muted flex items-center justify-center">
                                        <span className="text-muted-foreground text-sm">No logo</span>
                                    </div>
                                )}
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
                                                if (!allowedTypes.includes(file.type)) {
                                                    alert('Invalid file type. Only images are allowed.')
                                                    return
                                                }
                                                if (file.size > 5 * 1024 * 1024) {
                                                    alert('File size exceeds 5MB limit.')
                                                    return
                                                }
                                                setLogoFile(file)
                                                const reader = new FileReader()
                                                reader.onloadend = () => {
                                                    setLogoPreview(reader.result as string)
                                                }
                                                reader.readAsDataURL(file)
                                            }
                                        }}
                                        className="hidden"
                                        id="logo-upload"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('logo-upload')?.click()}
                                    >
                                        {logoPreview ? 'Change Logo' : 'Upload Logo'}
                                    </Button>
                                    {logoFile && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setLogoFile(null)
                                                setLogoPreview(null)
                                                const input = document.getElementById('logo-upload') as HTMLInputElement
                                                if (input) input.value = ''
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Recommended: Square image, max 5MB. Formats: JPEG, PNG, GIF, WebP, SVG
                                    </p>
                                </div>
                            </div>
                        </div>

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

                        <div className="flex gap-4">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Organization'}
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

