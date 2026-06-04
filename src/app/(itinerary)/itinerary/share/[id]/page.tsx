import { getUser } from '@/lib/getUser';
import { redirect } from 'next/navigation';

export default async function ShareHandler({
  params,
}: {
  params: Promise<{ id: string }> 
}) {
  const { id } = await params; 
  const { userId } = await getUser();

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/duplicateItinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      originalItineraryId: Number(id), 
      userId 
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return (
      <div className="p-4 text-red-500">
        Error: {data.error || "Failed to duplicate itinerary"}
      </div>
    );
  }

  redirect(`/itinerary/${data.newItineraryId}`);
}