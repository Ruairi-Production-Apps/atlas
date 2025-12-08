
import { resend } from './resend';

interface SendEmailParams {
    to: string | string[];
    subject: string;
    html: string;
    from?: string; // Optional custom sender
}

const DEFAULT_SENDER = 'Atlas <onboarding@resend.dev>'; // Using Resend's testing domain initially

export async function sendEmail({ to, subject, html, from = DEFAULT_SENDER }: SendEmailParams) {
    try {
        const data = await resend.emails.send({
            from,
            to,
            subject,
            html,
        });

        return { success: true, data };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
    }
}
