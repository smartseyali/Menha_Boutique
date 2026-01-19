import { NextRequest, NextResponse } from "next/server";
import Term from "../../../utility/data/term";

export async function POST(req: NextRequest) {
  return NextResponse.json(Term);
}

export async function GET(req: NextRequest) {
  return NextResponse.json(Term);
}