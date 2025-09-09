/**
 * Resolves image paths for proper display in Next.js
 * Handles local assets, CDN URLs, and provides fallback
 */
export function resolveImagePath(imagePath?: string): string {
  if (!imagePath) {
    return '/api/placeholder/300/400'
  }

  // If it's already a full URL (http/https), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // If it starts with '/', it's already a public path
  if (imagePath.startsWith('/')) {
    return imagePath
  }

  // If it starts with 'assets/', convert to public path
  if (imagePath.startsWith('assets/')) {
    return `/${imagePath}`
  }

  // Default: assume it's a relative path and prepend '/'
  return `/${imagePath}`
}

/**
 * Creates a fallback image URL for broken images
 */
export function getFallbackImage(): string {
  return '/api/placeholder/300/400'
}