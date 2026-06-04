import { getSupabaseClient, getUser } from "@/lib/getUser";
import { deleteItinerary, generateItinerary, getAllItineraries } from "@/lib/itinerary/itineraryMethods";
import { allItinerariesArraySchema, deleteItinerarySchema, itineraryFormSchema } from "@/types/itinerary/itinerarySchema";
import { ZodError } from "zod";

// generate itinerary by posting user's form input to backend AI
export async function POST(request: Request) {
  try {
    const json = await request.json()
    console.log("json is ", json)
    const formInput = itineraryFormSchema.parse(json)

    console.log(request.url, " --> ", formInput)

    const { supabase, userId } = await getUser()

    const itineraryId = await generateItinerary(formInput, supabase, userId);

    // checks whether id is number and checks that it is a finite number
    if (typeof itineraryId !== 'number' || !Number.isFinite(itineraryId)) {
      return new Response(JSON.stringify({ error: "Error generating Itinerary" }), {
        status: 400
      });
    }

    return new Response(JSON.stringify({ message: "Data received", data: itineraryId }), {
      status: 200
    });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Zod validation error:", error.flatten());
      return new Response(
        JSON.stringify({
          error: "Validation failed for itineraryFormSchema",
          issues: error.flatten().fieldErrors,
        }),
        { status: 422 }
      );
    }

    console.error("Error parsing request:", error);
    return new Response(JSON.stringify({ error: "generateItinerary failed" }), {
      status: 400
    });
  }
}

// get all users' itineraries for /trips
export async function GET(request: Request) {
  try {
    console.log("awaiting getAllItineraries, ", request.url)
    const { supabase, userId } = await getUser()
    const response = await getAllItineraries(supabase, userId);
    if (response == null) {
      return new Response(JSON.stringify({ error: "Error getting itineraries" }), {
        status: 400
      });
    }

    //ensure that response fits allItinerariesArraySchema
    const result = allItinerariesArraySchema.parse(response);
    console.log("receive response from getAllItineraries, ", result)
    return new Response(JSON.stringify({ message: "Data received", data: result }), {
      status: 200
    });
  } catch (error) {
    console.error("Error parsing request:", error);
    if (error instanceof ZodError) {
      console.error("Zod validation error:", error.flatten());
      return new Response(
        JSON.stringify({
          error: "Validation failed for allItinerariesArraySchema",
          issues: error.flatten().fieldErrors,
        }),
        { status: 422 }
      );
    }

    return new Response(JSON.stringify({ error: "getAllItineraries failed" }), {
      status: 400
    });
  }
}

// delete entire itinerary including activities
export async function DELETE(request: Request) {
  try {
    console.log(request.url)
    const [supabase, json] = await Promise.all([getSupabaseClient(), request.json()])

    const { itinerary_id } = deleteItinerarySchema.parse(json)
    console.log("await deleteActivity: ", itinerary_id)
    const response = await deleteItinerary(supabase, itinerary_id);

    if (response == null) {
      return new Response(JSON.stringify({ error: "Error during deleting Itinerary" }), {
        status: 400
      });
    }
    return new Response(JSON.stringify({ message: "deleteItinerary success" }), {
      status: 200
    });
  } catch (error) {
    console.error("Error parsing request:", error);
    if (error instanceof ZodError) {
      console.error("Zod validation error:", error.flatten());
      return new Response(
        JSON.stringify({
          error: "Validation failed for deleteItinerarySchema",
          issues: error.flatten().fieldErrors,
        }),
        { status: 422 }
      );
    }

    return new Response(JSON.stringify({ error: "deleteItinerary failed" }), {
      status: 400
    });
  }
}