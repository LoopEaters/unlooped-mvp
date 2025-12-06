/**
 * Import 기능 관련 타입 정의
 */

export interface ParsedMemo {
  date: string          // ISO 8601 (YYYY-MM-DD)
  content: string       // 메모 내용 (@ 포함)
  entities: string[]    // Entity 이름 배열
}

export interface BulkImportParseResult {
  memos: ParsedMemo[]
  stats: {
    totalMemos: number
    totalEntities: number
    uniqueEntities: number
    dateRange: [string, string]  // [최소날짜, 최대날짜]
  }
}

export interface ImportExecuteRequest {
  memos: ParsedMemo[]
  userId: string
}

export interface ImportExecuteResult {
  success: boolean
  stats: {
    memosCreated: number
    entitiesCreated: number
    entitiesReused: number
    errors: number
  }
}
