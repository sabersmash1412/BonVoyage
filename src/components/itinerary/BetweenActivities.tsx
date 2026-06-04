import { PiDotsThreeOutlineVerticalLight } from "react-icons/pi";
import { FaCar } from "react-icons/fa";
import { LuDot } from "react-icons/lu";
import { InfoBetweenActivities } from "@/types/itinerary/activity/activityProps";

export default function BetweenActivities({ distance, duration }: InfoBetweenActivities) {
    return (<>
        {/* if same place then dont render */}
        {distance == 0
            ? <></>
            : <div className="flex flex-row gap-3 items-center">
                <div className="pl-4">
                    <PiDotsThreeOutlineVerticalLight size={25} />
                    <PiDotsThreeOutlineVerticalLight size={25} />

                </div>
                <FaCar />
                <div className="flex flex-row items-center">
                    {durationConvert(duration)}
                    <LuDot />
                    {metresToKm(distance)}km
                </div>
            </div>}
    </>)
}

const metresToKm = (distance: number) => (distance / 1000).toFixed(1)

// converts seconds to a suitable string in terms of hours and minutes
function durationConvert(duration: string) {
    const seconds = parseInt(duration)

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    // const secs = seconds % 60;

    const parts = [];

    if (hours > 0) {
        parts.push(`${hours} hr`);
    }

    if (minutes > 0 || hours > 0) {
        parts.push(`${minutes} min`);
    }

    return parts.join(" ");
}