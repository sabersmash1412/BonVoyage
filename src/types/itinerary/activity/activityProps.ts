import { z } from "zod";
import { activityAddToDbClientSchema, activityAddToDbSchema, addActivityFormSchema, baseActivitySchema } from "./activitySchema";

export interface HandleAddActivityReturnProps {
    title: string,
    location: string,
    lat: number,
    lng: number,
}

export interface InfoBetweenActivities {
    distance: number,
    duration: string
}

export type AddActivityFormType = z.infer<typeof addActivityFormSchema>;

export type BaseActivity = z.infer<typeof baseActivitySchema>;

// when reading for individual itinerary
export interface ActivityProps extends BaseActivity {
    id: number;
    ordering: number;
    activity_id: string;
}

// for object inserting into public.activities
export type ActivityAddToDbClientprops = z.infer<typeof activityAddToDbClientSchema> // client
export type ActivityAddToDbProps = z.infer<typeof activityAddToDbSchema> // server