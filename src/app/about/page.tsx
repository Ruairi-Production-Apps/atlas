import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">About Atlas</h1>

            <div className="space-y-8">
                <section className="prose dark:prose-invert max-w-none">
                    <p className="text-lg mb-6">
                        Atlas is the central hub for Scouters— a modern map for events, resources, and group management.
                        It allows Scouters to create, manage, and find news, events, and resources for Scouting in Ireland.
                        It also includes a suite of tools to help manage Groups, Counties, Provinces, and Events.
                    </p>
                    <p className="text-lg mb-6">
                        Atlas is provided free of charge and is built & maintained by Scouters. Our payment processor, Stripe, charges a fee of 1.4% + €0.25 per online transaction.
                    </p>
                </section>

                <div className="grid md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resources</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>
                                Atlas contains news and events at the Group, County, and Provincial level.
                                It also contains a searchable knowledgebase of resources, including official Scouting Ireland documents.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tools</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">
                                Atlas provides a suite of tools to help manage Groups, Counties, Provinces, and Events.
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong>Events System:</strong> Allows events to be created and shown on the Calendar. You can also take payment for events, and create custom Registration forms.
                                </li>
                                <li>
                                    <strong>Shop System:</strong> Allows you to take any kind of payment for your Group, County, or Province.
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
