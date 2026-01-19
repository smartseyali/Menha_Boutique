import { NextRequest, NextResponse } from "next/server";
import TermTwo from "../../../utility/data/termtwo";

export async function POST(req: NextRequest) {
  return NextResponse.json(TermTwo);
}

export async function GET(req: NextRequest) {
  return NextResponse.json(TermTwo);
}