import { z } from "zod";

export const itineraryIdSchema = z
    .number({ required_error: "Itinerary id must be a number" })
    .min(1, { message: "Itinerary id must be positive" });

export const dateRequiredSchema = z.coerce.date({ required_error: "A date is required.", });