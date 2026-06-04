import { DateHueMap } from '@/lib/itinerary/MapMarkerColours';
import { createContext, useContext } from 'react';

export const DistanceBetweenPlacesContext = createContext<number[][] | null>(null);

export const useDistanceBetweenPlacesContext = () => {
    const context = useContext(DistanceBetweenPlacesContext);
    if (!context) throw new Error('useDistanceBetweenPlacesContext must be used inside DistanceBetweenPlacesProvider');
    return context;
};

// single instance of DateHueMap
let dateHueMapSingleton: DateHueMap | null = null;

export function getDateHueMap(): DateHueMap {
    if (!dateHueMapSingleton) {
        dateHueMapSingleton = new DateHueMap();
    }
    return dateHueMapSingleton;
}