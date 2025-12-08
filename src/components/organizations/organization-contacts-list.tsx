import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Mail } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

interface OrganizationContactsListProps {
    organizationId: string
}

export async function OrganizationContactsList({ organizationId }: OrganizationContactsListProps) {
    const supabase = await createClient()

    const { data: contacts } = await supabase
        .from('organization_contacts')
        .select('*')
        .eq('organization_id', organizationId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })

    if (!contacts || contacts.length === 0) {
        return null
    }

    return (
        <Card className="mb-8">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center text-xl">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Key Contacts
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {contacts.map((contact) => (
                    <div key={contact.id} className="p-3 rounded-lg border bg-card/50 hover:bg-muted/50 transition-colors">
                        <h3 className="font-semibold text-foreground">{contact.name}</h3>
                        <p className="text-sm text-primary font-medium mb-2">{contact.title}</p>
                        {contact.email && (
                            <a
                                href={`mailto:${contact.email}`}
                                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
                            >
                                <Mail className="h-3 w-3" />
                                {contact.email}
                            </a>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
