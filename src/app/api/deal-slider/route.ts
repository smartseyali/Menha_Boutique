import { NextRequest, NextResponse } from "next/server";
import { productApi, mapProductToFrontend } from "@/utils/api";

async function getDealProducts() {
  try {
    // Fetch products from backend API
    const productResponse = await productApi.getAll({
      page: 1,
      limit: 10,
      status: 'In Stock',
    });

    // Handle both array response and object with pagination
    let products: any[] = [];
    if (Array.isArray(productResponse)) {
      products = productResponse;
    } else if (productResponse && productResponse.products) {
      products = productResponse.products;
    }

    // Map to frontend format without filtering by sale_tag
    const dealProducts = products
      .slice(0, 10)
      .map((product: any) => {
        return mapProductToFrontend(product, product.images || []);
      })
      .filter((product: any) => product !== null);

    return dealProducts;
  } catch (error: any) {
    console.error("Error fetching deal products:", error);
    // Fallback to empty array on error
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const dealProducts = await getDealProducts();
    return NextResponse.json(dealProducts, { status: 200 });
  } catch (error: any) {
    console.error("Error in deal-slider POST:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const dealProducts = await getDealProducts();
    return NextResponse.json(dealProducts, { status: 200 });
  } catch (error: any) {
    console.error("Error in deal-slider GET:", error);
    return NextResponse.json([], { status: 200 });
  }
}
