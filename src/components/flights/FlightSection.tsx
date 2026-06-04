"use client";
import { useEffect, useState } from "react";
import FlightResults from "./FlightResults";
import airlineMap from "@/data/airlines.json";
import { FlightSectionProps, Flight } from "@/types/costBreakdownProps";


export default function FlightSection({
  originLocationCode,
  destinationLocationCode,
  departureDate,
  returnDate,
  adults,
}: FlightSectionProps) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlights() {
      try {
        const res = await fetch("/api/flights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            originLocationCode,
            destinationLocationCode,
            departureDate,
            returnDate,
            adults,
          }),
        });

        const data = await res.json();
        if (data?.flights) {
          type RawFlight = {
            itineraries: {
              segments: {
                departure: { at: string };
                arrival: { at: string };
              }[];
            }[];
            validatingAirlineCodes?: string[];
            price: {
              total: string;
            };
          };

          const simplified = data.flights.map((f: RawFlight, i: number) => {
            const outbound = f.itineraries[0]?.segments;
            const inbound = f.itineraries[1]?.segments;
            const code = f.validatingAirlineCodes?.[0] as keyof typeof airlineMap;

            return {
              id: i.toString(),
              airline: airlineMap[code] ?? code ?? "Unknown",
              departure: outbound?.[0]?.departure?.at ?? "TBD",
              arrival: outbound?.at(-1)?.arrival?.at ?? "TBD",
              returnDeparture: inbound?.[0]?.departure?.at ?? "TBD",
              returnArrival: inbound?.at(-1)?.arrival?.at ?? "TBD",
              price: f.price.total,
            };
          });
          setFlights(simplified);
        } else {
          setFlights([]);
        }
      } catch (err) {
        console.error("Failed to fetch flights:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFlights();
  }, [originLocationCode, destinationLocationCode, departureDate, returnDate, adults]);

  if (loading) return <div>Loading flight data...</div>;
  return <FlightResults flights={flights} />;
}