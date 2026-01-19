import { NextRequest, NextResponse } from "next/server";
import Blog from "../../../utility/data/blogcontent";

async function getBlogData(page: number, limit: number, selectedCategory: string[]) {
  const currentPage = page || 1;
  const itemsPerPage = limit || 6;
  const categories = selectedCategory || [];
  let filteredData = Blog;

  if (categories.length > 0) {
    filteredData = filteredData.filter((item) =>
      categories.includes(item.category)
    );
  }
  // Pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return {
    data: paginatedData,
    totalItems,
    totalPages,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { page, limit, selectedCategory } = await req.json().catch(() => ({}));
    const result = await getBlogData(
      parseInt(page, 10) || 1,
      parseInt(limit, 10) || 6,
      selectedCategory || []
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ data: [], totalItems: 0, totalPages: 0 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const selectedCategory = searchParams.get("selectedCategory");
    
    const categories = selectedCategory ? selectedCategory.split(',') : [];
    const result = await getBlogData(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 6,
      categories
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ data: [], totalItems: 0, totalPages: 0 });
  }
}
