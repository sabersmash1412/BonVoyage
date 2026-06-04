import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { location, checkInDate, checkOutDate } = body;

  const marker = process.env.TRAVELPAYOUTS_MARKER;

  if (!marker || !location || !checkInDate || !checkOutDate) {
    return new Response("Missing marker, location, or dates", { status: 400 });
  }

  const url = `https://engine.hotellook.com/api/v2/cache.json?location=${encodeURIComponent(
    location
  )}&currency=usd&limit=100&checkIn=${checkInDate}&checkOut=${checkOutDate}&marker=${marker}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    // console.log("API Response:", data); 

    // Check if valid data
    if (data.status === 'error') {
      return new Response(`Error from API: ${data.message}`, { status: 500 });
    }

    // Extract hotels array 
    const hotels = data || []; // If no 'hotels', empty array

    // Group hotels by star rating
    const priceGroups: Record<number, number[]> = {};

    for (const hotel of hotels) {
      const stars = hotel.stars || 0;
      const price = hotel.priceFrom; // Get the price 

      if (price) {
        if (!priceGroups[stars]) priceGroups[stars] = [];
        priceGroups[stars].push(price);
      }
    }

    // Map into format
    const result = Object.entries(priceGroups)
      .map(([starStr, prices]) => {
        const sortedPrices = prices.sort((a, b) => a - b);
        const star = parseInt(starStr, 10);
        
        // Calculate the median
        let medianPrice;
        const len = sortedPrices.length;
        if (len % 2 === 0) {
          // If even number of prices, average the two middle values
          medianPrice = (sortedPrices[len / 2 - 1] + sortedPrices[len / 2]) / 2;
        } else {
          // If odd, pick the middle value
          medianPrice = sortedPrices[Math.floor(len / 2)];
        }

        return {
          star,
          medianPrice, // The median price
        };
      })
      .sort((a, b) => a.star - b.star); // Sort by star rating

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error("Hotel API error:", err);
    return new Response("Error fetching hotel prices", { status: 500 });
  }
}