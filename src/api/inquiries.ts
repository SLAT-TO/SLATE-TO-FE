import { request } from './client'
import { paths } from './paths'
import type { CreateInquiryRequest, Inquiry } from '../types/inquiry'

export async function createInquiry(body: CreateInquiryRequest): Promise<Inquiry> {
  return request<Inquiry>({ method: 'POST', url: paths.inquiries.root, data: body })
}
