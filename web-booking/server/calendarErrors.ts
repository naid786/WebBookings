// Shared error types for Google Calendar integration (no "use server" so any export allowed)
export class CalendarScopeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CalendarScopeError";
    }
}
