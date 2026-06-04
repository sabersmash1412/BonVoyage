import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/getUser";

export async function GET() {
    console.log("====== API getUserProfile called ======")
    try {
        const data = await getUserProfile();
        console.log("Fetched profile:", data)
        return NextResponse.json(data);
    } catch (err) {
        console.error("API getUserProfile error:", err);
        return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 400 });
    }
}
