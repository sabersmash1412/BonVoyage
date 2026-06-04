import { getSupabaseClient, } from "@/lib/getUser";
import { editItinerariesDate, deleteDay } from "@/lib/itinerary/dayMethods";
import { deleteDaySchema, updateDaySchema } from "@/types/itinerary/day/daySchema";
import { ZodError } from "zod";

// incr ititnerary end date by 1 in public.itineraries
export async function PUT(request: Request) {
    try {
        console.log("awaiting add day to itinerary, ", request.url)
        const [supabase, json] = await Promise.all([getSupabaseClient(), request.json()])

        const { newDateString, itinerary_id } = updateDaySchema.parse(json)
        const response = await editItinerariesDate(supabase, newDateString, itinerary_id, "end");
        if (response == null) {
            return new Response(JSON.stringify({ error: "Error adding day" }), {
                status: 400
            });
        }

        return new Response(JSON.stringify({ message: "added day" }), {
            status: 200
        });
    } catch (error) {
        console.error("Error parsing request:", error);
        if (error instanceof ZodError) {
            console.error("Zod validation error:", error.flatten());
            return new Response(
                JSON.stringify({
                    error: "Validation failed for updateDaySchema",
                    issues: error.flatten().fieldErrors,
                }),
                { status: 422 }
            );
        }

        return new Response(JSON.stringify({ error: "adding day failed" }), {
            status: 400
        });
    }
}

// delete entire day including that day's activities
export async function DELETE(request: Request) {
    try {
        console.log("awaiting deleting day, ", request.url)
        const [supabase, json] = await Promise.all([getSupabaseClient(), request.json()])
        const { day, itinerary_id } = deleteDaySchema.parse(json)

        const response = await deleteDay(supabase, day, itinerary_id);
        if (response == null) {
            return new Response(JSON.stringify({ error: "Error deleting day" }), {
                status: 400
            });
        }

        return new Response(JSON.stringify({ message: "deleted day" }), {
            status: 200
        });
    } catch (error) {
        console.error("Error parsing request:", error);
        if (error instanceof ZodError) {
            console.error("Zod validation error:", error.flatten());
            return new Response(
                JSON.stringify({
                    error: "Validation failed for deleteDaySchema",
                    issues: error.flatten().fieldErrors,
                }),
                { status: 422 }
            );
        }

        return new Response(JSON.stringify({ error: "deleting day failed" }), {
            status: 400
        });
    }
}