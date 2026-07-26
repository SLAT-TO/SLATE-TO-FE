/** FE mock 전용 — BE 문의하기 API 미구현 */
export type CreateInquiryRequest = {
  title: string
  content: string
  attachmentFileNames?: string[]
}

/** FE mock 전용 — BE 문의하기 API 미구현 */
export type Inquiry = {
  id: number
  title: string
  content: string
  attachmentFileNames: string[]
  createdAt: string
}
