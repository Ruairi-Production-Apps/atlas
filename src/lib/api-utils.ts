import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

type ApiErrorResponse = {
    error: string
    code?: string
    details?: any
}

export function handleApiError(error: unknown) {
    console.error('API Error Details:', error)

    if (error instanceof ZodError) {
        return NextResponse.json<ApiErrorResponse>({
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.flatten().fieldErrors
        }, { status: 400 })
    }

    if (error instanceof Error) {
        // Simple error message return
        // You might want to hide stack traces in production
        return NextResponse.json<ApiErrorResponse>({
            error: error.message,
            code: 'INTERNAL_ERROR'
        }, { status: 500 })
    }

    return NextResponse.json<ApiErrorResponse>({
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
    }, { status: 500 })
}

export function unauthorizedResponse(message = 'Unauthorized') {
    return NextResponse.json<ApiErrorResponse>({ error: message, code: 'UNAUTHORIZED' }, { status: 401 })
}

export function forbiddenResponse(message = 'Forbidden') {
    return NextResponse.json<ApiErrorResponse>({ error: message, code: 'FORBIDDEN' }, { status: 403 })
}

export function notFoundResponse(message = 'Resource not found') {
    return NextResponse.json<ApiErrorResponse>({ error: message, code: 'NOT_FOUND' }, { status: 404 })
}
