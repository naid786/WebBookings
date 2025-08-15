"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingFormSchema } from "@/schema/booking";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import Link from "next/link";
import { SelectTrigger, Select, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { formatDate, formatTimeString, formatTimezoneOffset } from "@/lib/formatters";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { isSameDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { useMemo } from "react";
import { toZonedTime } from "date-fns-tz";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { createBooking } from "@/server/actions/bookings";



const BookingForm = ({
    validTimes,
    eventId,
    clerkUserId,
}: {
    validTimes: Date[],
    eventId: string,
    clerkUserId: string
}) => {

    const form = useForm<z.infer<typeof bookingFormSchema>>({
        resolver: zodResolver(bookingFormSchema),
        // mode: "onChange", // This ensures validation runs on every change
        defaultValues: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
    });

    const timezone = form.watch("timezone");
    const date = form.watch("date");
    const validTimesInTimezone = useMemo(() => {
        return validTimes.map(date => toZonedTime(date, timezone))
    }, [validTimes, timezone])

    const onSubmit = async (values: z.infer<typeof bookingFormSchema>) => {
        const data = await createBooking({
            ...values,
            eventId,
            clerkUserId
        });

        if (data?.error) {
            form.setError("root", { message: "There was an error creating the event." });
        }
        // You can add your API call here
    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {form.formState.errors.root && (
                    <div className="text-destructive text-sm">
                        {form.formState.errors.root.message || "An error occurred."}
                    </div>
                )}
                <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Intl.supportedValuesOf("timeZone").map((tz) => (
                                        <SelectItem key={tz} value={tz}>
                                            {tz}
                                            {` ${formatTimezoneOffset(tz)}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <FormDescription>
                                The timezone in which your availability is defined.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4 flex-col md:flex-row lg:flex-row">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <Popover>
                                <FormItem className="flex-1">
                                    <FormLabel>Date</FormLabel>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn("pl-3 text-left font-normal flex w-full", !field.value && "text-muted-foreground")}
                                            >
                                                {field.value ? (formatDate(field.value)) : (<span>Select a date</span>)}
                                                <CalendarIcon className="ml-auto size-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={date => !validTimesInTimezone.some(time => isSameDay(date, time))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                    <FormMessage />
                                </FormItem>
                            </Popover>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Time</FormLabel>

                                <Select
                                    disabled={date == null || timezone == null}
                                    onValueChange={value =>
                                        field.onChange(new Date(Date.parse(value)))
                                    }
                                    defaultValue={field.value?.toISOString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={
                                                date == null || timezone == null
                                                    ? "Select a date"
                                                    : "Select a booking time"
                                            } />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {validTimesInTimezone.filter(time => isSameDay(time, date)).map((time) => (
                                            <SelectItem key={time.toISOString()} value={time.toISOString()}>
                                                {formatTimeString(time)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex gap-4 flex-col md:flex-row lg:flex-row">
                    <FormField
                        control={form.control}
                        name="guestName"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Your Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Your Name" />
                                </FormControl>
                                <FormDescription>
                                    The name users will see when booking.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="guestEmail"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Your Email</FormLabel>
                                <FormControl>
                                    <Input type="email" {...field} placeholder="Your Email" />
                                </FormControl>
                                <FormDescription>
                                    The email users will see when booking.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="guestNotes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                                <Textarea {...field} className="resize-none" placeholder="Event notes..." />
                            </FormControl>
                            <FormDescription>
                                Additional details about the event.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-2 justify-end">

                    <Button disabled={form.formState.isSubmitting} asChild variant={"outline"} type="button">
                        <Link href={`/book/${clerkUserId}`}>Cancel</Link>
                    </Button>
                    <Button disabled={form.formState.isSubmitting} type="submit">
                        Save
                    </Button>
                </div>
            </form>

        </Form>
    );
}

export default BookingForm;