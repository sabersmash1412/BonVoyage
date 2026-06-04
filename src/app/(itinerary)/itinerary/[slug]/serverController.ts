import { getItinerary } from "@/lib/itinerary/itineraryMethods";
import { GetItineraryProps } from "@/types/itinerary/itineraryProps";
import { notFound } from "next/navigation";

export function convertSlugToNumber(slug: string) {
    if (isNaN(parseInt(slug))) {
        return notFound();
    }
    return parseInt(slug)
}

async function handleGetItinerary(itineraryId: number) {
    const response: GetItineraryProps | null = await getItinerary(itineraryId)
    if (!response || !response.activities || !response.itineraryOverview) {
        console.log("response error")
        notFound()
    }

    const { itineraryOverview: itineraryOverview, activities: activitiesDetails } = response;
    if (activitiesDetails == null) {
        console.log("itinerary id not found")
        notFound()
    }
    return { itineraryOverview, activitiesDetails }
}

export async function fetchItineraryData(slug: string) {
    const itineraryId = convertSlugToNumber(slug)
    console.log("awaiting itinerary ", itineraryId)
    const { itineraryOverview, activitiesDetails } = await handleGetItinerary(itineraryId)
    console.log("received generated itinerary")
    return { activitiesDetails, itineraryId, itineraryOverview }
}