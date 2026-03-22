/**
 * Ensures a movie poster URL is complete with the TMDB base URL
 * @param url - The poster URL (can be relative or absolute)
 * @returns Complete HTTPS URL or null if no URL provided
 */
export const ensureCompleteImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // If the URL already starts with http/https, it's complete
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path or just the path component from TMDB
  return `https://image.tmdb.org/t/p/w500${url}`;
};
