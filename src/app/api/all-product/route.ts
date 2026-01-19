import { NextRequest, NextResponse } from "next/server";
import { productApi, mapProductToFrontend } from "@/utils/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { page, limit, categoryId, status, search } = body;

    // Fetch products from backend API
    const productResponse = await productApi.getAll({
      page: page || 1,
      limit: limit || 100,
      categoryId,
      status,
      search,
    });

    // Handle both array response and object with pagination
    let products: any[] = [];
    if (Array.isArray(productResponse)) {
      products = productResponse;
    } else if (productResponse && productResponse.products) {
      products = productResponse.products;
    }

    // Map backend format to frontend format and filter out nulls
    const mappedProducts = products
      .map((product: any) => {
        return mapProductToFrontend(product, product.images || []);
      })
      .filter((product: any) => product !== null);

    return NextResponse.json(mappedProducts);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    // Fallback to empty array on error
    return NextResponse.json([], { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Fetch products from backend API
    const productResponse = await productApi.getAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 100,
      categoryId: categoryId || undefined,
      status: status || undefined,
      search: search || undefined,
    });

    // Handle both array response and object with pagination
    let products: any[] = [];
    if (Array.isArray(productResponse)) {
      products = productResponse;
    } else if (productResponse && productResponse.products) {
      products = productResponse.products;
    }

    // Map backend format to frontend format and filter out nulls
    const mappedProducts = products
      .map((product: any) => {
        return mapProductToFrontend(product, product.images || []);
      })
      .filter((product: any) => product !== null);

    return NextResponse.json(mappedProducts);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    // Fallback to empty array on error
    return NextResponse.json([], { status: 200 });
  }
}
