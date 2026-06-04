import { z } from "zod";
import { allItinerariesSchema } from "./itinerarySchema";
import { ActivityProps } from "./activity/activityProps";

// when reading all user's itineraries for /trips in public.itineraries
export type AllItinerariesProps = z.infer<typeof allItinerariesSchema>

// Reading itinerary.itineraries for indiv itinerary
export interface ItineraryOverviewProps {
  title: string;
  start_date: string;
  end_date: string;
  costBreakdown: {
    origin_airport_code: string;
    destination_airport_code: string;
  };
}

// Reading itinerary.activities for indiv itinerary components
export interface GetItineraryProps {
  itineraryOverview: ItineraryOverviewProps;
  activities: ActivityProps[];
}

export interface DeleteDialogProps {
  slug: string
}

export interface ItineraryPageProps extends DeleteDialogProps {
  activities: ActivityProps[]
  itinerary_id: number
  itineraryOverview: ItineraryOverviewProps
}

// For flights
export type Flight = {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  returnDeparture: string;
  returnArrival: string;
  price: string;
};
