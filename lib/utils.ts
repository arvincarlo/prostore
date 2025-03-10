import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Convert a prisma object into a regular JS Object
// T - generic type, a placeholder for any type of the function might accept when it's called

export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}