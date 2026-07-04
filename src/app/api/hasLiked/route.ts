"use server"

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try { 
    const { searchParams } = new URL(request.url);
    const post_id = searchParams.get("post_id");
    const user_id = searchParams.get("user_id");

    if (!post_id || !user_id) {
      return NextResponse.json(
        { error: "post_id and user_id are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("likes") 
      .select("id")
      .eq("post_id", post_id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to check like status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ liked: !!data });

  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}