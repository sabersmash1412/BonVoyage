import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { PlaceForMarkers } from "@/types/itinerary/Map/mapProps"
import { ActivityProps } from "@/types/itinerary/activity/activityProps"

// calculate literal bounding box
function calcluateBounds(places: PlaceForMarkers[]) {
    const coors = places.map(place => place.coordinates)
    const lats = coors.map(c => c.lat)
    const lngs = coors.map(c => c.lng)
    return {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs),
    }
}

function usePlacesData(activities: ActivityProps[]) {
    const DEFAULT_PLACE = {
        place: "DEFAULT PLACE",
        coordinates: { lat: 0, lng: 0 },
        date: "1970-01-01",
        orderWithinDay: 0,
        //   color: "#cccccc", // fallback gray
    }
    const defaultBoundsLiteral = {
        north: 90,
        south: -90,
        east: 90,
        west: -90,
    }
    const [fetchStatus, setFetchStatus] = useState(false)
    const [places, setPlaces] = useState<PlaceForMarkers[]>([DEFAULT_PLACE])
    const [boundsLiteral, setBoundsLiteral] = useState(defaultBoundsLiteral)

    useEffect(() => {
        const trackOrderingWithinDay = new Map()
        const convertActivitiesToPlaces = activities.map(activity => {
            if (!trackOrderingWithinDay.has(activity.date)) {
                trackOrderingWithinDay.set(activity.date, 1)
            }

            const pos = trackOrderingWithinDay.get(activity.date)

            // incr pos by 1 in Map
            trackOrderingWithinDay.set(activity.date, pos + 1)

            const placeObject: PlaceForMarkers = { place: activity.location, coordinates: { lat: activity.lat, lng: activity.lng }, date: activity.date, orderWithinDay: pos }
            return placeObject
        })

        console.log(convertActivitiesToPlaces)
        setPlaces(convertActivitiesToPlaces)
        setBoundsLiteral(calcluateBounds(convertActivitiesToPlaces))
        setFetchStatus(true)
    }, [activities])


    return { fetchStatus, places, boundsLiteral }
}

// prepMarker passes setActiveMarker to click marker
// upon clicking marker in client, index is passed
function prepMarker(setActiveMarker: Dispatch<SetStateAction<number | null>>) {
    function clickMarker(x: number) {
        const handleClick = () => {
            console.log("clicked id: ", x)
            // expaned marker size
            // jump to it in list
            // maybe expand size
            setActiveMarker(x)
        }
        handleClick()
    }
    return clickMarker
}

export function useMapController(activities: ActivityProps[]) {
    const [activeMarker, setActiveMarker] = useState<number | null>(null);
    const { fetchStatus, places, boundsLiteral } = usePlacesData(activities)
    const clickMarker = prepMarker(setActiveMarker)
    return { fetchStatus, places, boundsLiteral, clickMarker, activeMarker }
}