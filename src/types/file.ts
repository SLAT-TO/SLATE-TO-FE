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

export type UploadUrlRequest = {
  fileName: string
  contentType: string
  fileSize: number
}

export type UploadUrlResult = {
  uploadUrl: string
  storageKey: string
  expiresAt: string
  requiredHeaders: Record<string, string>
}

export type RegisterFileRequest = {
  fileName: string
  description?: string
  storageKey: string
  contentType: string
  fileSize: number
  isPinned?: boolean
}

export type UpdateFileRequest = {
  fileName?: string
  description?: string
  isPinned?: boolean
  isFinal?: boolean
}

export type DownloadUrlResult = {
  downloadUrl: string
  expiresAt: string
}
