import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 

export function toRfc3339(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString()
}