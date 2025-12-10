'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { X } from 'lucide-react'

interface ImageModalProps {
    src: string
    alt: string
}

export function ImageModal({ src, alt }: ImageModalProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div
                className="aspect-video w-full overflow-hidden rounded-lg bg-muted mb-8 cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => setIsOpen(true)}
            >
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                />
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-5xl w-[90vw] p-0 overflow-hidden bg-transparent border-none shadow-none">
                    <DialogTitle className="sr-only">View full size image</DialogTitle>
                    <div className="relative flex items-center justify-center w-full h-full">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute -top-10 -right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-50 focus:outline-none"
                        >
                            <X className="h-6 w-6" />
                            <span className="sr-only">Close</span>
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={src}
                            alt={alt}
                            className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
