import { NextRequest, NextResponse } from "next/server";
import { productApi, mapProductToFrontend } from "@/utils/api";

export async function POST(req: NextRequest) {
  try {
    const { productId, categoryId, limit = 8 } = await req.json().catch(() => ({}));
    
    // Fetch products from backend API
    // If categoryId is provided, fetch products from that category
    // Otherwise, fetch all products and return a subset
    const productResponse = await productApi.getAll({
      page: 1,
      limit: limit * 2, // Fetch more to have options after filtering
      categoryId: categoryId || undefined,
    });

    // Handle both array response and object with pagination
    let products: any[] = [];
    if (Array.isArray(productResponse)) {
      products = productResponse;
    } else if (productResponse && productResponse.products) {
      products = productResponse.products;
    }

    // Filter out the current product if productId is provided
    let relatedProducts = products;
    if (productId) {
      relatedProducts = products.filter((p: any) => p.id !== productId);
    }

    // Map to frontend format and limit results
    const mappedProducts = relatedProducts
      .slice(0, limit)
      .map((product: any) => {
        // Return full product object mapped to frontend format
        return mapProductToFrontend(product, product.images || []);
      })
      .filter((product: any) => product !== null);

    return NextResponse.json(mappedProducts);
  } catch (error: any) {
    console.error("Error fetching related products:", error);
    // Return empty array on error
    return NextResponse.json([]);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const categoryId = searchParams.get("categoryId");
    const limit = parseInt(searchParams.get("limit") || "8");
    
    const productResponse = await productApi.getAll({
      page: 1,
      limit: limit * 2,
      categoryId: categoryId || undefined,
    });

    // Handle both array response and object with pagination
    let products: any[] = [];
    if (Array.isArray(productResponse)) {
      products = productResponse;
    } else if (productResponse && productResponse.products) {
      products = productResponse.products;
    }

    let relatedProducts = products;
    if (productId) {
      relatedProducts = products.filter((p: any) => p.id !== productId);
    }

    const mappedProducts = relatedProducts
      .slice(0, limit)
      .map((product: any) => {
        // Return full product object mapped to frontend format
        return mapProductToFrontend(product, product.images || []);
      });

    return NextResponse.json(mappedProducts);
  } catch (error: any) {
    console.error("Error fetching related products:", error);
    return NextResponse.json([]);
  }
}
