'use client'
import React, { useEffect } from 'react';
import { AdvancedMarker, Map, useMap } from '@vis.gl/react-google-maps';
import { useMapController } from './useMapController';
import { InnerMapProps, MapComponentProps } from '@/types/itinerary/Map/mapProps';
import { useColourContext } from '../_context/ColourContext';
import { ActivityMarker } from '@/components/itinerary/CustomMarker';

export default function MapComponent({ activities }: MapComponentProps) {
    return (<div style={{ height: '100%', width: '100%' }}>
        <InnerMap activities={activities} />
    </div >
    )
}

function InnerMap({ activities }: InnerMapProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fetchStatus, places, boundsLiteral, clickMarker, activeMarker } = useMapController(activities)
    const map = useMap()
    useEffect(() => {
        if (!map) return;

        map.fitBounds(boundsLiteral)
    }, [boundsLiteral, map])

    const DEFAULT_COORDINATES = {
        lat: 0,
        lng: 0
    }

    const dateHueMap = useColourContext();
    const mapID = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID as string;

    return (activities.length > 0
        ? (<Map
            style={{ height: '100%', width: '100%' }}
            defaultZoom={13}
            // prevent website from crashing when 0 places
            defaultCenter={places.length > 0 ? places[0].coordinates : DEFAULT_COORDINATES}
            disableDefaultUI={true}
            // must use literal types as per docs i.e. google.maps.LatLngLiteral or google.maps.LatLngBoundsLiteral
            defaultBounds={boundsLiteral}
            mapId={mapID}
        >
            {fetchStatus ? (
                places.map((place, index) => (
                    <AdvancedMarker
                        key={index}
                        position={place.coordinates}
                        onClick={() => clickMarker(index)}
                    >
                        <ActivityMarker orderWithinDay={place.orderWithinDay} colour={dateHueMap.get(place.date)} />
                    </AdvancedMarker>
                ))
            ) : (
                <>Fetching places...</>
            )}
        </Map>)
        : <></>
    )
}