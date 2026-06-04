// hotels
export interface HotelSectionProps {
  location: string;
  checkInDate: string;
  checkOutDate: string;
}

export type PriceData = {
  star: number;
  medianPrice: number;
};

//flights
export type FlightSectionProps = {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate: string;
  adults: number;
};

export type Flight = {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  returnDeparture: string;
  returnArrival: string;
  price: string;
};

export type Props = {
  flights: Flight[];
};

//cost-of-living
export interface CostSectionProps {
  country: string;
  numberOfDays: number;
}

export type CostData = {
  food: string;
  transport: string;
};

export type AirportData = {
  country: string;
  countrySlug: string;
}