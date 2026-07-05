import { useEffect, useState, type ReactNode } from 'react';

import { fetchOEmbed } from '../api/oEmbed';
import { type OEmbedData } from '../schemas/oEmbed';
import { getOEmbedEndpoint } from '../utils/oEmbed';

type VideoPreviewProps = {
  videoUrl?: string;
};

function PreviewBox({ children }: { children: ReactNode }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl bg-neutral-4">
      {children}
    </div>
  );
}

export default function VideoPreview({ videoUrl }: VideoPreviewProps) {
  const [data, setData] = useState<OEmbedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!videoUrl) return;
    if (!getOEmbedEndpoint(videoUrl)) return;

    const controller = new AbortController();

    const load = async () => {
      setData(null);
      setLoading(true);
      setError(false);
      try {
        const result = await fetchOEmbed(videoUrl, controller.signal);
        setData(result);
        setLoading(false);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setData(null);
        setError(true);
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [videoUrl]);

  if (!videoUrl || !getOEmbedEndpoint(videoUrl)) {
    return (
      <PreviewBox>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-6">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-caption-lg text-neutral-6">링크를 입력하면 미리보기가 표시됩니다.</p>
      </PreviewBox>
    );
  }

  if (loading) {
    return (
      <PreviewBox>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-3 border-t-primary" />
      </PreviewBox>
    );
  }

  if (error || !data) {
    return (
      <PreviewBox>
        <p className="text-caption-lg text-neutral-6">미리보기를 불러올 수 없어요</p>
      </PreviewBox>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="aspect-video w-full overflow-hidden rounded-xl">
        <img src={data.thumbnail_url} alt={data.title} className="h-full w-full object-cover" />
      </div>
      <p className="line-clamp-2 text-body-sm font-semibold text-neutral-10">{data.title}</p>
      {data.author_name && (
        <p className="text-caption-lg text-neutral-5">{data.author_name}</p>
      )}
    </div>
  );
}
