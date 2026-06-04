import { z } from "zod"
import { BaseActivity } from "../itinerary/activity/activityProps"
import { itineraryFormSchema } from "../itinerary/itinerarySchema"

export type ItineraryFormProps = z.infer<typeof itineraryFormSchema>

export interface AIoutputProps {
    activities: BaseActivity[]
}