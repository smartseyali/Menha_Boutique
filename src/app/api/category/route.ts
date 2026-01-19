import { NextRequest, NextResponse } from "next/server";
import { categoryApi } from "@/utils/api";

export async function POST(req: NextRequest) {
  try {
    // Fetch categories from backend API
    const categories = await categoryApi.getAll();
    
    // Ensure categories is an array
    if (!Array.isArray(categories)) {
      console.warn("Categories API returned non-array:", categories);
      return NextResponse.json([]);
    }
    
    // Transform to match frontend format: { category: name, count: productCount }
    const result = categories.map((cat: any) => ({
      category: cat.name || cat.category || '',
      id: cat.id,
      count: cat.productCount || cat.count || 0,
      slug: cat.slug || '',
      sequence: cat.sequence || 0,
    }));
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    // Fallback to empty array if backend fails
    return NextResponse.json([], { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Fetch categories from backend API
    const categories = await categoryApi.getAll();
    
    // Ensure categories is an array
    if (!Array.isArray(categories)) {
      console.warn("Categories API returned non-array:", categories);
      return NextResponse.json([]);
    }
    
    // Transform to match frontend format: { category: name, count: productCount }
    const result = categories.map((cat: any) => ({
      category: cat.name || cat.category || '',
      id: cat.id,
      count: cat.productCount || cat.count || 0,
      slug: cat.slug || '',
      sequence: cat.sequence || 0,
    }));
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    // Fallback to empty array if backend fails - return 200 to prevent error propagation
    return NextResponse.json([], { status: 200 });
  }
}
