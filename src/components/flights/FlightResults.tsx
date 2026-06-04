'use client';

import { Props } from "@/types/costBreakdownProps";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function FlightResults({ flights }: Props) {
  if (flights.length === 0) return <></>;
  // return <p>No flight results found.</p>; //removed for milestone 3 submission

  return (
    <div className="mt-4 space-y-4">
      <h2 className="text-xl font-bold">✈️ Flight Options</h2>
      {flights.map((flight) => (
        <div key={flight.id} className="p-4 rounded-md shadow-md border">
          <p><strong>Airline:</strong> {flight.airline}</p>
          <p><strong>Departure:</strong> {formatDateTime(flight.departure)}</p>
          <p><strong>Arrival:</strong> {formatDateTime(flight.arrival)}</p>
          <p><strong>Departure: (Return):</strong> {formatDateTime(flight.returnDeparture)}</p>
          <p><strong>Arrival: (Return):</strong> {formatDateTime(flight.returnArrival)}</p>
          <p><strong>Price:</strong> ${flight.price}</p>
        </div>
      ))}
      <div className="text-center mt-4">
        <a
          href="https://www.skyscanner.com.sg"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          More Flight Prices on Skyscanner
        </a>
      </div>
    </div>
  );
}
