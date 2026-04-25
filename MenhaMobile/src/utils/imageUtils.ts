export const resolveImageUrl = (path: string | null | undefined): string => {
    if (!path) return 'https://via.placeholder.com/300';
    if (path.startsWith('http')) return path;
    if (path.startsWith('data:')) return path;
    
    // For legacy images or relative paths, we can't easily resolve them without the old server
    // but we'll return the path as is if it's already a component
    return path;
};

