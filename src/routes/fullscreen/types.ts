import type { ReactNode } from 'react'

export type FullscreenRoute =
  | { path: string; render: () => ReactNode }
  | { match: string; render: (params: Record<string, string>) => ReactNode }
