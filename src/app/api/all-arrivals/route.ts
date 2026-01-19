import { NextRequest, NextResponse } from "next/server";
import { productApi, mapProductToFrontend, categoryApi } from "@/utils/api";

function sortData(filteredData: any[], sortOption: string) {
  switch (sortOption) {
    case "1":
      // Sort by (implement custom logic if necessary)
      return filteredData;
    case "2":
      // Sort by Position (implement custom logic if necessary)
      return filteredData;
    case "3":
      // Sort by Relevance (implement custom logic if necessary)
      return filteredData;
    case "4":
      // Sort by Name, A to Z
      return [...filteredData].sort((a, b) =>
        a.category.localeCompare(b.category)
      );
    case "5":
      // Sort by Name, Z to A
      return [...filteredData].sort((a, b) =>
        b.category.localeCompare(a.category)
      );
    case "6":
      // Sort by Price, low to high
      return [...filteredData].sort((a, b) => a.newPrice - b.newPrice);
    case "7":
      // Sort by Price, high to low
      return [...filteredData].sort((a, b) => b.newPrice - a.newPrice);
    default:
      return filteredData;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Handle empty or invalid request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      // If JSON parsing fails, use empty object with defaults
      console.warn("Failed to parse request body, using defaults");
      requestBody = {};
    }

    const {
      searchTerm = "",
      sortOption = "1",
      page = 1,
      limit = 12,
      selectedCategory = [],
      selectedTags = [],
      selectedColor = [],
      selectedWeight = [],
      MinPrice = 0,
      MaxPrice = Infinity,
      range = { min: 0, max: 250 },
      minPrice = 0,
      maxPrice = Infinity,
    } = requestBody;

    const currentPage = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);

    // Fetch products from backend API
    let backendProducts = [];
    try {
      // If a category is selected, get the category ID
      let categoryId: string | undefined = undefined;
      if (selectedCategory && selectedCategory.length > 0) {
        // Fetch all categories to find the ID
        try {
            const categories = await categoryApi.getAll();
            const selectedCatName = selectedCategory[0]; // Assuming single category selection for now
            const matchedCategory = categories.find((cat: any) => 
                (cat.name && cat.name.toLowerCase() === selectedCatName.toLowerCase()) || 
                (cat.category && cat.category.toLowerCase() === selectedCatName.toLowerCase())
            );
            if (matchedCategory) {
                categoryId = matchedCategory.id;
            }
        } catch (catError) {
            console.error("Error fetching categories for ID mapping:", catError);
        }
      }
      
      // Use minPrice/maxPrice from request, or fall back to range
      const effectiveMinPrice = minPrice || range?.min || 0;
      const effectiveMaxPrice = maxPrice || range?.max || 250;
      
      const productResponse = await productApi.getAll({
        page: 1,
        limit: itemsPerPage > 100 ? itemsPerPage : 100, // Use requested limit if large, otherwise default to 100
        search: searchTerm || undefined,
        categoryId: categoryId,
      });
      
      // productApi.getAll returns either { products: [], pagination: {} } or just []
      // Handle both cases
      if (productResponse && productResponse.products) {
        backendProducts = productResponse.products;
      } else if (Array.isArray(productResponse)) {
        backendProducts = productResponse;
      } else {
        backendProducts = [];
      }
    } catch (error) {
      console.error("Error fetching products from backend:", error);
      // Return empty data structure on error
      return NextResponse.json({
        data: [],
        totalItems: 0,
        currentPage: parseInt(page, 10) || 1,
        totalPages: 0,
      });
    }

    // Ensure backendProducts is an array
    if (!Array.isArray(backendProducts)) {
      console.warn("backendProducts is not an array:", backendProducts);
      backendProducts = [];
    }
    
    // Map backend products to frontend format and filter out nulls
    let filteredData = backendProducts
      .map((product: any) => {
        return mapProductToFrontend(product, product.images || []);
      })
      .filter((product): product is NonNullable<any> => product != null);
    
    // Filter by search term (search in title and description, not just category)
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredData = filteredData.filter((item): item is NonNullable<typeof item> =>
        item !== null && (
          (item.title && item.title.toLowerCase().includes(searchLower)) ||
          (item.description && item.description.toLowerCase().includes(searchLower)) ||
          (item.category && item.category.toLowerCase().includes(searchLower)) ||
          (item.brand && item.brand.toLowerCase().includes(searchLower))
        )
      );
    }
    
    // Use effective price range (from request or range object)
    const effectiveMinPrice = minPrice || MinPrice || range?.min || 0;
    const effectiveMaxPrice = (maxPrice && maxPrice !== Infinity) || (MaxPrice && MaxPrice !== Infinity) ? (maxPrice || MaxPrice) : (range?.max || 250);
    
    // Filter by price range
    filteredData = filteredData.filter(item =>
      item.newPrice >= effectiveMinPrice &&
      item.newPrice <= effectiveMaxPrice
    );

    // Filter by selected category (category names from dropdown)
    if (selectedCategory && selectedCategory.length > 0) {
      filteredData = filteredData.filter((item) =>
        selectedCategory.some((cat: string) => 
          item.category.toLowerCase() === cat.toLowerCase()
        )
      );
    }

    if (selectedTags.length > 0) {
      filteredData = filteredData.filter((item: any) =>
        selectedTags.includes(item.tag)
      );
    }

    if (selectedWeight.length > 0) {
      filteredData = filteredData.filter((item) =>
        selectedWeight.includes(item.weight)
      );
    }

    if (selectedColor.length > 0) {
      filteredData = filteredData.filter((item) =>
        selectedColor.includes(item.color)
      );
    }

    const sortedData = sortData(filteredData, sortOption);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sortedData.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    return NextResponse.json({
      data: paginatedData,
      totalItems: sortedData.length,
      currentPage,
      totalPages: Math.ceil(sortedData.length / itemsPerPage),
    });
  } catch (error: any) {
    console.error("Error in POST /api/all-arrivals:", error);
    // Return empty data structure instead of error to prevent UI breakage
    return NextResponse.json({ 
      data: [], 
      totalItems: 0, 
      currentPage: 1, 
      totalPages: 0 
    }, { status: 200 });
  }

  // return NextResponse.json(arrivals);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("searchTerm") || "";
    const sortOption = searchParams.get("sortOption") || "1";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const selectedCategory = searchParams.get("selectedCategory")?.split(',') || [];
    const selectedTags = searchParams.get("selectedTags")?.split(',') || [];
    const selectedColor = searchParams.get("selectedColor")?.split(',') || [];
    const selectedWeight = searchParams.get("selectedWeight")?.split(',') || [];
    const MinPrice = parseFloat(searchParams.get("MinPrice") || "0");
    const MaxPrice = parseFloat(searchParams.get("MaxPrice") || "0") || Infinity;
    const rangeMin = parseFloat(searchParams.get("range.min") || "0");
    const rangeMax = parseFloat(searchParams.get("range.max") || "250");
    const range = { min: rangeMin, max: rangeMax };

    const currentPage = page;
    const itemsPerPage = limit;

    // Fetch products from backend API with pagination
    // Only fetch what we need instead of fetching 1000 products
    let backendProducts = [];
    try {
      // Calculate how many products we might need
      // For filtering, we need more than the paginated amount, but not all
      const fetchLimit = itemsPerPage > 100 ? itemsPerPage : Math.min(limit * 3, 100); 
      
      const productResponse = await productApi.getAll({
        page: 1,
        limit: fetchLimit,
        search: searchTerm || undefined,
        categoryId: selectedCategory && selectedCategory.length > 0 ? selectedCategory[0] : undefined,
      });
      
      // productApi.getAll returns either { products: [], pagination: {} } or just []
      // Handle both cases
      if (productResponse && productResponse.products) {
        backendProducts = productResponse.products;
      } else if (Array.isArray(productResponse)) {
        backendProducts = productResponse;
      } else {
        backendProducts = [];
      }
    } catch (error) {
      console.error("Error fetching products from backend (GET):", error);
      // Return empty data structure on error
      return NextResponse.json({
        data: [],
        totalItems: 0,
        currentPage: page,
        totalPages: 0,
      });
    }

    // Ensure backendProducts is an array
    if (!Array.isArray(backendProducts)) {
      console.warn("backendProducts is not an array (GET):", backendProducts);
      backendProducts = [];
    }
    
    // Map backend products to frontend format and filter out nulls
    let filteredData = backendProducts
      .map((product: any) => {
        return mapProductToFrontend(product, product.images || []);
      })
      .filter((product): product is NonNullable<any> => product != null);
    
    // Filter by search term
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredData = filteredData.filter(item =>
        (item.title && item.title.toLowerCase().includes(searchLower)) ||
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.category && item.category.toLowerCase().includes(searchLower)) ||
        (item.brand && item.brand.toLowerCase().includes(searchLower))
      );
    }
    
    // Use effective price range (from request or range object)
    const effectiveMinPrice = range?.min || 0;
    const effectiveMaxPrice = range?.max || 250;
    
    // Filter by price range
    filteredData = filteredData.filter(item =>
      item.newPrice >= effectiveMinPrice &&
      item.newPrice <= effectiveMaxPrice
    );

    if (MinPrice && MinPrice > 0) {
      filteredData = filteredData.filter((item) => item.newPrice >= MinPrice);
    }

    if (MaxPrice && MaxPrice !== Infinity) {
      filteredData = filteredData.filter((item) => item.newPrice <= MaxPrice);
    }

    // Filter by selected category
    if (selectedCategory && selectedCategory.length > 0) {
      filteredData = filteredData.filter((item) =>
        selectedCategory.some((cat: string) => 
          item.category.toLowerCase() === cat.toLowerCase()
        )
      );
    }

    if (selectedTags.length > 0) {
      filteredData = filteredData.filter((item: any) =>
        selectedTags.includes(item.tag)
      );
    }

    if (selectedWeight.length > 0) {
      filteredData = filteredData.filter((item) =>
        selectedWeight.includes(item.weight)
      );
    }

    if (selectedColor.length > 0) {
      filteredData = filteredData.filter((item) =>
        selectedColor.includes(item.color)
      );
    }

    const sortedData = sortData(filteredData, sortOption);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = sortedData.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    return NextResponse.json({
      data: paginatedData,
      totalItems: sortedData.length,
      currentPage,
      totalPages: Math.ceil(sortedData.length / itemsPerPage),
    });
  } catch (error) {
    console.error("Error in GET /api/all-arrivals:", error);
    return NextResponse.json({ 
      data: [], 
      totalItems: 0, 
      currentPage: 1, 
      totalPages: 0 
    });
  }
}

