import BookingForm from "@/components/forms/booking-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { getValidTimesFromSchedule } from "@/lib/getValidTimesFromSchedule";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { addMonths, eachMinuteOfInterval, endOfDay, roundToNearestMinutes } from "date-fns";
import { not } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

const BookEventPage = async ({ params }: { params: { clerkUserId: string, eventId: string } }) => {
    const { clerkUserId, eventId } = await params;

    const event = await db.query.EventTable.findFirst({
        where: (({
            clerkUserId: userIdCol,
            id: eventId,
            isActive,
            id
        }, { eq, and }) => and(eq(userIdCol, clerkUserId), eq(id, eventId), eq(isActive, true)))
    });

    if (event == null) return notFound();

    const calendarUser = await (await clerkClient()).users.getUser(clerkUserId);

    const startDate = roundToNearestMinutes(new Date(), {
        nearestTo: 15,
        roundingMethod: 'ceil'
    })

    const endDate = endOfDay(addMonths(startDate, 2));

    const validTimes = await getValidTimesFromSchedule(eachMinuteOfInterval({
        start: startDate,
        end: endDate
    }, { step: 15 }), event)


    if (validTimes.length === 0) {
        return (
            <NoTimeSlots event={event} calendarUser={calendarUser} />
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Book {event.name} with {calendarUser.fullName}
                </CardTitle>
                {event.description && (
                    <CardDescription>{event.description}</CardDescription>
                )}
            </CardHeader>
            <CardContent>
                <BookingForm
                    validTimes={validTimes}
                    eventId={event.id}
                    clerkUserId={event.clerkUserId}
                />
            </CardContent>
            {/* <CardFooter>
                <Button asChild>
                    
                </Button>
            </CardFooter> */}
        </Card>
    );
}

export default BookEventPage;

const NoTimeSlots = ({ event, calendarUser }: {
    event: { name: string; description: string | null },
    calendarUser: { id: string; fullName: string | null }
}) => {

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Book {event.name} with {calendarUser.fullName}
                </CardTitle>
                {event.description && (
                    <CardDescription>{event.description}</CardDescription>
                )}
            </CardHeader>
            <CardContent>
                {calendarUser.fullName } is currently not available for booking. Please check back later or contact them directly.
             </CardContent>
             <CardFooter>
                <Button asChild>
                    <Link href={`/book/${calendarUser.id}`}>
                        Back
                    </Link>
                </Button>
             </CardFooter>
        </Card>
    );
}
