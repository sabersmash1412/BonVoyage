import { getUser } from "@/lib/getUser";
import { updateActivities, deleteActivity, insertNewActivities } from "@/lib/itinerary/activityMethods";
import { activityAddToDbSchema, deleteActivitySchema } from "@/types/itinerary/activity/activitySchema";
import { ActivityAddToDbClientprops, ActivityAddToDbProps } from "@/types/itinerary/activity/activityProps";
import { z, ZodError } from "zod";

//updates activity[] in database
// activities here contains old index as well
export async function PUT(request: Request) {
    try {
        const { supabase, userId } = await getUser()
        const json = await request.json()
        const { activities, itinerary_id } = await json
        console.log("await updateActivities")
        const response = await updateActivities(supabase, userId, activities, itinerary_id);

        if (response == null) {
            return new Response(JSON.stringify({ error: "Error during updating activities" }), {
                status: 400
            });
        }

        console.log("updateActivities success: ", response)
        return new Response(JSON.stringify({ message: "Data received", data: response }), {
            status: 200
        });
    } catch (error) {
        console.error("Error parsing request:", error);
        return new Response(JSON.stringify({ error: "updateActivities failed" }), {
            status: 400
        });
    }
}

// delete an activity
export async function DELETE(request: Request) {
    try {
        const [json, { supabase, userId }] = await Promise.all([request.json(), getUser()])

        const { activity_id } = deleteActivitySchema.parse(json)
        console.log("UserId: ", userId, " to delete Activity: ", activity_id)
        const response = await deleteActivity(supabase, activity_id);

        if (response == null) {
            return new Response(JSON.stringify({ error: "Error during deleting activity" }), {
                status: 400
            });
        }
        return new Response(JSON.stringify({ message: "deleteActivity success" }), {
            status: 200
        });
    } catch (error) {
        console.error("Error parsing request:", error);
        if (error instanceof ZodError) {
            console.error("Zod validation error:", error.flatten());
            return new Response(
                JSON.stringify({
                    error: "Validation failed for deleteActivitySchema",
                    issues: error.flatten().fieldErrors,
                }),
                { status: 422 }
            );
        }

        return new Response(JSON.stringify({ error: "deleteActivity failed" }), {
            status: 400
        });
    }
}

//add activities. activities in body must be ActivityAddToDbProps[]
//currently only used for adding a single activity in handleAddActivity in useActivityCardController.ts
export async function POST(request: Request) {
    try {
        const [{ supabase, userId }, json] = await Promise.all([getUser(), request.json()])

        console.log("*********************************")
        const insertedId: ActivityAddToDbProps = json.map((a: ActivityAddToDbClientprops) => ({ ...a, user_id: userId }))
        console.log("activityadd to db: ", insertedId)
        const activityAddToDbSchemaArray = z.array(activityAddToDbSchema)
        const activities = activityAddToDbSchemaArray.parse(insertedId)

        const response = await insertNewActivities(supabase, activities);
        return new Response(JSON.stringify({ message: "Data received", data: response }), {
            status: 200
        });
    } catch (error) {
        console.error("Error parsing request:", error);
        if (error instanceof ZodError) {
            console.error("Zod validation error:", error.flatten());
            return new Response(
                JSON.stringify({
                    error: "Validation failed for activityAddToDbSchema",
                    issues: error.flatten().fieldErrors,
                }),
                { status: 422 }
            );
        }

        return new Response(JSON.stringify({ error: "insertNewActivitity failed" }), {
            status: 400
        });
    }
}