import { z } from "zod";
import { itineraryIdSchema } from "../reusableFields/reusableFields";

export const deleteActivitySchema = z.object({
    activity_id: z
        .number({ required_error: "Delete activity id must be a number" })
        .min(0, { message: "Activity id must be >= 0" })
})

export const baseActivitySchema = z.object({
    date: z.string(),
    time: z.string(),
    title: z.string(),
    location: z.string(),
    type: z.string(),
    duration_minutes: z.string(),
    notes: z.string(),
    lat: z.number(),
    lng: z.number(),
})

export const activityAddToDbClientSchema = baseActivitySchema.extend({
    itinerary_id: itineraryIdSchema,
    activity_id: z.string({ message: "activity_id has to be a number" }),
    ordering: z.number({ message: "ordering has to be a number" }),
})

export const activityAddToDbSchema = activityAddToDbClientSchema.extend({
    user_id: z.string({ message: "user id has to be a string" }),
})

export const addActivityFormSchema = z.object({
    location: z.string().min(1, { message: "Please enter a valid location" }),
    description: z.string().min(1, { message: "Please enter a description" }),
});