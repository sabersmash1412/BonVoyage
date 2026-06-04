import { FaMapMarker } from "react-icons/fa";

// custom markers for itinerary to show both ordering within day and the correct marker colour(to be extended soon)
export function ActivityMarker({ orderWithinDay, colour }: { orderWithinDay: number, colour: string }) {
    return (
        <div className="relative flex items-start self-start">
            <FaMapMarker size={32} color={colour} />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-black text-sm font-bold">{orderWithinDay}</span>
            </div>
        </div>
    )
}