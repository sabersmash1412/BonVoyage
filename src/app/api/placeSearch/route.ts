type PhotonFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    name?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
};

function formatLabel(feature: PhotonFeature) {
  const properties = feature.properties ?? {};
  const parts = [
    properties.name || properties.street,
    properties.city,
    properties.state,
    properties.country,
  ].filter(Boolean);

  return [...new Set(parts)].join(", ");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return Response.json({ results: [] });
  }

  const photonUrl = new URL("https://photon.komoot.io/api/");
  photonUrl.searchParams.set("q", query);
  photonUrl.searchParams.set("limit", "5");
  photonUrl.searchParams.set("lang", "en");

  const response = await fetch(photonUrl, {
    headers: {
      "User-Agent": "BonVoyage/1.0 (+https://bon-voyage-iota.vercel.app)",
    },
  });

  if (!response.ok) {
    return Response.json({ error: "Place search failed" }, { status: response.status });
  }

  const data = await response.json() as { features?: PhotonFeature[] };
  const results = (data.features ?? [])
    .map((feature) => {
      const coordinates = feature.geometry?.coordinates;
      if (!coordinates) return null;

      const label = formatLabel(feature);
      if (!label) return null;

      return {
        label,
        lng: coordinates[0],
        lat: coordinates[1],
      };
    })
    .filter(Boolean);

  return Response.json({ results });
}
