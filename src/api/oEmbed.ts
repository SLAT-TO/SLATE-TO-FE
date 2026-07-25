import { OEmbedSchema, type OEmbedData } from '../schemas/oEmbed'
import { getOEmbedEndpoint } from '../utils/oEmbed'

export async function fetchOEmbed(videoUrl: string, signal?: AbortSignal): Promise<OEmbedData> {
  const endpoint = getOEmbedEndpoint(videoUrl)
  if (!endpoint) throw new Error('Unsupported URL')

  const res = await fetch(endpoint, { signal })
  if (!res.ok) throw new Error('Failed to fetch oEmbed')

  const json = await res.json()
  return OEmbedSchema.parse(json)
}
