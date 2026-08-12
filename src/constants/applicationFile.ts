export const MAX_APPLICATION_FILES = 10
export const MAX_APPLICATION_FILE_SIZE = 100 * 1024 * 1024

/**
 * 지원 첨부 파일 제약 — Swagger POST /recruitments/{id}/application-files 기준
 * MAX_APPLICATION_FILES: BE 스펙상 상한. 현재 화면은 디자인에 맞춰 1개만 받으므로
 * 아직 사용하지 않으나, 다중 첨부 전환 시 기준값으로 쓴다.
 */
export const ALLOWED_APPLICATION_FILE_TYPES: Record<string, string[]> = {
  pdf: ['application/pdf'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  webp: ['image/webp'],
  zip: ['application/zip', 'application/x-zip-compressed'],
  mp4: ['video/mp4'],
}
