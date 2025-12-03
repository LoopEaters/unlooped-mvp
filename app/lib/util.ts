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

// ==================== Timeline Utilities ====================

/**
 * 타임라인 시간 범위 계산
 */
export function getTimeRange(timestamps: string[]) {
  if (timestamps.length === 0) {
    const now = new Date();
    return {
      start: now.getTime() - 24 * 60 * 60 * 1000, // 24시간 전
      end: now.getTime(),
    };
  }

  const times = timestamps.map((ts) => new Date(ts).getTime());
  const start = Math.min(...times);
  const end = Math.max(...times);

  // 시작/끝에 여백 추가 (전체 범위의 5%)
  const padding = (end - start) * 0.05;

  return {
    start: start - padding,
    end: end + padding,
  };
}

/**
 * Timestamp를 픽셀 Y좌표로 변환
 * @param timestamp - ISO 8601 timestamp string
 * @param timeRange - 시간 범위 { start, end } (Unix timestamp)
 * @param canvasHeight - 캔버스 전체 높이
 * @param topPadding - 상단 여백 (날짜 레이블 등)
 * @returns Y 좌표 (픽셀)
 */
export function timestampToY(
  timestamp: string,
  timeRange: { start: number; end: number },
  canvasHeight: number,
  topPadding = 60
): number {
  const time = new Date(timestamp).getTime();
  const totalTime = timeRange.end - timeRange.start;
  const ratio = (time - timeRange.start) / totalTime;

  const availableHeight = canvasHeight - topPadding - 40; // 하단 여백 40px
  return topPadding + ratio * availableHeight;
}

/**
 * Y좌표를 timestamp로 역변환
 */
export function yToTimestamp(
  y: number,
  timeRange: { start: number; end: number },
  canvasHeight: number,
  topPadding = 60
): number {
  const availableHeight = canvasHeight - topPadding - 40;
  const ratio = (y - topPadding) / availableHeight;
  return timeRange.start + ratio * (timeRange.end - timeRange.start);
}

/**
 * 시간 간격에 따라 적절한 날짜 포맷 반환
 */
export function formatTimelineDate(timestamp: number, totalRange: number): string {
  const date = new Date(timestamp);

  // 1일 미만: 시간:분
  if (totalRange < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }

  // 30일 미만: 월/일 시간
  if (totalRange < 30 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  }

  // 그 외: 년/월/일
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

