export function getOEmbedEndpoint(url: string): string | null {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  }
  if (url.includes('vimeo.com')) {
    return `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
  }
  return null;
}
