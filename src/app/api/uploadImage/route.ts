import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files"); 

    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const ext = file.name.split('.').pop();
      const newName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

    
      const { error } = await supabase.storage
        .from("images") 
        .upload(newName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(newName);

      uploadedFiles.push(publicUrlData.publicUrl);
    }

    return NextResponse.json({ urls: uploadedFiles });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}