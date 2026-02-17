import { NextResponse } from "next/server";
import { serverClient } from "@/lib/sanity.server";

export async function GET() {
    try {
        const event = await serverClient.fetch(`*[_type == "event"][0]{_id, title}`);
        return NextResponse.json({ event });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
