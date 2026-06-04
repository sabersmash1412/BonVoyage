import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { originalItineraryId, userId } = await request.json();

    if (!originalItineraryId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch original itinerary
    const { data: originalItinerary, error: itinErr } = await supabase
      .from("itineraries")
      .select("*")
      .eq("id", originalItineraryId)
      .single();

    if (itinErr || !originalItinerary) {
      console.error("Original itinerary not found:", itinErr);
      return NextResponse.json(
        { error: "Original itinerary not found" },
        { status: 404 }
      );
    }

    // Insert new itinerary for the user
    const { data: newItineraryRow, error: insertItinErr } = await supabase
      .from("itineraries")
      .insert({
        title: originalItinerary.title,
        start_date: originalItinerary.start_date,
        end_date: originalItinerary.end_date,
        user_id: userId,
        input: originalItinerary.input,
        output: originalItinerary.output,
        fromCountry: originalItinerary.fromCountry,
      })
      .select()
      .single();

    if (insertItinErr || !newItineraryRow) {
      console.error("Failed to duplicate itinerary:", insertItinErr);
      return NextResponse.json(
        { error: "Failed to duplicate itinerary" },
        { status: 500 }
      );
    }

    const newItineraryId = newItineraryRow.id;

    // Duplicate activities
    const { data: oldActivities, error: actsError } = await supabase
      .from("activities")
      .select("*")
      .eq("itinerary_id", originalItineraryId);

    if (actsError) {
      console.error("Failed to get activities:", actsError);
      return NextResponse.json(
        { error: "Failed to get activities" },
        { status: 500 }
      );
    }

    if (oldActivities && oldActivities.length > 0) {
      const newActivities = oldActivities.map(({ id, ...rest }) => {

        console.log(id);

        return {
          ...rest,
          itinerary_id: newItineraryId,
          user_id: userId,
        };
      });

      const { error: insertActsErr } = await supabase
        .from("activities")
        .insert(newActivities);

      if (insertActsErr) {
        console.error("Failed to copy activities:", insertActsErr);
        return NextResponse.json(
          { error: "Failed to copy activities" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, newItineraryId });

  } catch (error) {
    console.error("Caught unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}