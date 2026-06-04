import { DateHueMap } from '@/lib/itinerary/MapMarkerColours';
import { createContext, useContext } from 'react';

export const ColourContext = createContext<DateHueMap | null>(null);

export const useColourContext = () => {
    const context = useContext(ColourContext);
    if (!context) throw new Error('useColour must be used inside ColourProvider');
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