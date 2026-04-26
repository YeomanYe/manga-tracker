export type Manga = {
  id: string;
  title: string;
  author?: string;
  initial: string;
  chapter: number;
  total: number;
  source: string;
  updatedLabel: string;
  unread: number;
  finished?: boolean;
};

export type RecentRead = {
  id: string;
  title: string;
  initial: string;
  chapter: number;
  source: string;
  whenLabel: string;
};

export type SourceSubscription = {
  format: 'legado-v3' | 'manga-tracker-v1' | 'mihon-port';
  url: string;
  siteCount: number;
  enabled: boolean;
};

export type AsyncState = 'normal' | 'empty' | 'loading' | 'error';
export type Theme = 'dark' | 'light';
