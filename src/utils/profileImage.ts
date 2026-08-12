import { ALLOWED_PROFILE_IMAGE_TYPES, MAX_PROFILE_IMAGE_SIZE } from '../constants/profileImage'

export function validateProfileImage(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const allowedMimes = ALLOWED_PROFILE_IMAGE_TYPES[ext]

  if (!allowedMimes) return '지원하지 않는 형식입니다. (jpg, png, webp)'
  if (!allowedMimes.includes(file.type)) return '파일 형식이 확장자와 일치하지 않습니다.'
  if (file.size > MAX_PROFILE_IMAGE_SIZE) return '이미지는 2MB 이하만 업로드할 수 있습니다.'

  return null
}
