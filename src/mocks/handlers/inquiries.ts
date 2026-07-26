import { http, HttpResponse } from 'msw'
import { paths } from '../../api/paths'
import type { CreateInquiryRequest } from '../../types/inquiry'
import { allocId, db, requireUser } from '../db'
import { badRequest, unauthorized } from '../errors'
import { created } from '../response'

function safeUser() {
  try {
    return requireUser()
  } catch {
    return null
  }
}

export const inquiryHandlers = [
  http.post(paths.inquiries.root, async ({ request }) => {
    if (!safeUser()) return unauthorized()
    const body = (await request.json()) as CreateInquiryRequest
    if (!body.title?.trim() || !body.content?.trim()) return badRequest()

    const inquiry = {
      id: allocId(),
      title: body.title,
      content: body.content,
      attachmentFileNames: body.attachmentFileNames ?? [],
      createdAt: new Date().toISOString(),
    }
    db.inquiries.unshift(inquiry)
    return HttpResponse.json(created(inquiry), { status: 201 })
  }),
]
