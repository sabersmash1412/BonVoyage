import { Place, PlacesAPIMatrix } from "@/types/itinerary/Map/mapProps";

type OsrmTableResponse = {
  code: string;
  distances?: (number | null)[][];
  durations?: (number | null)[][];
  message?: string;
};

function buildOsrmCoordinates(places: Place[]) {
  return places
    .map((place) => `${place.coordinates.lng},${place.coordinates.lat}`)
    .join(";");
}

function convertOsrmTable(data: OsrmTableResponse, size: number): PlacesAPIMatrix[] {
  const matrix: PlacesAPIMatrix[] = [];

  for (let originIndex = 0; originIndex < size; originIndex++) {
    for (let destinationIndex = 0; destinationIndex < size; destinationIndex++) {
      const distance = data.distances?.[originIndex]?.[destinationIndex];
      const duration = data.durations?.[originIndex]?.[destinationIndex];
      const routeExists = distance !== null && distance !== undefined;

      matrix.push({
        originIndex,
        destinationIndex,
        status: {},
        condition: routeExists ? "ROUTE_EXISTS" : "ROUTE_NOT_FOUND",
        duration: duration !== null && duration !== undefined ? `${Math.round(duration)}s` : "0",
        distanceMeters: routeExists ? Math.round(distance) : undefined,
      });
    }
  }

  return matrix;
}

export async function POST(request: Request) {
  try {
    const { places } = await request.json() as { places?: Place[] };
    if (!places || !Array.isArray(places) || places.length === 0) {
      return Response.json({ error: "places must be a non-empty array" }, { status: 400 });
    }

    const coordinates = buildOsrmCoordinates(places);
    const osrmUrl = new URL(`https://router.project-osrm.org/table/v1/driving/${coordinates}`);
    osrmUrl.searchParams.set("annotations", "duration,distance");

    const response = await fetch(osrmUrl, {
      headers: {
        "User-Agent": "BonVoyage/1.0 (+https://bon-voyage-iota.vercel.app)",
      },
    });

    if (!response.ok) {
      const details = await response.text();
      return Response.json({ error: "OSRM request failed", details }, { status: response.status });
    }

    const data = await response.json() as OsrmTableResponse;
    if (data.code !== "Ok") {
      return Response.json({ error: data.message || "OSRM returned an error" }, { status: 400 });
    }

    return Response.json(convertOsrmTable(data, places.length));
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: "Route matrix failed", details }, { status: 500 });
  }
}
