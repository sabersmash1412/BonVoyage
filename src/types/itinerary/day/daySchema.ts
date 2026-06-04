import { z } from "zod";
import { itineraryIdSchema } from "../reusableFields/reusableFields";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const updateDateSchema = z.string().regex(dateRegex, { message: "New date has to be in YYYY-MM-DD format.", })

export const updateDaySchema = z.object({
    // YYYY-MM-DD
    newDateString: updateDateSchema,
    itinerary_id: itineraryIdSchema
})

export const deleteDaySchema = z.object({
    // YYYY-MM-DD
    day: updateDateSchema,
    itinerary_id: itineraryIdSchema
})
