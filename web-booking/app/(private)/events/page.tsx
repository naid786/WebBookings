import CopyEventButton from "@/components/copy-event-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { formatEventDescription } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { CalendarPlus, CalendarRange } from "lucide-react";
import Link from "next/link";

export const revalidated = 0

type EventCardProps = {
    id: string;
    clerkUserId: string;
    name: string;
    description: string | null;
    durationInMinutes: number;
    isActive: boolean | null;
}

const EventCard = ({ id, clerkUserId, name, description, durationInMinutes, isActive }: EventCardProps) => {
    return (
        <Card className={cn("flex flex-col h-full",!isActive && "border-secondary/50")}>
            <CardHeader className={cn(!isActive && "opacity-50")}>
                <CardTitle >{name}</CardTitle>
                <CardDescription >
                    Duration: {formatEventDescription(durationInMinutes)}
                </CardDescription>
            </CardHeader>
            
            {description != null && (
                <CardContent >
                    {description }
                </CardContent>
            )}

            <CardFooter className="flex justify-end gap-2 mt-auto">
                {isActive && <CopyEventButton eventId={id} clerkUserId={clerkUserId} />}
                <Button asChild variant="outline" size="sm">
                    <Link href={`/events/${id}/edit`} >
                        Edit
                    </Link>
                </Button>
                {/* <Button asChild variant="destructive" size="sm">
                    <Link href={`/events/${id}/delete`} >
                        Delete
                    </Link>
                </Button> */}
            </CardFooter>
        </Card>
    );
}

const EventsPage = async () => {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) return redirectToSignIn()

    const events = await db.query.EventTable.findMany({
        where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
        orderBy: ({ createdAt }, { desc }) => desc(createdAt),
    })
    return (
        <>
            <div className="flex gap-4 items-baseline">
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-semibold mb-6">Events</h1>
                <Button asChild>
                    <Link href="/events/new" >
                        <CalendarPlus className="mr-4 size-6" />
                        New Event
                    </Link>
                </Button>
            </div>
            {events.length > 0 ? (
                <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
                    {events.map((event) => (
                        <EventCard key={event.id} {...event} />
                    ))}

                </div>
            ):(
                <div className="flex flex-col items-center gap-4">
                   <CalendarRange className="size-16 mx-auto"/>
                   You do not have any events yet. Create your first event to get started! 
                    <Button size="lg" className="text-lg" asChild>
                        <Link href="/events/new" >
                            <CalendarPlus className="mr-4 size-6" />
                            New Event
                        </Link>
                    </Button>
                </div>
            )}
        </>
    );
}

export default EventsPage;

