export type FileUploader = {
  id: number
  nickname: string
}

export type ProjectFile = {
  id: number
  fileName: string
  description: string | null
  contentType: string
  fileSize: number
  isPinned: boolean
  isFinal: boolean
  uploader: FileUploader
  createdAt: string
  updatedAt: string
}

export type ProjectFileListItem = Omit<ProjectFile, 'updatedAt'>

/** multipart/form-data의 "request" part로 전송되는 메타데이터. 파일 바이트는 "file" part로 별도 전송 */
export type ProjectFileUploadRequest = {
  fileName: string
  description?: string
  isFinal?: boolean
}

export type UpdateFileRequest = {
  fileName?: string
  description?: string
  isFinal?: boolean
}
