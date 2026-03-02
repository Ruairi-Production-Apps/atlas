import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
    console.warn('RESEND_API_KEY is not defined. Email features will be disabled.');
}

// We provide a fallback key to prevent the constructor from throwing during Vercel builds
// where the user may not have provided a key yet.
export const resend = new Resend(apiKey || 're_mock_key_for_build');
