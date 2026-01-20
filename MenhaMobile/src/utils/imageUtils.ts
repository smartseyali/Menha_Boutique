export const resolveImageUrl = (path: string | null | undefined): string => {
    if (!path) return 'https://via.placeholder.com/300';
    if (path.startsWith('http')) return path;
    
    const baseUrl = 'https://menhaapi.smartseyali.app';
    let cleanPath = path;

    // Remove leading slash for consistency in checking
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);

    // If path already starts with assets, just join
    if (cleanPath.startsWith('assets/')) {
        return `${baseUrl}/${cleanPath}`;
    }

    // If path looks like a filename (no slashes), assume it's a product image
    if (!cleanPath.includes('/')) {
        return `${baseUrl}/assets/img/product/${cleanPath}`;
    }

    // Fallback for other paths
    return `${baseUrl}/${cleanPath}`;
};
