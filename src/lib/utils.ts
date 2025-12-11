import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function getOptimizedImageUrl(url: string | null | undefined, quality: number) {
  if (!url) return ''
  try {
    // Check if it's a Supabase URL
    if (url.includes('supabase.co')) {
      const separator = url.includes('?') ? '&' : '?'
      return `${url}${separator}quality=${quality}`
    }
  } catch (e) {
    console.error('Error optimizing image URL:', e)
  }
  return url
}
