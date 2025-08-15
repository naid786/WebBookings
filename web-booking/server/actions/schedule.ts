"use server"

import { db } from "@/drizzle/db";
import { ScheduleAvailabilityTable, ScheduleTable } from "@/drizzle/schema";
import { scheduleFormSchema } from "@/schema/schedule";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const saveSchedule = async (unSavedData: z.infer<typeof scheduleFormSchema>) => {
    // Implement your save logic here
    const { userId } = await auth();

    if (!userId) {
        return { error: true, message: "User not authenticated." };
    }

    const { success, data } = scheduleFormSchema.safeParse(unSavedData);

    if (!success) {
        return { error: true, message: "Validation failed" };
    }

    const { availabilities, ...scheduleData } = data;

    try {
        // First, try to find existing schedule for this user
        const existingSchedule = await db.select({ id: ScheduleTable.id })
            .from(ScheduleTable)
            .where(eq(ScheduleTable.clerkUserId, userId))
            .limit(1);

        let scheduleId: string;

        if (existingSchedule.length > 0) {
            // Update existing schedule
            scheduleId = existingSchedule[0].id;
            await db.update(ScheduleTable)
                .set({
                    ...scheduleData,
                    updatedAt: new Date()
                })
                .where(eq(ScheduleTable.id, scheduleId));
        } else {
            // Create new schedule
            const [{ id }] = await db.insert(ScheduleTable).values({
                ...scheduleData,
                clerkUserId: userId
            }).returning({ id: ScheduleTable.id });
            scheduleId = id;
        }

        // Delete existing availabilities for this schedule
        await db.delete(ScheduleAvailabilityTable)
            .where(eq(ScheduleAvailabilityTable.scheduleId, scheduleId));

        // Insert new availabilities if any
        if (availabilities.length > 0) {
            await db.insert(ScheduleAvailabilityTable).values(
                availabilities.map((availability) => ({
                    ...availability,
                    scheduleId
                }))
            );
        }

        return { error: false, message: "Schedule saved successfully" };
    } catch (error) {
        console.error("Error saving schedule:", error);
        return { error: true, message: "Failed to save schedule" };
    }
}
