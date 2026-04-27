import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// cn = combine class names + dedupe Tailwind conflicts
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// Debounce simples pra inputs (usado no builder pra nao pingar /check-compatibility a cada add)
export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let t: ReturnType<typeof setTimeout> | null = null
  return (...args) => {
    if (t) clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}
