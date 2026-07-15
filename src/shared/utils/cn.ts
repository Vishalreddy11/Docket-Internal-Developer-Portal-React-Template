// Classname helper — merges Tailwind classes safely, dedupes on conflict.
// Copy of the shadcn/ui convention.

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
