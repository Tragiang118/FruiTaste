import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | null | undefined) {
  if (!path) return undefined;
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  // Remove leading slash if exists to avoid double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:8000${cleanPath}`;
}

export function getAvatarUrl(avatarPath: string | null | undefined, nameOrEmail?: string) {
  if (!avatarPath) {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${nameOrEmail || 'user'}`;
  }
  return getImageUrl(avatarPath);
}
