/** Blob 응답을 실제 파일 다운로드로 트리거 (BE가 presigned URL 대신 바이너리를 직접 응답) */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // click()이 트리거하는 다운로드 시작이 일부 브라우저(Firefox 등)에서 비동기라
  // 즉시 revoke하면 대용량 파일 다운로드가 취소/손상될 수 있어 한 틱 미룬다.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
