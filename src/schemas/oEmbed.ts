import { z } from 'zod'

export const OEmbedSchema = z.object({
  title: z.string(),
  thumbnail_url: z.string().url(),
  author_name: z.string().optional(),
})

export type OEmbedData = z.infer<typeof OEmbedSchema>
