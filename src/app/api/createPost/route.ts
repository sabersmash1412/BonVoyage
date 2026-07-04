import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, content, fullName, avatarUrl, imageURLs } = await request.json();

    if (!userId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        author: userId,
        content,
        fullName: fullName,
        avatarUrl: avatarUrl,
        imageURLs: imageURLs,
      });

    if (error) {
        console.error("Supabase insert error:", error);
        return NextResponse.json(
            { error: "Failed to create post" },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Caught:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}