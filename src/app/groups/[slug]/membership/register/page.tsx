import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MembershipRegistrationForm } from "@/components/membership/membership-registration-form"

export default async function MembershipRegisterPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const supabase = await createClient()

    // 1. Get Group details
    const { data: group } = await supabase
        .from('groups')
        .select('*')
        .eq('slug', slug)
        .single()

    if (!group) {
        notFound()
    }

    // 2. Get Membership Config & Form
    const { data: config } = await supabase
        .from('membership_configs')
        .select('*, membership_fee_items(*)')
        .eq('group_id', group.id)
        .single()

    if (!config || !config.published) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Registration Closed</h1>
                <p className="text-muted-foreground">Membership registration for {group.name} is currently not open.</p>
            </div>
        )
    }

    const { data: form } = await supabase
        .from('membership_forms')
        .select('*')
        .eq('group_id', group.id)
        .single()

    // 3. Get Form Fields
    const { data: fields } = await supabase
        .from('membership_form_fields')
        .select('*')
        .eq('form_id', form?.id)
        .order('order_index')

    // 4. Get Current User info
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
                <h2 className="text-xl text-muted-foreground mb-8">Youth Member Registration 2026</h2>

                <MembershipRegistrationForm
                    group={group}
                    config={config}
                    form={form}
                    fields={fields || []}
                    user={user}
                />
            </div>
        </div>
    )
}
