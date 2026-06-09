'use client'
import { ItineraryPageProps } from "@/types/itinerary/itineraryProps";
import Dnd from "./_DnD/DndItinerary";
import MapComponent from "./_Map/MapComponent";
import { useEffect, useMemo, useState } from "react";
import { APIProvider } from '@vis.gl/react-google-maps';
import { ColourContext, getDateHueMap } from "./_context/ColourContext";
import { ActivityProps } from "@/types/itinerary/activity/activityProps";
import CostBreakdown from "./CostBreakdown";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import TripOverview from "@/components/itinerary/TripOverview";
import { ChevronDownIcon, DollarSign } from 'lucide-react';
import DeleteDialog from "@/components/itinerary/DeleteDialog";
import CopyLink from "./CopyLink";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

export default function PageContent({ activities, itinerary_id, slug, itineraryOverview }: ItineraryPageProps) {
    const [activitiesArray, setActivitiesArray] = useState<ActivityProps[]>(activities)


    const uniqueDates = useMemo(
        () => [...new Set(activitiesArray.map(activity => activity.date))],
        [activitiesArray]);

    // singleton instance
    const dateHueMap = getDateHueMap();

    // when accessing different itinerary id:
    useEffect(() => {
        dateHueMap.reset(); // clear old itinerary
        dateHueMap.load(uniqueDates); // load new itinerary dates into instance
    }, [slug, dateHueMap, uniqueDates]);

    return (<>
        <ColourContext.Provider value={dateHueMap}>
            <AlertDialog>
                <TripOverview itineraryOverview={itineraryOverview}>
                    <div className="flex flex-row gap-3 items-center jusity-between">
                        <AlertDialogTrigger>
                            {/* copied shadcn destructive button cause i like the style */}
                            <div data-cy="costs-breakdown-tab"
                                className="flex flex-row gap-2 items-center justify-between
                                        h-[3vh] sm:h-[3vh] md:h-[4vh] lg:h-[4vh]
                                        border bg-background shadow-xs 
                                        hover:bg-accent hover:text-accent-foreground 
                                        dark:bg-input/30 dark:border-input dark:hover:bg-input/50"
                            >
                                <DollarSign />
                                Estimated costs
                                <ChevronDownIcon />
                            </div>
                        </AlertDialogTrigger>
                        <CopyLink id={itinerary_id} />
                        <DeleteDialog slug={slug} data-cy='delete-itinerary-button'></DeleteDialog>
                    </div>
                </TripOverview>
                <div className="flex flex-row w-auto 
                                h-[calc(92vh-0.5rem)] sm:h-[calc(91vh-0.5rem)] md:h-[calc(89vh-0.5rem)] lg:h-[calc(89vh-0.5rem)] 
                ">
                    {/* At top of page for PlacesAutocomplete and Maps API so that google APIs are not double loaded */}
                    <APIProvider apiKey={API_KEY} libraries={['places']}>
                        <div className="flex gap-x-4 w-full h-full">
                            <div className="flex-1 h-full">
                                <MapComponent activities={activitiesArray} />
                            </div>
                            <div className="w-1/4 pr-4 h-full overflow-y-auto" id="Dnd">
                                <Dnd
                                    activities={activitiesArray}
                                    setActivities={setActivitiesArray}
                                    itinerary_id={itinerary_id}
                                    itineraryOverview={itineraryOverview}
                                />
                            </div>
                        </div>
                    </APIProvider>
                </div >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Costs breakdown</AlertDialogTitle>
                        <div className="text-muted-foreground text-sm max-w-2xl w-full">
                            <CostBreakdown itineraryOverview={itineraryOverview} />
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel data-cy='costs-breakdown-tab'>Close costs breakdown</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ColourContext.Provider >
    </>)
}