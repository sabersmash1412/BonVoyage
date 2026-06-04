'use server'
import { fetchItineraryData } from './serverController';
import PageContent from './PageContent';


export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const { activitiesDetails, itineraryId, itineraryOverview } = await fetchItineraryData(slug)

    return (<PageContent activities={activitiesDetails} itinerary_id={itineraryId} slug={slug} itineraryOverview={itineraryOverview} />)
}


