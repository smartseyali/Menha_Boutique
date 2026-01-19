import { NextRequest, NextResponse } from "next/server";
import CategorySlider from "../../../utility/data/categoryslider";
import { categoryApi } from "@/utils/api";

async function getCategorySlider() {
  try {
    // Try to fetch categories from API and transform to slider format
    const categories = await categoryApi.getAll();
    
    // Ensure categories is an array
    if (Array.isArray(categories) && categories.length > 0) {
      // Transform API categories to slider format
      return categories.slice(0, 8).map((cat: any, index: number) => ({
        name: cat.name || cat.category || '',
        image: cat.image_url || cat.image || `/assets/img/category/category-${index + 1}.jpg`,
        item: cat.productCount || cat.count || 0,
        num: index + 1,
      }));
    }
    
    // Fallback to hardcoded data
    console.warn("No categories found, using hardcoded data");
    return CategorySlider;
  } catch (error: any) {
    console.error("Error fetching categories for slider:", error);
    // Fallback to hardcoded data on error
    return CategorySlider;
  }
}

export async function POST(req: NextRequest) {
  try {
    const categories = await getCategorySlider();
    return NextResponse.json(categories, { status: 200 });
  } catch (error: any) {
    console.error("Error in category-slider POST:", error);
    // Return fallback data even if getCategorySlider fails
    return NextResponse.json(CategorySlider, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const categories = await getCategorySlider();
    return NextResponse.json(categories, { status: 200 });
  } catch (error: any) {
    console.error("Error in category-slider GET:", error);
    // Return fallback data even if getCategorySlider fails
    return NextResponse.json(CategorySlider, { status: 200 });
  }
}
