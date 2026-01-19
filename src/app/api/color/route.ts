import { NextRequest, NextResponse } from "next/server";
import Color from "../../../utility/data/allarrivals";
import _ from "lodash"

async function getColorData() {
  const ColorItems = Color;
  const groupedByColor = _.groupBy(ColorItems, "color");

  const result = _.map(groupedByColor, (items: string, key: any) => ({
    color: key,
    count: items.length
  }));
  return result;
}

export async function POST(req: NextRequest) {
  const result = await getColorData();
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const result = await getColorData();
  return NextResponse.json(result);
}
