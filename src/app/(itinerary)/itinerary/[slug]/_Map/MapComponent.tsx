'use client'

import { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useMapController } from './useMapController';
import { MapComponentProps } from '@/types/itinerary/Map/mapProps';
import { useColourContext } from '../_context/ColourContext';
import { ActivityMarker } from '@/components/itinerary/CustomMarker';
import type * as Leaflet from 'leaflet';

type LeafletContainer = HTMLDivElement & {
    _leaflet_id?: number;
}

export default function MapComponent({ activities }: MapComponentProps) {
    const mapElementRef = useRef<LeafletContainer | null>(null);
    const mapRef = useRef<Leaflet.Map | null>(null);
    const markerLayerRef = useRef<Leaflet.LayerGroup | null>(null);
    const leafletRef = useRef<typeof Leaflet | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const { fetchStatus, places, clickMarker } = useMapController(activities);
    const dateHueMap = useColourContext();

    useEffect(() => {
        let isMounted = true;
        const mapElement = mapElementRef.current;
        if (!mapElement || mapRef.current) return;

        async function initialiseMap() {
            const L = await import('leaflet');
            if (!isMounted || !mapElementRef.current || mapRef.current) return;

            const currentMapElement = mapElementRef.current;

            // Leaflet stores an internal id on the DOM node. Clear it defensively
            // for React dev remounts so the same node can be reused without throwing.
            delete currentMapElement._leaflet_id;

            const map = L.map(currentMapElement, {
                zoomControl: false,
            }).setView([0, 0], 2);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            const markerLayer = L.layerGroup().addTo(map);
            leafletRef.current = L;
            mapRef.current = map;
            markerLayerRef.current = markerLayer;
            setMapReady(true);
        }

        initialiseMap();

        return () => {
            isMounted = false;
            markerLayerRef.current?.clearLayers();
            mapRef.current?.remove();
            mapRef.current = null;
            markerLayerRef.current = null;
            leafletRef.current = null;
            setMapReady(false);
            delete mapElement._leaflet_id;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        const markerLayer = markerLayerRef.current;
        const L = leafletRef.current;
        if (!L || !map || !markerLayer || !mapReady || !fetchStatus || activities.length === 0) return;

        markerLayer.clearLayers();

        places.forEach((place, index) => {
            const markerHtml = renderToStaticMarkup(
                <ActivityMarker orderWithinDay={place.orderWithinDay} colour={dateHueMap.get(place.date)} />
            );
            const icon = L.divIcon({
                html: markerHtml,
                className: 'bonvoyage-map-marker',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
            });

            L.marker([place.coordinates.lat, place.coordinates.lng], { icon })
                .on('click', () => clickMarker(index))
                .addTo(markerLayer);
        });

        if (places.length > 0) {
            const bounds = L.latLngBounds(places.map((place) => [place.coordinates.lat, place.coordinates.lng]));
            map.fitBounds(bounds, {
                padding: [40, 40],
                maxZoom: 15,
            });
        }
    }, [activities.length, clickMarker, dateHueMap, fetchStatus, mapReady, places]);

    return (
        <div
            ref={mapElementRef}
            style={{ height: '100%', width: '100%' }}
        />
    );
}
