import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | null | undefined) {
  if (!path) return undefined;
  
  let cleanPath = path;
  
  // If the path is a full URL, let's see if it's one of our backend/frontend URLs
  if (path.startsWith('http')) {
    try {
      const urlObj = new URL(path);
      // If the URL is our api domain or localhost, extract the pathname
      if (urlObj.hostname === 'api.fruitaste.page' || urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
        cleanPath = urlObj.pathname + urlObj.search + urlObj.hash;
      } else {
        return path; // Keep external URLs as-is (e.g. unsplash, dicebear)
      }
    } catch (e) {
      return path;
    }
  } else if (path.startsWith('data:')) {
    return path;
  }

  // Remove leading slash if exists to avoid double slashes
  const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

  const vpsDomain = 'https://api.fruitaste.page';

  // Check if we are running in the browser
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Local development hostnames - load uploads from VPS domain so database images always show
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
      return `${vpsDomain}${finalPath}`;
    }
    // Production domain mapping
    if (hostname === 'fruitaste.page' || hostname === 'www.fruitaste.page') {
      return `${vpsDomain}${finalPath}`;
    }
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}${finalPath}`;
  }
  return `${vpsDomain}${finalPath}`;
}

export function getAvatarUrl(avatarPath: string | null | undefined, nameOrEmail?: string) {
  if (!avatarPath) {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${nameOrEmail || 'user'}`;
  }
  return getImageUrl(avatarPath);
}
