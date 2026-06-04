const AMADEUS_AUTH_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";

export async function getAmadeusAccessToken() {
  const clientId = process.env.AMADEUS_CLIENT_ID!;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET!;

  const response = await fetch(AMADEUS_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret
    })
  });

  if (!response.ok) {
    console.error(await response.text());
    throw new Error("Failed to get Amadeus access token");
  }

  const data = await response.json();
  return data.access_token;
}