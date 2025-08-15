"use client";
import { useForm } from "react-hook-form";
import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema } from "@/schema/events";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import Link from "next/link";
import { createEvent, deleteEvent, updateEvent } from "@/server/actions/events";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTrigger, AlertDialogDescription, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";
import { useState, useTransition } from "react";



const EventForm = ({event}:{event?:{
    id:string
    name: string;
    durationInMinutes: number;
    description?: string;
    isActive: boolean | null;
}}) => {

    const [isDeletingPending, startDeleteTransition] = useTransition();
    const form = useForm<z.infer<typeof eventFormSchema>>({
        resolver: zodResolver(eventFormSchema),
        // mode: "onChange", // This ensures validation runs on every change
        defaultValues: {
            ...event,
            isActive: event?.isActive ?? true,
            durationInMinutes: event?.durationInMinutes ?? 30,
        },
    });
    const onSubmit = async (values: z.infer<typeof eventFormSchema>) => {
        const action = event == null ? createEvent : updateEvent.bind(null, event.id);
        const data = await action(values);

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
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Event Name" />
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
                    name="durationInMinutes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                                <Input 
                                    {...field} 
                                    type="number"
                                />
                            </FormControl>
                            <FormDescription>
                                How long the event will last in minutes.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="Event description..." />
                            </FormControl>
                            <FormDescription>
                                Additional details about the event.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    Active Event
                                </FormLabel>
                                <FormDescription>
                                    When enabled, users can book this event.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-2 justify-end">
                    {event && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isDeletingPending || form.formState.isSubmitting} type="button">
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the event.
                                </AlertDialogDescription>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction 
                                    variant="destructive"
                                    disabled={isDeletingPending || form.formState.isSubmitting} 
                                    onClick={ async () =>{
                                       const data= await deleteEvent(event.id)

                                       if (data?.error){
                                        form.setError("root", { message: data.message || "Failed to delete event." });
                                       }
                                    }} >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <Button disabled={isDeletingPending || form.formState.isSubmitting}  asChild variant={"outline"} type="button">
                        <Link href="/events">Cancel</Link>
                    </Button>
                    <Button disabled={isDeletingPending || form.formState.isSubmitting} type="submit">
                        Save
                    </Button>
                </div>
            </form>

        </Form>
    );
}

export default EventForm;