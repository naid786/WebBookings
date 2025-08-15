import { startOfDay } from "date-fns";
import {email, z} from "zod";

const bookingSchemaBase = z.object({
    startTime: z.date(),
    guestEmail: z.string().email().min(1,"Required"),
    guestName: z.string().min(1, "Required"),
    timezone: z.string().min(1, "Required"),
    guestNotes: z.string().max(500).optional(),
});

export const bookingFormSchema = z.object({
    date: z.date().min(startOfDay(new Date()),"Must be today or in the future"),
}).merge(bookingSchemaBase);

export const bookingActionSchema = z.object({
    eventId:z.string().min(1, "Required"),
    clerkUserId: z.string().min(1, "Required"),
}).merge(bookingSchemaBase);