import type { Manga } from '../types';

export function SyncBarFolded({
  status = 'in-shelf',
}: { status?: 'in-shelf' | 'detected' | 'error' }) {
  const colorMap = {
    'in-shelf': 'var(--ink-good)',
    detected: 'var(--ink-accent)',
    error: 'var(--ink-bad)',
  };
  return (
    <div className="uk-syncbar-folded ink-grain" title="点击展开">
      <div
        className="uk-syncbar-folded__dot"
        style={{ background: colorMap[status], boxShadow: `0 0 8px ${colorMap[status]}` }}
      />
    </div>
  );
}

type ExpandedProps = {
  manga: Pick<Manga, 'title' | 'initial' | 'chapter'>;
  inShelf: boolean;
  toast?: string | null;
  onAdd?: () => void;
};

export function SyncBarExpanded({ manga, inShelf, toast, onAdd }: ExpandedProps) {
  return (
    <div className="uk-syncbar-expanded ink-grain">
      <div className="uk-cover uk-syncbar-expanded__cover">{manga.initial}</div>
      <div>
        <div className="uk-syncbar-expanded__title">{manga.title}</div>
        <div className="uk-syncbar-expanded__sub">ch.{manga.chapter}</div>
      </div>
      <div style={{ flex: 1 }} />
      {inShelf ? (
        <button type="button" className="uk-btn uk-btn--in">
          ✓ 在书架
        </button>
      ) : (
        <button type="button" className="uk-btn uk-btn--accent" onClick={onAdd}>
          + 加入书架
        </button>
      )}
      {toast && <span className="uk-syncbar-toast">{toast}</span>}
    </div>
  );
}
