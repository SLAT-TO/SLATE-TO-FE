import type { Project } from '../types/project'

export const PROJECT_LENGTH_TYPE_LABEL: Record<string, string> = {
  LONG_FORM: '장편',
  SHORT_FORM: '단편',
}

export const PROJECT_TYPE_LABEL: Record<string, string> = {
  FILM: '영화',
  DOCUMENTARY: '다큐/시사/교양',
  DRAMA: '드라마',
  MUSIC_VIDEO: '뮤직비디오',
  ENTERTAINMENT: '예능/오락',
  COMMERCIAL: '광고/홍보영상',
}

export function projectMetaTags(project: Project): string[] {
  const tags: string[] = []
  if (project.customTypeName) tags.push(project.customTypeName)
  else if (project.type) tags.push(PROJECT_TYPE_LABEL[project.type] ?? project.type)
  if (project.lengthType) {
    tags.push(PROJECT_LENGTH_TYPE_LABEL[project.lengthType] ?? project.lengthType)
  }
  return tags
}
