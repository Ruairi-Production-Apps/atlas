import { CreateTicketForm } from "@/components/tickets/create-ticket-form"

export default function NewTicketPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8">Create Support Ticket</h1>
            <CreateTicketForm />
        </div>
    )
}
