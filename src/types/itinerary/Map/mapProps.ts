import { ActivityProps } from "../activity/activityProps";


export interface MapComponentProps {
    activities: ActivityProps[]
}

export interface Coordinates {
    lat: number;
    lng: number;
}

// to query places API
export interface Place {
    place: string;
    coordinates: Coordinates;
}

export interface PlacesAPIMatrix {
    originIndex: number;
    destinationIndex: number;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    status: {};
    duration: string;
    condition: string;
    distanceMeters?: number; //may not exist on same origin & dest obj
}

// fields ensure that marker colour and text number follows activity list
export interface PlaceForMarkers extends Place {
    date: string;
    // to use to process ordering within each day for map markers
    orderWithinDay: number;
}

export interface InnerMapProps {
    activities: ActivityProps[]
}