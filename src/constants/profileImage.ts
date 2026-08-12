/** 프로필 이미지 제약 — Swagger PUT /users/me/profile-image 기준 */
export const MAX_PROFILE_IMAGE_SIZE = 2 * 1024 * 1024

/** 확장자 → 허용 MIME. BE가 둘 다 검사하므로 프론트도 같은 기준으로 거른다 */
export const ALLOWED_PROFILE_IMAGE_TYPES: Record<string, string[]> = {
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  webp: ['image/webp'],
}
