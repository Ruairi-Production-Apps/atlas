
import { resend } from './resend';

interface SendEmailParams {
    to: string | string[];
    subject: string;
    html: string;
    from?: string; // Optional custom sender
}

const DEFAULT_SENDER = process.env.RESEND_FROM_EMAIL ? `Atlas <${process.env.RESEND_FROM_EMAIL}>` : 'Atlas <onboarding@resend.dev>';

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
