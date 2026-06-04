"use client";

import { useEffect, useState } from "react";
import { HotelSectionProps, PriceData } from "@/types/costBreakdownProps";

export default function HotelSection({ location, checkInDate, checkOutDate }: HotelSectionProps) {
  const [hotelPrices, setHotelPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotelEstimates = async () => {
      try {
        const res = await fetch("/api/hotels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location,
            checkInDate,
            checkOutDate, 
          }),
        });

        const data = await res.json();
        setHotelPrices(data);
      } catch (err) {
        console.error("Hotel price fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelEstimates();
  }, [location, checkInDate, checkOutDate]);

  if (loading) return <p>Loading hotel prices...</p>;
  if (hotelPrices.length === 0) return <p>No hotel data found.</p>;

  return (
    <div className="mt-4 space-y-4">
        <h2 className="text-xl font-bold">🏨 Total Estimated Hotel Expenses</h2>
        {hotelPrices.map((entry) => (
        <div key={entry.star} className="p-4 rounded-md shadow-md border">
            <p>
            {'⭐'.repeat(entry.star)} <strong>Star Hotels:</strong> ${entry.medianPrice}
            </p>
        </div>
        ))}
        <div className="text-center mt-4">
            <a
                href="https://www.hotels.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
            >
                Check Hotel Prices on Hotels.com
            </a>
        </div>
    </div>
  );
}