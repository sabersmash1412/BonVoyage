import Image from 'next/image';
import { ItineraryOverviewProps } from '@/types/itinerary/itineraryProps';
import { ReactNode } from 'react';

export default function TripOverview({ itineraryOverview, children }: { itineraryOverview: ItineraryOverviewProps, children?: ReactNode; }) {
    return (<div className='flex flex-row justify-between items-center mb-2 px-4'>
        <h1 className='font-medium text-xl'>Trip to {itineraryOverview.title}</h1>
        {children}
        <div className='flex flex-row items-center gap-5 bg-zinc-300 rounded-sm pl-3 pr-3'>
            <Image
                src="/airplane-svgrepo-com.svg"
                alt="Airplane"
                width={35}
                height={35}
            />
            <p className='font-medium text-sm'> {itineraryOverview.start_date} - {itineraryOverview.end_date}</p>
        </div>
    </div >)
}