// 1. convert YYYY-MM-DD to DD-MM-YYYY
// 2. when getting all itineraries for /trips, 
// iso date string from database is not recognised as a date object by TS
import { ItineraryFormProps } from "@/types/plan/planProps";

// so create new Date object first so that getDate() would work
export function dateConvert(input: string | Date) {
    const date = (typeof input === 'string') ? new Date(input) : input;
    // padStart ensures YYYY-MM-DD
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

export function incrementDateStringByOne(lastDateString: string) {
    const newDate = new Date(lastDateString).getTime() + (1000 * 60 * 60 * 24);
    return new Date(newDate).toISOString().split('T')[0];
}

export function decrementDateStringByOne(lastDateString: string) {
    const newDate = new Date(lastDateString).getTime() - (1000 * 60 * 60 * 24);
    return new Date(newDate).toISOString().split('T')[0];
}

export function getDateRange(startDate: string, endDate: string) {
    const dates = [startDate];
    if (startDate == endDate) {
        return dates
    }
    let nextDay = incrementDateStringByOne(startDate)
    while (nextDay != endDate) {
        dates.push(nextDay)
        nextDay = incrementDateStringByOne(nextDay)
    }
    // add endDate
    dates.push(nextDay)
    return dates
}

export function toUtcMidnight(date: Date): Date {
    return new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        0, 0, 0
    ));
}

export function convertFormInputDate(formInput: ItineraryFormProps) {
    const fromDate: Date = formInput.fromDate
    const toDate: Date = formInput.toDate

    const newFromDate = toUtcMidnight(fromDate)
    const newToDate = toUtcMidnight(toDate)
    console.log("newFromDate ", newFromDate)
    console.log("newToDate ", newToDate)
    formInput.fromDate = newFromDate
    formInput.toDate = newToDate
    console.log("converted: ", formInput)
    return formInput
}