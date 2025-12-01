import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind CSS 클래스명을 조건부로 병합하는 유틸리티 함수
 * clsx와 tailwind-merge를 결합하여 중복된 클래스를 제거하고 최적화합니다.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isProduction() {
    return process.env.VERCEL_ENV === 'production';
}

