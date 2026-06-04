import { planPreferences } from "@/lib/itinerary/inputFormInfo";
import { z } from "zod";
import { dateRequiredSchema, itineraryIdSchema } from "./reusableFields/reusableFields";
import { countryRegex } from "@/lib/itinerary/countriesList";

export const itineraryFormSchema = z.object({
    fromCountry: z
        .string()
        .min(1, { message: "fromCountry must be at least 2 characters.", })
        .regex(countryRegex, { message: 'Country must be a valid country name (case-insensitive).' }),
    country: z
        .string()
        .min(1, { message: "toCountry must be at least 2 characters.", })
        .regex(countryRegex, { message: 'Country must be a valid country name (case-insensitive).' }),
    fromDate: dateRequiredSchema,
    toDate: dateRequiredSchema,
    budget: z.coerce.number().min(1, "Budget must be at least 1"),
    personCount: z.coerce.number().min(1, "Number of people must be postive"),
    // ensure prefences only come from predetermined ones
    preferences: z.array(z.enum(planPreferences), {
        invalid_type_error: 'Preference value must be from preset array'
    }),
}).refine(
    (data) => data.toDate >= data.fromDate,
    {
        message: "To Date must be on or after From Date",
        path: ["toDate"]
    }
);

export const deleteItinerarySchema = z.object({
    itinerary_id: itineraryIdSchema
})

export const allItinerariesSchema = z.object({
    title: z.string().min(1, { message: "title must be at least 2 characters.", }),
    start_date: dateRequiredSchema,
    end_date: dateRequiredSchema,
    id: z.coerce.number().min(1, "id must be at least 1"),
    created_at: z.string()
})

export const allItinerariesArraySchema = z.array(allItinerariesSchema)