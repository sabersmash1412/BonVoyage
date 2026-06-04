import { SupabaseClient } from "@supabase/supabase-js"
import { getItineraryOverview } from "./itineraryMethods"
import { decrementDateStringByOne, incrementDateStringByOne } from "@/utils/dateFunctions"

// amend start/end date according to key
export async function editItinerariesDate(supabase: SupabaseClient, newDateString: string, itinerary_id: number, key: string) {
    const methods: Record<string, string> = { start: 'start_date', end: 'end_date' }
    if (!Object.keys(methods).includes(key)) {
        console.log("key not in list of keys")
        return null
    }

    const method = methods[key]
    console.log("method: ", method)
    const { error } = await supabase
        .from('itineraries')
        // [method] : --> because using computed property name
        .update({ [method]: newDateString })
        .eq('id', itinerary_id)

    if (error != null) {
        console.log(error)
        return null
    }
    console.log(`successfully amended ${key} date`)
    return 1
}

export async function deleteDay(supabase: SupabaseClient, day: string, itinerary_id: number) {
    // handle if day equals to start/end date
    const itineraryOverview = await getItineraryOverview(supabase, itinerary_id)
    if (itineraryOverview == null) {
        console.error("Error getting itineraryOverview");
        return null
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { title, start_date, end_date } = itineraryOverview
    if (start_date == end_date) {
        return 2 // 2: unable to delete as same day
    }

    // !(start_date <= day <= end_date)
    if (!(new Date(start_date) <= new Date(day) && new Date(day) <= new Date(end_date))) {
        console.error("Invalid day to delete");
        return null
    }

    let editItinerariesResponse: number | null = -1
    // edit dates in public.itineraries
    if (start_date == day) {
        const newDateString = incrementDateStringByOne(day)
        editItinerariesResponse = await editItinerariesDate(supabase, newDateString, itinerary_id, "start")
    } else if (end_date == day) {
        const newDateString = decrementDateStringByOne(day)
        editItinerariesResponse = await editItinerariesDate(supabase, newDateString, itinerary_id, "end")
    }

    // editItinerariesResponse cases:
    // -1: unused
    // null: error
    // 1: success 
    // 2: unable to delete as same day
    if (editItinerariesResponse == null) {
        console.error("error updating public.itineraries")
        return null
    }

    //remove activities from public.activities
    const { error } = await supabase
        .from('activities')
        .delete()
        .eq('date', day)
        .eq('itinerary_id', itinerary_id)
    if (error != null) {
        console.error(error);
        return null
    }

    return 1
}