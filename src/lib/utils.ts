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

export function getOptimizedImageUrl(url: string | null, quality = 80) {
  if (!url) return ''
  // Ensure we don't double-process already processed URLs if called multiple times
  if (url.includes('quality=')) return url

  // Supabase Storage URL transformation
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.set('quality', quality.toString())
    return urlObj.toString()
  } catch (e) {
    return url
  }
}
