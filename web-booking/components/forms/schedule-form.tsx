"use client";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { Fragment, useState } from "react";
import { DAYS_OF_WEEK } from "@/data/constants";
import { scheduleFormSchema } from "@/schema/schedule";
import { timeToInt } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { formatTimezoneOffset } from "@/lib/formatters";
import {  PlusIcon, X } from "lucide-react";
import { Input } from "../ui/input";
import { saveSchedule } from "@/server/actions/schedule";

type Availability = {
    startTime: string
    endTime: string
    dayOfWeek: (typeof DAYS_OF_WEEK)[number]
}

const ScheduleForm = ({schedule}:{
    schedule?: {
        timezone: string;
        availability: Availability[]; // Fixed to match expected interface
    }
}) => {
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const form = useForm<z.infer<typeof scheduleFormSchema>>({
        resolver: zodResolver(scheduleFormSchema),
        mode: "onChange", // This ensures validation runs on every change
        defaultValues: {
            timezone: schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
            availabilities: schedule?.availability ? schedule.availability.toSorted((a, b) => {
                return timeToInt(a.startTime) - timeToInt(b.startTime);
            }) : [],
        },
    });

    const { fields: availabilityFields, append: addAvailability, remove: removeAvailability } = useFieldArray({ name: "availabilities", control: form.control });

    // Manual groupBy implementation for better runtime compatibility
    const groupedAvailability = availabilityFields.map((field, index) => ({ ...field, index })).reduce((acc, availability) => {
        const key = availability.dayOfWeek;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(availability);
        return acc;
    }, {} as Record<string, Array<typeof availabilityFields[0] & { index: number }>>);

    const onSubmit = async (values: z.infer<typeof scheduleFormSchema>) => {

        const data = await saveSchedule(values);

        if (data?.error) {
            form.setError("root", { message: "There was an error saving your schedule." });
        }else{
            setSuccessMessage("Schedule saved successfully!")
        }
    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {form.formState.errors.root && (
                    <div className="text-destructive text-sm">
                        {form.formState.errors.root.message || "An error occurred."}
                    </div>
                )}
                {
                    successMessage && (
                        <div className="text-green-500 text-sm">
                            {successMessage}
                        </div>
                    )
                }
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
                <div className="grid grid-cols-[auto,1fr] gap-y-6 gap-x-4" >
                    {DAYS_OF_WEEK.map((day) => (
                        <Fragment key={day}>
                            <div className="capitalize text-sm font-semibold">
                                {day.substring(0, 3)}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="size-6 p-1"
                                    onClick={() => { 
                                        addAvailability({
                                            dayOfWeek: day,
                                            startTime: '09:00',
                                            endTime: '17:00'
                                        });
                                    }}
                                >
                                    <PlusIcon  />
                                </Button>
                                {groupedAvailability[day]?.map((field, labelIndex) => (
                                    <div className="flex flex-col gap-1" key={field.id}>


                                        <div className="flex gap-2 items-center">
                                            <FormField
                                                control={form.control}
                                                name={`availabilities.${field.index}.startTime`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input className="w-24" aria-label={`${day} start time ${labelIndex + 1}`} {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`availabilities.${field.index}.endTime`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input className="w-24" aria-label={`${day} end time ${labelIndex + 1}`} {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                type="button"
                                                className="size-6 p-1"
                                                onClick={() => removeAvailability(field.index)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <FormMessage>
                                            {form.formState.errors.availabilities?.at?.(
                                                field.index
                                            )?.message}
                                        </FormMessage>
                                    </div>
                                ))}
                            </div>
                        </Fragment>
                    ))}
                </div>
                <div className="flex gap-2 justify-end">
                    <Button disabled={form.formState.isSubmitting} type="submit">
                        Save
                    </Button>
                </div>
            </form>

        </Form>
    );
}

export default ScheduleForm;