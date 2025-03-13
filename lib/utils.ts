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

// Format number with decimal places
export function formatNumberWithDecimal(num: number) {
  const [int, decimal] = num.toString().split('.');
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`
}

// Format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function formatError(error: any) {
  if (error.name === 'ZodError') {
    // Handle zod error
    const fieldErrors = Object.keys(error.errors).map((field) => error.errors[field].message);
    
    return fieldErrors.join('. ');
  } else if (error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002') {
    // Handle prisma errors
    const field = error.meta?.target ? error.meta.target[0] : 'Field';

    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    return typeof error.message === 'string' ? error.message : JSON.stringify(error.message);
  }
}