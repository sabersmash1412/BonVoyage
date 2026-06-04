"use client";

import { useEffect, useState } from "react";

interface CostSectionProps {
  country: string;
  numberOfDays: number;
}

type CostData = {
  food: string;
  transport: string;
};

export default function CostSection({ country, numberOfDays }: CostSectionProps) {
  const [data, setData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // try to fetch from Supabase via /api/cost
      const res = await fetch(`/api/cost?country=${country}`);
      let result = await res.json();

      // if not found, trigger scrape and retry
      if (!res.ok || !result?.food || !result?.transport) {
        const scrapeRes = await fetch(`/api/test-scrape?country=${country}`);
        if (scrapeRes.ok) {
          result = await scrapeRes.json();
        }
      }

      // store result
      if (result?.food && result?.transport) {
        setData(result);
      }

      setLoading(false);
    }

    fetchData();
  }, [country]);

  if (loading) return <p>Loading cost of living...</p>;
  if (!data) return <p>No cost of living data available for {country}.</p>;

  // Etract numeric values with 3.5x multiplier for tourists
  const parsePrice = (str: string) => parseFloat(str.replace(/[^0-9.]/g, "")) || 0;
  const foodPerDay = parsePrice(data.food) / 30 * 3.5; 
  const transportPerDay = parsePrice(data.transport) / 30 * 3.5;

  const totalFood = foodPerDay * numberOfDays;
  const totalTransport = transportPerDay * numberOfDays; 

  return (
    <div className="mt-4 space-y-4">
      <h2 className="text-xl font-bold">💰 Estimated Food & Transport per person</h2>
      <div className="p-4 rounded-md shadow-md border space-y-1">
        <p><strong>🍽️ Food costs estimated:</strong> ~${foodPerDay.toFixed(2)} / day</p>
        <p><strong>🚌 Transport costs estimated:</strong> ~${transportPerDay.toFixed(2)} / day</p>
        <hr className="my-2" />
        <p><strong>📅 Total for {numberOfDays} days:</strong></p>
        <ul className="list-disc list-inside pl-2">
          <li>🍽️ Food: ${totalFood.toFixed(2)}</li>
          <li>🚌 Transport: ${totalTransport.toFixed(2)}</li>
        </ul>
        <p className="text-sm text-gray-500 mt-2 italic">
          Estimates based on median local prices
        </p>
      </div>
    </div>
  );
}