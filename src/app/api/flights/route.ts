import { NextRequest } from "next/server";
 import { getAmadeusAccessToken } from "@/lib/amadeusClient";

 export async function POST(req: NextRequest) {
   try {
     const body = await req.json();
     const { originLocationCode, destinationLocationCode, departureDate, returnDate, adults } = body;

     const accessToken = await getAmadeusAccessToken();

     const searchParams = new URLSearchParams({
       originLocationCode,
       destinationLocationCode,
       departureDate,
       adults: adults.toString(),
       ...(returnDate && { returnDate }),
       max: "5",
       currencyCode: "USD"
     });

     const response = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?${searchParams.toString()}`, {
       headers: {
         Authorization: `Bearer ${accessToken}`
       }
     });

     const data = await response.json();

     if (!response.ok) {
       return new Response(JSON.stringify({ error: data }), { status: response.status });
     }

     return new Response(JSON.stringify({ flights: data.data }), {
       status: 200
     });
   } catch (err) {
     console.error("Error fetching flight offers:", err);
     return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
   }
 }