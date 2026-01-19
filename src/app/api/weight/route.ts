import { NextRequest, NextResponse } from "next/server";
import Weight from "../../../utility/data/allarrivals";
import _ from "lodash"

async function getWeightData() {
  const WeightItems = Weight;
  const groupedByWeight = _.groupBy(WeightItems, "weight");

  const result = _.map(groupedByWeight, (items: string, key: any) => ({
    weight: key,
    count: items.length 
  }));
  return result;
}

export async function POST(req: NextRequest) {
  const result = await getWeightData();
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const result = await getWeightData();
  return NextResponse.json(result);
}
