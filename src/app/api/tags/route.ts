import { NextRequest, NextResponse } from "next/server";
import Tag from "../../../utility/data/allarrivals";
import _ from "lodash"

async function getTagData() {
  const TagItems = Tag;
  const groupedByTag = _.groupBy(TagItems, "tag");

  const result = _.map(groupedByTag, (items: string, key: any) => ({
    Tag: key,
    count: items.length 
  }));
  return result;
}

export async function POST(req: NextRequest) {
  const result = await getTagData();
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const result = await getTagData();
  return NextResponse.json(result);
}
