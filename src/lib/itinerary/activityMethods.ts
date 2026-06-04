import { ActivityAddToDbProps, ActivityProps } from "@/types/itinerary/activity/activityProps";
import { SupabaseClient } from "@supabase/supabase-js";

export async function updateActivities(supabase: SupabaseClient, user_id: string, activities: ActivityProps[], itinerary_id: number) {
    try {
        // in future will optimise this
        console.log("updating activity: ", itinerary_id)
        // console.log(activities)
        for (const activity of activities) {
            const { error } = await supabase
                .from('activities')
                // only order and dates are changed in DnD
                .update({ ordering: activity.ordering, date: activity.date, activity_id: activity.activity_id })
                .eq('id', activity.id)
                .eq('user_id', user_id)
                .eq('itinerary_id', itinerary_id);
            if (error != null) {
                throw new Error(error.message)
            }
        }
        console.log("sucessfully updated db")
        return 1
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function deleteActivity(supabase: SupabaseClient, activity_id: number) {
    try {
        console.log("deleting activity, id: ", activity_id)
        const { error } = await supabase
            .from('activities')
            .delete()
            .eq('activity_id', activity_id)
        if (error != null) {
            throw new Error(error.message)
        }
        return 1
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function getActivities(supabase: SupabaseClient, user_id: string, itinerary_id: number) {
    const { data: activities, error: err2 } = await supabase
        .from('activities')
        .select('*')
        .eq("user_id", user_id)
        .eq("itinerary_id", itinerary_id)
        .order('ordering', { ascending: true })
    if (err2 != null) {
        console.error("Error getting activities: ", err2);
        return null
    }
    return activities
}

export async function insertNewActivities(supabase: SupabaseClient, activitiesForDb: ActivityAddToDbProps[]) {
    // insert gemini output into public.activities given itineraryId
    console.log("activitiesForDb: ", activitiesForDb)
    const { data, error: activitiesError } = await supabase
        .from('activities')
        .insert(activitiesForDb)
        .select('id')
    if (activitiesError != null) {
        throw new Error(`error during insertion: ${activitiesError.message}`)
    }
    return data
}