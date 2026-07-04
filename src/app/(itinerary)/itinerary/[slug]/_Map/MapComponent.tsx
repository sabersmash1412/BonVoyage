'use client'

import L from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useMapController } from './useMapController';
import { MapComponentProps, PlaceForMarkers } from '@/types/itinerary/Map/mapProps';
import { useColourContext } from '../_context/ColourContext';
import { ActivityMarker } from '@/components/itinerary/CustomMarker';

type LeafletContainer = HTMLDivElement & {
    _leaflet_id?: number;
}

function toLatLngBounds(places: PlaceForMarkers[]) {
    return L.latLngBounds(places.map((place) => [place.coordinates.lat, place.coordinates.lng]));
}

export default function MapComponent({ activities }: MapComponentProps) {
    const mapElementRef = useRef<LeafletContainer | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerLayerRef = useRef<L.LayerGroup | null>(null);
    const { fetchStatus, places, clickMarker } = useMapController(activities);
    const dateHueMap = useColourContext();

    const markers = useMemo(() => places.map((place) => {
        const markerHtml = renderToStaticMarkup(
            <ActivityMarker orderWithinDay={place.orderWithinDay} colour={dateHueMap.get(place.date)} />
        );

        return {
            ...place,
            icon: L.divIcon({
                html: markerHtml,
                className: 'bonvoyage-map-marker',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
            }),
        };
    }), [dateHueMap, places]);

    useEffect(() => {
        const mapElement = mapElementRef.current;
        if (!mapElement || mapRef.current) return;

        // Leaflet stores an internal id on the DOM node. Clear it defensively for
        // React dev remounts so the same node can be reused without throwing.
        delete mapElement._leaflet_id;

        const map = L.map(mapElement, {
            zoomControl: false,
        }).setView([0, 0], 2);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const markerLayer = L.layerGroup().addTo(map);
        mapRef.current = map;
        markerLayerRef.current = markerLayer;

        return () => {
            markerLayer.clearLayers();
            map.remove();
            mapRef.current = null;
            markerLayerRef.current = null;
            delete mapElement._leaflet_id;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        const markerLayer = markerLayerRef.current;
        if (!map || !markerLayer || !fetchStatus || activities.length === 0) return;

        markerLayer.clearLayers();

        markers.forEach((place, index) => {
            L.marker([place.coordinates.lat, place.coordinates.lng], { icon: place.icon })
                .on('click', () => clickMarker(index))
                .addTo(markerLayer);
        });

        if (places.length > 0) {
            map.fitBounds(toLatLngBounds(places), {
                padding: [40, 40],
                maxZoom: 15,
            });
        }
    }, [activities.length, clickMarker, fetchStatus, markers, places]);

    return (
        <div
            ref={mapElementRef}
            style={{ height: '100%', width: '100%' }}
        />
    );
}
