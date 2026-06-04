import COUNTRY_MAP from "@/data/countries.json"
import { AirportData } from '@/types/costBreakdownProps';
// import FlightSection from "@/components/flights/FlightSection";
import HotelSection from "@/components/hotels/HotelSection";
import CostoflivingSection from "@/components/cost-of-living/CostoflivingSection"
import { ItineraryOverviewProps } from "@/types/itinerary/itineraryProps";

export default function CostBreakdown({ itineraryOverview }: { itineraryOverview: ItineraryOverviewProps }) {
    const airportMap = COUNTRY_MAP as Record<string, AirportData>;

    function getAirportInfo(
        airportCode: string,
        returnSlug: boolean = false
    ): string | undefined {
        const data = airportMap[airportCode];
        return data ? (returnSlug ? data.countrySlug : data.country) : undefined;
    }


    function calculateTripLength(start: string, end: string) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    }


    return (<>
        <div className="mt-6 flex flex-col md:flex-row gap-6">
            {/* <div className="flex-1">
                <FlightSection
                    originLocationCode={itineraryOverview.costBreakdown.origin_airport_code}
                    destinationLocationCode={itineraryOverview.costBreakdown.destination_airport_code}
                    departureDate={itineraryOverview.start_date}
                    returnDate={itineraryOverview.end_date}
                    adults={1}
                />
            </div> */}
            <HotelSection
                location={getAirportInfo(itineraryOverview.costBreakdown.destination_airport_code) || "Singapore"}
                checkInDate={itineraryOverview.start_date}
                checkOutDate={itineraryOverview.end_date}
            />
            <CostoflivingSection
                country={getAirportInfo(itineraryOverview.costBreakdown.destination_airport_code, true) || "Singapore"}
                numberOfDays={calculateTripLength(itineraryOverview.start_date, itineraryOverview.end_date)}
            />
        </div>
    </>)
}