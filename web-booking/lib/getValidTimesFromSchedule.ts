import { DAYS_OF_WEEK } from "@/data/constants";
import { db } from "@/drizzle/db";
import { ScheduleAvailabilityTable } from "@/drizzle/schema";
import { CalendarScopeError } from "@/server/calendarErrors";
import { getCalendarEventTimes } from "@/server/googleCalendar";
import { isMonday, isWednesday, isTuesday, isThursday, isFriday, isSaturday, isSunday, setHours, setMinutes, addMinutes, areIntervalsOverlapping, isWithinInterval } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export const getValidTimesFromSchedule = async (timesInOrder: Date[], event: { clerkUserId: string; durationInMinutes: number }) => {
    const start = timesInOrder[0];
    const end = timesInOrder.at(-1);

    if (start == null || end == null) return [];

    const schedule = await db.query.ScheduleTable.findFirst({
        where: (({ clerkUserId: userIdCol }, { eq }) => eq(userIdCol, event.clerkUserId)),
        with: { availabilities: true },
    });

    if (schedule == null) return [];

    // Manual groupBy implementation for better runtime compatibility
    const groupedAvailabilities = schedule.availabilities.reduce((acc, availability) => {
        const key = availability.dayOfWeek;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(availability);
        return acc;
    }, {} as Partial<Record<(typeof DAYS_OF_WEEK)[number], (typeof ScheduleAvailabilityTable.$inferSelect)[]>>);

    let eventTimes: { start: Date; end: Date }[] = [];
    eventTimes = await getCalendarEventTimes(event.clerkUserId, { start, end });


    return timesInOrder.filter(intervalDate => {
        const availabilities = getAvailabilities(groupedAvailabilities, intervalDate, schedule.timezone);
        const eventInterval = {
            start: intervalDate,
            end: addMinutes(intervalDate, event.durationInMinutes)
        }

        return eventTimes.every(eventTime => {
            return !areIntervalsOverlapping(eventTime, eventInterval);
        }) &&
            availabilities.some(availability => {
                return (
                    isWithinInterval(eventInterval.start, availability) &&
                    isWithinInterval(eventInterval.end, availability)
                );
            });
    });

}

const getAvailabilities = (groupedAvailabilities: Partial<
    Record<
        (typeof DAYS_OF_WEEK)[number],
        (typeof ScheduleAvailabilityTable.$inferSelect)[]
    >
>,
    date: Date,
    timezone: string
) => {
    const dayOfWeek = date.toLocaleString("en-US", { weekday: "long", timeZone: timezone });
    let availabilities:
        | (typeof ScheduleAvailabilityTable.$inferSelect)[]
        | undefined

    if (isMonday(date)) {
        availabilities = groupedAvailabilities.Monday;
    }
    if (isTuesday(date)) {
        availabilities = groupedAvailabilities.Tuesday;
    }
    if (isWednesday(date)) {
        availabilities = groupedAvailabilities.Wednesday;
    }
    if (isThursday(date)) {
        availabilities = groupedAvailabilities.Thursday;
    }
    if (isFriday(date)) {
        availabilities = groupedAvailabilities.Friday;
    }
    if (isSaturday(date)) {
        availabilities = groupedAvailabilities.Saturday;
    }
    if (isSunday(date)) {
        availabilities = groupedAvailabilities.Sunday;
    }

    if (availabilities == null) return [];

    return availabilities.map(({ startTime, endTime }) => {
        const start = fromZonedTime(
            setMinutes(
                setHours(date, parseInt(startTime.split(":")[0])),
                parseInt(startTime.split(":")[1])
            ), timezone);
        const end = fromZonedTime(
            setMinutes(
                setHours(date, parseInt(endTime.split(":")[0])),
                parseInt(endTime.split(":")[1])
            ), timezone);

        return {
            start,
            end,
        };
    });

}
