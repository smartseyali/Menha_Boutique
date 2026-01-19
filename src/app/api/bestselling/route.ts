import { NextRequest, NextResponse } from "next/server";
import { productApi, mapProductToFrontend } from "@/utils/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 100;

    // Fetch best selling products from backend API
    const products = await productApi.getBestSelling(limit);

    // Map backend format to frontend format
    const mappedProducts = products
      .map((product: any) => {
        return mapProductToFrontend(product, product.images || []);
      })
      .filter((product: any) => product !== null);

    // Backend already handles sorting by sales count (DESC) and filtering > 0 sales

    return NextResponse.json(mappedProducts);
  } catch (error: any) {
    console.error("Error fetching bestselling products:", error);
    return NextResponse.json([], { status: 200 });
  }
}
