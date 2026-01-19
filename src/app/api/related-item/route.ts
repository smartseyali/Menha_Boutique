import { NextRequest, NextResponse } from "next/server";
import { productApi, mapProductToFrontend } from "@/utils/api";

export async function POST(req: NextRequest) {
  try {
    const { productId, limit = 1 } = await req.json().catch(() => ({}));
    
    // Fetch a single product - if productId is provided, fetch that product
    // Otherwise, fetch the first product
    let product;
    if (productId) {
      product = await productApi.getById(productId);
    } else {
      const products = await productApi.getAll({ page: 1, limit: 1 });
      product = products.length > 0 ? products[0] : null;
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Map to frontend format
    const mappedProduct = mapProductToFrontend(product, product.images || []);

    return NextResponse.json(mappedProduct);
  } catch (error: any) {
    console.error("Error fetching related item:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    
    let product;
    if (productId) {
      product = await productApi.getById(productId);
    } else {
      const products = await productApi.getAll({ page: 1, limit: 1 });
      product = products.length > 0 ? products[0] : null;
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const mappedProduct = mapProductToFrontend(product, product.images || []);

    return NextResponse.json(mappedProduct);
  } catch (error: any) {
    console.error("Error fetching related item:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
