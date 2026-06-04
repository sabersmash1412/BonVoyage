import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

export async function getSupabaseClient() {
    const client = await createClient();
    return client
}

export async function getUser() {
    try {
        const supabase = await getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.log("Unauthorised")
            throw new Error("Unauthorised");
        }
        return { supabase: supabase, userId: (user as User).id as string }
    } catch (error) {
        throw new Error(`supabase unable to get user: ${error}`)
    }
}

export async function getUserProfile() {
    try {
        const { supabase, userId } = await getUser();

        const { data: profile, error } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", userId)
            .single();

        if (error || !profile) {
            throw new Error("User profile not found");
        }

        return {
            userId,
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url
        };
    } catch (err) {
        console.error("Error in getUserProfile:", err);
        throw err;
    }
}