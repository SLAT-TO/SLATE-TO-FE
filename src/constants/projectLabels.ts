export const PROJECT_LENGTH_TYPE_LABEL: Record<string, string> = {
  LONG_FORM: '장편',
  SHORT_FORM: '단편',
}

/** BE CategoryName 기준 */
export const PROJECT_TYPE_LABEL: Record<string, string> = {
  YOUTUBE_CONTENT: '유튜브 콘텐츠',
  AD_BRAND: '광고/브랜드 영상',
  MUSIC_VIDEO: '뮤직비디오',
  WEDDING_EVENT: '웨딩/이벤트 영상',
  DOCUMENTARY: '다큐멘터리',
  FILM_DRAMA: '영화/드라마',
  CORPORATE_PROMO: '기업 홍보 영상',
  ETC: '기타',
}

export function projectMetaTags(project: { type?: string | null; lengthType?: string | null }): string[] {
  const tags: string[] = []
  if (project.type) tags.push(PROJECT_TYPE_LABEL[project.type] ?? project.type)
  if (project.lengthType) {
    tags.push(PROJECT_LENGTH_TYPE_LABEL[project.lengthType] ?? project.lengthType)
  }
  return tags
}
