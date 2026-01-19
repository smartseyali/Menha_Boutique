import { NextRequest, NextResponse } from "next/server";
import Blog from "../../../utility/data/blogcontent";
import _ from "lodash";

async function getBlogCategoryData() {
  const BlogCategory = Blog;

  const groupedByCategory = _.groupBy(BlogCategory, "category")

  const result = _.map(groupedByCategory, (items: string, key: any) => ({
    category: key,
    count: items.length
  }))

  return result;
}

export async function POST(req: NextRequest) {
  const result = await getBlogCategoryData();
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const result = await getBlogCategoryData();
  return NextResponse.json(result);
}
