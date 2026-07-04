import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js"; 

// Initialize Supabase client

export async function GET(request: Request) {
  const supabase = createClient(
    (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const country = new URL(request.url).searchParams.get("country") || "singapore";
  const url = `https://livingcost.org/cost/${country}`;
  
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const html = await res.text();
  
  const $ = cheerio.load(html); 

  const base = "#content > div:nth-child(3) > div.col-12.col-lg-8.mb-3 > div.table-margin > table > tbody";
  const foodSel = `${base} > tr:nth-child(4) > td:nth-child(2) > div > span:nth-child(1)`;
  const transportSel = `${base} > tr:nth-child(5) > td:nth-child(2) > div > span:nth-child(1)`;

  const foodCost = $(foodSel).text().trim();
  const transportCost = $(transportSel).text().trim();
  const now = new Date().toISOString();
  console.log("test:", { foodCost, transportCost });

  // Save to Supabase
  const { error } = await supabase
    .from("cost_of_living")
    .upsert(
        [
        {
            country,
            food : foodCost,
            transport: transportCost,
            scraped_at: now,
        },
        ],
        { onConflict: "country" }  
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the stored data
  return NextResponse.json({
    food: foodCost,
    transport: transportCost,
  }); 
}
