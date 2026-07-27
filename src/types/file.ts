export type FileUploader = {
  id: number
  nickname: string
}

export type ProjectFile = {
  id: number
  projectId: number
  fileName: string
  description: string | null
  storageKey: string
  contentType: string
  fileSize: number
  isPinned: boolean
  isFinal: boolean
  uploaderId: number
  createdAt: string
  updatedAt: string
}

export type ProjectFileListItem = {
  id: number
  fileName: string
  description: string | null
  contentType: string
  fileSize: number
  isPinned: boolean
  isFinal: boolean
  uploader: FileUploader
  createdAt: string
}

/** multipart/form-data의 "request" part로 전송되는 메타데이터. 파일 바이트는 "file" part로 별도 전송 */
export type ProjectFileUploadRequest = {
  fileName: string
  description?: string
  isFinal?: boolean
}

export type UpdateFileRequest = {
  fileName?: string
  description?: string
  isPinned?: boolean
  isFinal?: boolean
}
