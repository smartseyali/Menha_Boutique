import { NextRequest, NextResponse } from "next/server";
import Instagram from "../../../utility/data/instagram";

export async function POST(req: NextRequest) {
  try {
    return NextResponse.json(Instagram, { status: 200 });
  } catch (error: any) {
    console.error("Error in instagram POST:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json(Instagram, { status: 200 });
  } catch (error: any) {
    console.error("Error in instagram GET:", error);
    return NextResponse.json([], { status: 200 });
  }
}