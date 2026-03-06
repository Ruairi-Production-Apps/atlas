import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy for Atlas</h1>
            <p className="text-muted-foreground mb-8">Last updated: {new Date().getFullYear()}</p>

            <div className="space-y-8">
                <section>
                    <p className="mb-4">
                        Atlas (we, our, or us) is committed to protecting your privacy and ensuring that your personal information is handled securely and transparently. This Privacy Policy explains what information we collect, how we use it, and the rights you have under the General Data Protection Regulation (GDPR).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">1. Who We Are</h2>
                    <p className="mb-4">
                        Atlas is a platform designed for Scouts and Scouters to manage events, resources, and group activities.
                    </p>
                    <p>
                        If you have any questions about this Privacy Policy, please contact:<br />
                        <strong>Email:</strong> support@atlashub.ie
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                    <p className="mb-4">We only collect information necessary to operate the platform and provide its services. This includes:</p>

                    <h3 className="text-xl font-semibold mb-2">Account Information</h3>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Name</li>
                        <li>Email address</li>
                        <li>Group or organisation details</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-2">User-Generated Content</h3>
                    <p className="mb-2">Content you add to the platform, such as:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Events</li>
                        <li>Resources</li>
                        <li>Notes</li>
                        <li>Uploaded files</li>
                    </ul>

                    <h3 className="text-xl font-semibold mb-2">Technical Information</h3>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Browser type</li>
                        <li>Device type</li>
                        <li>IP address (for security and abuse prevention)</li>
                    </ul>
                    <p>We do <strong>not</strong> sell, share, or transmit your data outside of the website.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
                    <p className="mb-4">We process your data to:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Provide and improve the Atlas service</li>
                        <li>Allow you to publish and manage content</li>
                        <li>Maintain platform security</li>
                        <li>Communicate with you about updates or support issues</li>
                        <li>Comply with legal obligations</li>
                    </ul>
                    <p>We do <strong>not</strong> use your information for advertising or profiling.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">4. Storage and Security</h2>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>All user data—including uploaded files—is securely stored on <strong>Supabase</strong>, which provides encrypted storage and industry-standard security controls.</li>
                        <li>We take appropriate technical and organisational measures to protect your information.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">5. Deleting Your Content</h2>
                    <p className="mb-4">Users can unpublish or delete any content they create on Atlas.</p>
                    <p className="mb-4">When content is deleted:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>It is <strong>"soft deleted"</strong> — meaning it is removed from public view but still stored securely in our system.</li>
                        <li>Soft-deleted content is <strong>permanently erased after 30 days</strong>.</li>
                    </ul>
                    <p>
                        If you want any content <strong>deleted immediately</strong>, you may request this by contacting:<br />
                        <strong>admin@atlashub.ie</strong>
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">6. Deleting Your Account</h2>
                    <p className="mb-4">You may delete your account at any time. When you delete your account:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Your personal information is <strong>soft deleted</strong> (kept securely but hidden).</li>
                        <li>All personal information is <strong>fully removed after 30 days</strong>.</li>
                        <li>You may request immediate deletion by emailing <strong>admin@atlashub.ie</strong>.</li>
                    </ul>
                    <p>After permanent deletion, no personal data is retained.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">7. Legal Basis for Processing (GDPR)</h2>
                    <p className="mb-4">We process your data under the following legal grounds:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li><strong>Consent</strong> — when you create an account or upload content</li>
                        <li><strong>Contractual necessity</strong> — to provide Atlas and its features</li>
                        <li><strong>Legitimate interest</strong> — to maintain platform security and prevent misuse</li>
                        <li><strong>Legal obligations</strong> — where required by Irish or EU law</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">8. Your Rights Under GDPR</h2>
                    <p className="mb-4">You have the right to:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Access your personal data</li>
                        <li>Correct inaccurate data</li>
                        <li>Delete your data (“right to be forgotten”)</li>
                        <li>Restrict or object to processing</li>
                        <li>Download your data (“data portability”)</li>
                        <li>Withdraw consent at any time</li>
                    </ul>
                    <p>
                        To exercise any of these rights, contact:<br />
                        <strong>admin@atlashub.ie</strong>
                    </p>
                    <p>We will respond within the legally required timeframe.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">9. Data Retention</h2>
                    <p className="mb-4">We keep your information only for as long as necessary to provide the service.</p>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Active account data is kept until you delete your account.</li>
                        <li>Deleted content and account data is retained in a secure, non-public form for <strong>30 days</strong>, then permanently deleted.</li>
                    </ul>
                    <p>For legal or security reasons, we may retain minimal audit logs for a limited time.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">10. International Transfers</h2>
                    <p className="mb-4">All data is stored within services hosted in the EU or services compliant with GDPR data transfer requirements.</p>
                    <p>Data is <strong>not</strong> sold, exchanged, or shared with third parties.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">11. Changes to This Policy</h2>
                    <p>We may update this Privacy Policy from time to time. If we make significant changes, we will notify users through the website or via email.</p>
                </section>

                <section className="bg-muted p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                    <p className="mb-2">If you have questions, concerns, or deletion requests, please contact:</p>
                    <p className="text-lg font-medium">📩 admin@atlashub.ie</p>
                </section>
            </div>
        </div>
    )
}
