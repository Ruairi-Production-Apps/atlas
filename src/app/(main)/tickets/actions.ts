'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import { createTicket, createTicketReply, updateTicketStatus } from '@/lib/supabase/queries'

export async function submitTicket(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const type = formData.get('type') as any
    const subject = formData.get('subject') as string
    const description = formData.get('description') as string

    if (!subject || !description) {
        throw new Error('Missing required fields')
    }

    const ticket = await createTicket({
        user_id: user.id,
        type,
        subject,
        description,
    })

    // Handle attachments
    const files = formData.getAll('files') as File[]
    if (files && files.length > 0) {
        const { createTicketAttachment } = await import('@/lib/supabase/queries')

        for (const file of files) {
            if (file.size > 0 && file.name !== 'undefined') {
                const fileExt = file.name.split('.').pop()
                const fileName = `${ticket.id}/${crypto.randomUUID()}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('ticket-attachments')
                    .upload(fileName, file)

                if (uploadError) {
                    console.error('Failed to upload file:', uploadError)
                    continue
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('ticket-attachments')
                    .getPublicUrl(fileName)

                await createTicketAttachment({
                    ticket_id: ticket.id,
                    file_name: file.name,
                    file_url: publicUrl,
                    file_size: file.size,
                    mime_type: file.type
                })
            }
        }
    }

    revalidatePath('/tickets')
    return { success: true, id: ticket.id }
}

export async function submitReply(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const ticketId = formData.get('ticketId') as string
    const message = formData.get('message') as string

    if (!ticketId || !message) {
        throw new Error('Missing required fields')
    }

    await createTicketReply({
        ticket_id: ticketId,
        user_id: user.id,
        message,
    })

    revalidatePath(`/tickets/${ticketId}`)
}

export async function closeTicket(ticketId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    // Rely on RLS + updateTicketStatus to handle permissions
    // But we might want to check ownership here if strictly enforcing before DB call
    // The DB call will fail if RLS is correct and user doesn't own it (unless admin)

    await updateTicketStatus(ticketId, 'completed')
    revalidatePath(`/tickets/${ticketId}`)
    revalidatePath('/tickets')
}

export async function reopenTicket(ticketId: string) {
    // Similar logic, if we allow reopening
    await updateTicketStatus(ticketId, 'open')
    revalidatePath(`/tickets/${ticketId}`)
    revalidatePath('/tickets')
}
