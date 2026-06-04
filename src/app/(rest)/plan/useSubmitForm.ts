"use client"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useState } from "react"
import { ItineraryFormProps } from "@/types/plan/planProps"
import { convertFormInputDate } from "@/utils/dateFunctions"

export function useSubmitForm() {
    const router = useRouter();
    const [submiting, setSubmiting] = useState(false)

    async function submitForm(formInput: ItineraryFormProps) {
        try {
            // convert formInput Date objects from current local time to just the date string itself 
            // as backend runs in UTC and we don't want problems arising due to activity date range
            const values = convertFormInputDate(formInput)

            setSubmiting(true)
            console.log("posting to /api/itinerary")
            console.log("form submit values: ", values)
            const response = await axios.post("/api/itinerary", values)
            const itineraryId: number = response.data.data
            console.log("redirecting to itinerary ", itineraryId)
            router.push(`/itinerary/${itineraryId}`)
        } catch (error) {
            console.error(error);
            router.push(`/404`)
        }
    }
    return { submiting, submitForm }
}