import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { formatDateTime } from "@/lib/formatters";
import { clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/dist/client/components/navigation";

const SuccesPage = async ({
    params: { clerkUserId, eventId },
    searchParams: { startTime }
}: {
    params: { clerkUserId: string, eventId: string },
    searchParams: { startTime: string }
}) => {
    const event = await db.query.EventTable.findFirst({
        where: ({
            clerkUserId, isActive, id
        }, { eq, and }) => and(
            eq(clerkUserId, clerkUserId),
            eq(isActive, true),
            eq(id, eventId)
        )
    });

    if (event == null) return notFound();

    const calendarUser = await (await clerkClient()).users.getUser(clerkUserId);
    const startTimeDate = new Date(startTime);

    return (
        <Card className="max-w-xl mx-auto mt-24">
            <CardHeader>
                <CardTitle>
                 Successful Booked with {calendarUser.fullName}!
                </CardTitle>
                <CardDescription>{formatDateTime(startTimeDate)}</CardDescription>
            </CardHeader>
            <CardContent>
                You should receive an email with the details of your booking. You can close this page now.
            </CardContent>

        </Card>
    );
}

export default SuccesPage;