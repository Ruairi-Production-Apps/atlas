/**
 * Common type definitions shared across the application
 * 
 * This file contains reusable types to improve type safety and 
 * reduce the use of 'any' throughout the codebase.
 */

// ============================================================================
// User & Authentication
// ============================================================================

export interface User {
    id: string
    email: string
    created_at?: string
    updated_at?: string
}

export interface Profile extends User {
    first_name: string | null
    last_name: string | null
    full_name: string | null
    phone: string | null
    date_of_birth: string | null
    address_line1: string | null
    address_line2: string | null
    city: string | null
    county: string | null
    eircode: string | null
}

// ============================================================================
// Organizations
// ============================================================================

export type OrganizationType = 'province' | 'county' | 'group' | 'team'

export interface BaseOrganization {
    id: string
    name: string
    slug: string
    description: string | null
    created_at: string
    updated_at: string
}

export interface Province extends BaseOrganization {
    // Province-specific fields
}

export interface County extends BaseOrganization {
    province_id: string | null
}

export interface Group extends BaseOrganization {
    county_id: string | null
    province_id: string | null
}

export interface Team extends BaseOrganization {
    group_id: string | null
}

export type Organization = Province | County | Group | Team

// ============================================================================
// Error Handling
// ============================================================================

export class AppError extends Error {
    constructor(
        message: string,
        public code?: string,
        public details?: unknown
    ) {
        super(message)
        this.name = 'AppError'

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError)
        }
    }
}

export interface ApiErrorResponse {
    error: string
    code?: string
    details?: unknown
}

// ============================================================================
// Form & Event Handlers
// ============================================================================

export type InputChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => void

export type CheckboxChangeHandler = (id: string, checked: boolean) => void

export type SelectChangeHandler = (value: string) => void

// ============================================================================
// API Response Types
// ============================================================================

export type ApiResponse<T> =
    | { success: true; data: T }
    | { success: false; error: string; code?: string }

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Makes specific properties of T required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Makes specific properties of T optional
 */
export type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Extracts the awaited type from a Promise
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T
