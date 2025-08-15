import ScheduleForm from "@/components/forms/schedule-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";

export const revalidated = 0

const SchedulePage = async () => {
    const {userId,redirectToSignIn} = await auth();
    if (userId === null) return redirectToSignIn()

    const schedule = await db.query.ScheduleTable.findMany({
        where: (({clerkUserId}, {eq}) => eq(clerkUserId, userId)),
        with:{
            availabilities:true,
        },
    })
    const scheduleData = schedule[0]
        ? {
            timezone: schedule[0].timezone,
            availability: schedule[0].availabilities,
        }
        : { timezone: "", availability: [] };

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle>
                    Schedule
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScheduleForm schedule={scheduleData} />
            </CardContent>
        </Card>
    );
}

export default SchedulePage;