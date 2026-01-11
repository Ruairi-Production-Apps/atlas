/**
 * Error handling utilities for consistent error management
 * 
 * Provides standardized error handling and transformation across the application.
 */

import { AppError } from '@/types/common'

/**
 * Transforms unknown errors into AppError instances
 * Useful for catch blocks where error type is unknown
 */
export function handleApiError(error: unknown): AppError {
    // Already an AppError
    if (error instanceof AppError) {
        return error
    }

    // Standard Error
    if (error instanceof Error) {
        return new AppError(error.message)
    }

    // Unknown type
    return new AppError(
        'An unexpected error occurred',
        'UNKNOWN_ERROR',
        error
    )
}

/**
 * Extracts error message from various error types
 * Useful for displaying error messages to users
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof AppError || error instanceof Error) {
        return error.message
    }

    if (typeof error === 'string') {
        return error
    }

    return 'An unexpected error occurred'
}

/**
 * Checks if an error is an AppError with a specific code
 */
export function isErrorCode(error: unknown, code: string): boolean {
    return error instanceof AppError && error.code === code
}
