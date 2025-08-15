import { z } from "zod";

export const eventFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    durationInMinutes: z.number().int().positive().max(60 * 12, `Duration must be less then 12 hours (${60 * 12} minutes)`),
    description: z.string().optional(),
    isActive: z.boolean(),
});