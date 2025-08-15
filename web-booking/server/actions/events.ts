"use server";
import { eventFormSchema } from "@/schema/events";
import { z } from "zod";
import { db } from "@/drizzle/db";
import { EventTable } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

export const createEvent = async (unSavedData: z.infer<typeof eventFormSchema>): Promise<{ error: boolean; message?: string }| undefined> => {
    const { userId } = await auth();
    
    if (!userId) {
        return { error: true, message: "User not authenticated." };
    }

    const { success, data } = eventFormSchema.safeParse(unSavedData);

    if (!success) {
        return { error: true, message: "Validation failed" };
    }

    try {
        await db.insert(EventTable).values({
            ...data,
            clerkUserId: userId as string,
        });
    } catch (error) {
        console.error("Error creating event:", error);
        return { error: true, message: "Failed to create event." };
    }
    
    redirect("/events");
}

export const updateEvent = async (id: string, unSavedData: z.infer<typeof eventFormSchema>): Promise<{ error: boolean; message?: string } | undefined> => {
    const { userId } = await auth();

    if (!userId) {
        return { error: true, message: "User not authenticated." };
    }

    const { success, data } = eventFormSchema.safeParse(unSavedData);

    if (!success) {
        return { error: true, message: "Validation failed" };
    }

    try {
        const { rowCount } = await db.update(EventTable).set({
            ...data,
        }).where(and(eq(EventTable.id, id), eq(EventTable.clerkUserId, userId as string)));

        if (rowCount===0) {
            return { error: true, message: "Event not found or you do not have permission to update it." };
        }
    } catch (error) {
        console.error("Error updating event:", error);
        return { error: true, message: "Failed to update event." };
    }

    

    redirect("/events");
}

export const deleteEvent = async (id: string): Promise<{ error: boolean; message?: string } | undefined> => {
    const { userId } = await auth();

    if (!userId) {
        return { error: true, message: "User not authenticated." };
    }

    try {
        const { rowCount } = await db.delete(EventTable).where(and(eq(EventTable.id, id), eq(EventTable.clerkUserId, userId as string)));

        if (rowCount === 0) {
            return { error: true, message: "Event not found or you do not have permission to delete it." };
        }
    } catch (error) {
        console.error("Error deleting event:", error);
        return { error: true, message: "Failed to delete event." };
    }

    redirect("/events");
}
