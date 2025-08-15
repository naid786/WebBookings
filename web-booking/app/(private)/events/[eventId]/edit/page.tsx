import EventForm from "@/components/forms/event-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export const revalidated = 0

const EditEventPage = async ({ params }: { params: Promise<{ eventId: string }> }) => {
    const { eventId } = await params;
    const { userId, redirectToSignIn } = await auth();
    if (userId === null) return redirectToSignIn()

    const event = await db.query.EventTable.findFirst({
        where: (({ id, clerkUserId }, { eq, and }) => and(eq(clerkUserId, userId), eq(id, eventId))),
    })

    if (event == null) return notFound();
    return (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Edit Event</CardTitle>
            </CardHeader>
            <CardContent>
                <EventForm event={{ ...event, description: event.description || undefined }} />
            </CardContent>

        </Card>
    );
}

export default EditEventPage;