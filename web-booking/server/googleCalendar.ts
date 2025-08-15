"use server";
import { CalendarScopeError } from "./calendarErrors";
import { clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";
import {addMinutes, endOfDay, startOfDay} from "date-fns";

const REQUIRED_SCOPES = [
    // minimal scopes your app needs (adjust if you also create/update events)
    "https://www.googleapis.com/auth/calendar.events"
];

export const getCalendarEventTimes = async (clerkUserId: string,{start,end}:{start:Date,end:Date}) => {
    try {
        const oAuthClient = await getOAuthClient(clerkUserId);
        if (!oAuthClient) {
            throw new Error("Failed to get OAuth client");
        }

        // Verify token has required scopes before calling Calendar API
        await assertRequiredScopes(oAuthClient, REQUIRED_SCOPES);

        const calendar = google.calendar("v3" );
        const events = await calendar.events.list({
            calendarId: "primary",
            eventTypes: ["default"],
            singleEvents: true,
            timeMin: start.toISOString(),
            timeMax: end.toISOString(),
            maxResults: 2500,
            orderBy: "startTime",
            auth: oAuthClient,
        });

        return (
            events.data.items?.map((event) => {
            if (event.start?.date != null && event.end?.date != null) {
                return {
                    start: startOfDay(event.start.date),
                    end: endOfDay(event.end.date),
                };
            }
            if (event.start?.dateTime != null && event.end?.dateTime != null) {
                return {
                    start: new Date(event.start.dateTime),
                    end: new Date(event.end.dateTime),
                };
            }

        }).filter(date => date != null) || []);
    } catch (error: any) {
        // Enhance insufficient scope message
        if (error?.code === 403) {
            console.error("Google Calendar API 403 (likely insufficient scopes)");
            throw new CalendarScopeError(
                "Google Calendar access denied due to missing scopes. Ask the user to reconnect Google with calendar permissions."
            );
        }
        console.error("Error fetching calendar events:", error);
        throw error;
    }
};

const getOAuthClient = async (clerkUserId: string) => {
    const oClient = await clerkClient();
    const token = await oClient.users.getUserOauthAccessToken(clerkUserId, "oauth_google");
    if (token.data.length === 0 || token.data[0].token == null) {
        return
    }

    const client = new google.auth.OAuth2(
        process.env.GOOGLE_OAUTH_CLIENT_ID,
        process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        process.env.GOOGLE_OAUTH_REDIRECT_URI
    );

    client.setCredentials({
        access_token: token.data[0].token,
    });

    return client;
};

// Helper to assert the current token contains the required scopes
const assertRequiredScopes = async (authClient: any, required: string[]) => {
    const oauth2 = google.oauth2("v2");
    // @ts-ignore - tokeninfo typing
    const tokeninfo = await oauth2.tokeninfo({ access_token: (authClient as any).credentials.access_token });
    const granted = (tokeninfo.data.scope || "").split(/\s+/).filter(Boolean);
    const missing = required.filter(rs => !granted.includes(rs));
    if (missing.length) {
        console.warn("Missing Google Calendar scopes", { missing, granted });
        throw new CalendarScopeError(
            `Missing required Google Calendar scopes: ${missing.join(", ")}. User must re-connect Google with these scopes.`
        );
    }
};

export const createCalendarEvent = async ({
    clerkUserId,
    guestName,
    guestEmail,
    startTime,
    guestNotes,
    summary,
    durationInMinutes,
    eventName
}: {
    clerkUserId: string;
    guestName: string;
    guestEmail: string;
    startTime: Date;
    guestNotes?: string | null;
    summary: string;
    durationInMinutes: number;
    eventName: string;
}) => {

    // Implementation for creating a calendar event
    const oAuthClient = await getOAuthClient(clerkUserId);
    const oClient = await clerkClient();
    const calendarUser = await oClient.users.getUser(clerkUserId);

    if (calendarUser.primaryEmailAddress == null) {
        throw new Error("User has no email");
    }

    const calendar = google.calendar("v3");
    const calendarEvent = await calendar.events.insert({
        calendarId: "primary",
        sendUpdates: "all",
        auth: oAuthClient,
        requestBody: {
            summary: `${guestName} - ${eventName}`,
            description: guestNotes ? `Additional Details: ${guestNotes}` : undefined,
            start: {
                dateTime: startTime.toISOString(),
            },
            end: {
                dateTime: addMinutes(startTime, durationInMinutes).toISOString(),
            },
            attendees: [
                {
                    email: guestEmail,
                    displayName: guestName,
                },
                {
                    email: calendarUser.primaryEmailAddress?.emailAddress || "",
                    displayName: calendarUser.fullName || undefined,
                    responseStatus: "accepted",
                }
            ],
        },
    });
    return calendarEvent.data;
};
