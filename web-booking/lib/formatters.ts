export const formatEventDescription = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    const minutesStr = `${minutes} ${minutes > 1 ? 'mins' : 'min'}`;
    const hoursStr = `${hours} ${hours > 1 ? 'hrs' : 'hr'}`;
    if (hours == 0) return minutesStr;
    if (minutes == 0) return hoursStr;
    return `${hoursStr} ${minutesStr}`;
}   

export const formatTimezoneOffset = (timezone: string) => {
   return new Intl.DateTimeFormat(undefined, { timeZone: timezone, timeZoneName: 'shortOffset' }).formatToParts(new Date()).find(part => part.type == "timeZoneName")?.value || '';
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle:'medium'
});

export const formatDate = (date: Date) => {
    return dateFormatter.format(date);
}

const timeFormatter = new Intl.DateTimeFormat(undefined, {
    timeStyle: 'short'
});

export const formatTimeString = (date: Date) => {
    return timeFormatter.format(date);
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
});

export const formatDateTime = (date: Date) => {
    return dateTimeFormatter.format(date);
}
