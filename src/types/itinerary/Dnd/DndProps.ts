import { Dispatch, SetStateAction } from "react";
import { ActivityProps } from "../activity/activityProps";
import { ItineraryOverviewProps } from "../itineraryProps";
import { Day } from "../day/dayProps";

// for variables passed to Dnd Component
export interface DndProps {
    activities: ActivityProps[]
    itinerary_id: number
    itineraryOverview: ItineraryOverviewProps
    setActivities: Dispatch<SetStateAction<ActivityProps[]>>
}

// Props for each individual day
export interface RowProps {
    row: Day;
    activities: ActivityProps[];
    setActivities: Dispatch<SetStateAction<ActivityProps[]>>;
    itinerary_id: number;
    setDays: Dispatch<SetStateAction<Day[]>>;
}

export interface UpdateActivityProps {
    day: string;
    activities: ActivityProps[];
    itinerary_id: number;
    setActivities: Dispatch<SetStateAction<ActivityProps[]>>;
    setIsOpenActivityBox: Dispatch<SetStateAction<boolean>>;
}