import { createHmac } from 'crypto';

/**
 * Generate a signature for a sync payload.
 */
export function generateSignature(payload: any, token: string): string {
    const hmac = createHmac('sha256', token);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
}

/**
 * Verify a signature for a sync payload.
 */
export function verifySignature(payload: any, signature: string, token: string): boolean {
    if (!token) return false;
    const expectedSignature = generateSignature(payload, token);
    return expectedSignature === signature;
}
