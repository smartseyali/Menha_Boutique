const fetcher = async (url: string, postData?: any) => {
  try {
    // If postData is provided and is an object, use POST
    // Otherwise, use GET with query params
    if (postData && typeof postData === 'object' && Object.keys(postData).length > 0) {
      // Use POST for complex data
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        console.error(`Fetcher POST error for ${url}:`, errorMessage);
        // For 400/404 errors, return empty data structure instead of throwing
        // This prevents breaking the UI when backend validation fails
        if (response.status === 400 || response.status === 404) {
          // Return structure based on endpoint type
          if (url.includes('/all-arrivals')) {
            return { data: [], totalItems: 0, currentPage: 1, totalPages: 0 };
          }
          return [];
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } else {
      // Use GET - append query params if postData is provided
      let requestUrl = url;
      if (postData && typeof postData === 'object') {
        const params = new URLSearchParams();
        Object.keys(postData).forEach(key => {
          if (postData[key] !== undefined && postData[key] !== null) {
            params.append(key, postData[key].toString());
          }
        });
        if (params.toString()) {
          requestUrl = `${url}?${params.toString()}`;
        }
      }
      
      const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        console.error(`Fetcher GET error for ${url}:`, errorMessage);
        // For 400/404 errors, return empty data structure instead of throwing
        // This prevents breaking the UI when backend validation fails or resource not found
        if (response.status === 400 || response.status === 404) {
          console.warn(`Returning empty data for ${url} due to ${response.status} error`);
          // Return structure based on endpoint type
          if (url.includes('/all-arrivals')) {
            return { data: [], totalItems: 0, currentPage: 1, totalPages: 0 };
          }
          return [];
        }
        throw new Error(errorMessage);
      }
      
      return await response.json();
    }
  } catch (error: any) {
    console.error(`Fetcher error for ${url}:`, error);
    // For network errors or other issues, return appropriate structure to prevent UI breakage
    // Only throw if it's a critical error (5xx)
    if (error.message && error.message.includes('status: 5')) {
      throw error;
    }
    // Return appropriate structure based on endpoint type
    if (url.includes('/all-arrivals')) {
      return { data: [], totalItems: 0, currentPage: 1, totalPages: 0 };
    }
    // Return empty array for other endpoints
    return [];
  }
};

export default fetcher;
