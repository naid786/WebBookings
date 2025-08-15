"use server";

import { db } from "@/drizzle/db";
import { getValidTimesFromSchedule } from "@/lib/getValidTimesFromSchedule";
import { bookingActionSchema } from "@/schema/booking";
import { z } from "zod";
import { createCalendarEvent } from "../googleCalendar";
import { redirect } from "next/navigation";

export const createBooking = async (unSavedData: z.infer<typeof bookingActionSchema>) => {

    const { success, data } = bookingActionSchema.safeParse(unSavedData);

    if (!success) {
        return { error: true, message: "Validation failed" };
    }

    const event = await db.query.EventTable.findFirst({
        where: ({
            clerkUserId, isActive, id
        }, { eq, and }) => and(
            eq(clerkUserId, clerkUserId),
            eq(isActive, true),
            eq(id, data.eventId)
        )
    });

    if (event == null) {
        return { error: true, message: "Event not found or not active." };
    }

    const validTimes = await getValidTimesFromSchedule([data.startTime],event)

    if (validTimes.length === 0) {
        return { error: true, message: "No valid times available." };
    }

    await createCalendarEvent({
        ...data,
        durationInMinutes: event.durationInMinutes,
        eventName: event.name,
        summary: event.name // or provide a more descriptive summary if needed
    })

    redirect(`/book/${data.clerkUserId}/${data.eventId}/success?startTime=${data.startTime.toISOString()}`);
};
