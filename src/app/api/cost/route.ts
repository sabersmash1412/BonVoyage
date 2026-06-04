import { createClient } from "@supabase/supabase-js";
//import { transpose } from "date-fns";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const country = new URL(req.url).searchParams.get("country");
  if (!country) return NextResponse.json({}, { status: 400 });

  // First check Supabase for existing data
  const { data, error } = await supabase
    .from("cost_of_living")
    .select("food, transport")
    .eq("country", country)
    .single();

  if (error || !data) {
    // If no data found, return a 404
    return NextResponse.json({}, { status: 404 });
  }

  return NextResponse.json(data);
}
