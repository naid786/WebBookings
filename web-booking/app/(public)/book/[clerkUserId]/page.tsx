import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { formatEventDescription } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidated = 0;

const BookingPage = async ({ params }: { params: Promise<{ clerkUserId: string }> }) => {
    const { clerkUserId } = await params;
    
    const events = await db.query.EventTable.findMany({
        where: ({ clerkUserId: userIdCol,isActive }, { eq,and }) => and(eq(userIdCol, clerkUserId), eq(isActive, true)),
            orderBy: ({ name }, { asc,sql }) => asc(sql`lower(${name})`),
        })

        if (!events || events.length === 0) {
            return notFound();
        }

        const { fullName } = await (await clerkClient()).users.getUser(clerkUserId);

        
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-4xl md:text-5xl font-semibold mb-4 text-center">
               {fullName}
            </div>
            <div className="text-muted-foreground mb-6 max-w-sm mx-auto text-center">
                Welcome to my booking page! Here you can book events that I have created. Please follow the instructions to make a booking.
            </div>
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(400px,1fr))]">
                {events.map((event) => (
                    <EventCard key={event.id} {...event} />
                ))}

            </div>
        </div>
    );
}
 
export default BookingPage;

type EventCardProps = {
    id: string;
    name: string;
    description: string | null;
    durationInMinutes: number;
    clerkUserId: string;
}

const EventCard = ({ id, name, description, durationInMinutes, clerkUserId }: EventCardProps) => {
    return (
        <Card className={cn("flex flex-col h-full")}>
            <CardHeader>
                <CardTitle >{name}</CardTitle>
                <CardDescription >
                    Duration: {formatEventDescription(durationInMinutes)}
                </CardDescription>
            </CardHeader>

            {description != null && (
                <CardContent >
                    {description}
                </CardContent>
            )}

            <CardFooter className="flex justify-end gap-2 mt-auto">
                <Button asChild variant="outline" size="sm">
                    <Link href={`/book/${clerkUserId}/${clerkUserId}`} >
                        Select
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