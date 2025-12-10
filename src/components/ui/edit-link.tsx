'use client'

import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditLinkProps {
    href: string
    label?: string
}

export function EditLink({ href, label = 'Edit' }: EditLinkProps) {
    return (
        <Button variant="link" size="sm" asChild className="px-0 h-auto font-normal text-muted-foreground hover:text-primary">
            <Link href={href} className="flex items-center gap-1">
                <Pencil className="h-3 w-3" />
                {label}
            </Link>
        </Button>
    )
}
