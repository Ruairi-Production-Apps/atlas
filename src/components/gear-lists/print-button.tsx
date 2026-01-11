'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function PrintButton() {
    return (
        <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            className="print:hidden"
        >
            <Printer className="h-4 w-4 mr-2" />
            Print
        </Button>
    )
}
