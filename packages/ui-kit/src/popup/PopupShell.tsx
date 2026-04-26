import type { ReactNode } from 'react';
import { useState } from 'react';
import { EmptyState, ErrorState, LoadingSkeleton } from '../states/States';
import type { AsyncState, Manga, RecentRead } from '../types';

type Tab = 'current' | 'shelf' | 'recent';

type PopupShellProps = {
  state?: AsyncState;
  shelf: Manga[];
  recent: RecentRead[];
  defaultTab?: Tab;
};

export function PopupShell({
  state = 'normal',
  shelf,
  recent,
  defaultTab = 'shelf',
}: PopupShellProps) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  return (
    <div className="uk-popup">
      <nav className="uk-popup__rail" aria-label="popup navigation">
        <RailButton title="当前页" cur={tab === 'current'} onClick={() => setTab('current')}>
          ⊕
        </RailButton>
        <RailButton title="书架" cur={tab === 'shelf'} onClick={() => setTab('shelf')}>
          ☰
        </RailButton>
        <RailButton title="最近" cur={tab === 'recent'} onClick={() => setTab('recent')}>
          ◷
        </RailButton>
        <div style={{ flex: 1 }} />
        <RailButton title="设置" cur={false} onClick={() => undefined}>
          ⚙
        </RailButton>
      </nav>
      <div className="uk-popup__main">
        {tab === 'shelf' && <PopupShelfView state={state} items={shelf} />}
        {tab === 'recent' && <PopupRecentView items={recent} />}
        {tab === 'current' && <PopupCurrentView />}
      </div>
    </div>
  );
}

function RailButton({
  cur,
  onClick,
  title,
  children,
}: {
  cur: boolean;
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`uk-popup__railbtn ${cur ? 'uk-popup__railbtn--cur' : ''}`}
    >
      {children}
    </button>
  );
}

function PopupShelfView({ state, items }: { state: AsyncState; items: Manga[] }) {
  if (state === 'loading') {
    return (
      <>
        <SearchBar placeholder="搜索…" />
        <LoadingSkeleton rows={6} />
      </>
    );
  }
  if (state === 'error') {
    return (
      <ErrorState
        cta={
          <button type="button" className="uk-btn">
            重试
          </button>
        }
      />
    );
  }
  if (state === 'empty' || items.length === 0) {
    return (
      <EmptyState
        title="书架是空的"
        desc="装上 manga-tracker 浏览器扩展，去你常看的漫画站翻几章，作品会自动出现在这里。"
        cta={
          <button type="button" className="uk-btn uk-btn--primary">
            添加扩展
          </button>
        }
      />
    );
  }
  return (
    <>
      <SearchBar placeholder={`搜索 ${items.length} 部作品…`} />
      <div className="uk-popup__list">
        {items.map((m) => (
          <ShelfRow key={m.id} m={m} />
        ))}
      </div>
      <div className="uk-popup__foot">
        <span>{items.length} 部 · 4 个源</span>
        <span>本地 · v0.1</span>
      </div>
    </>
  );
}

function PopupRecentView({ items }: { items: RecentRead[] }) {
  return (
    <>
      <SearchBar placeholder="搜索最近…" />
      <div className="uk-popup__list">
        {items.map((r) => (
          <div key={`${r.id}-${r.whenLabel}`} className="uk-popup__row">
            <div className="uk-cover cover-sm">{r.initial}</div>
            <div className="uk-popup__row__info">
              <div className="uk-popup__row__title">
                {r.title}{' '}
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--ink-text-mute)',
                    fontFamily: 'var(--ink-font-mono)',
                  }}
                >
                  · ch.{r.chapter}
                </span>
              </div>
              <div className="uk-popup__row__sub">
                {r.whenLabel} · {r.source}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="uk-popup__foot">
        <span>最近 7 天</span>
        <span>共 {items.length} 次阅读</span>
      </div>
    </>
  );
}

function PopupCurrentView() {
  return (
    <EmptyState
      title="当前不在已识别的漫画站"
      desc="打开任意已订阅的源对应的漫画站，Sync Bar 会自动出现在页面右下。"
    />
  );
}

function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <div className="uk-popup__search">
      <input type="search" placeholder={placeholder} />
    </div>
  );
}

function ShelfRow({ m }: { m: Manga }) {
  return (
    <div className="uk-popup__row">
      <div className="uk-cover cover-sm">{m.initial}</div>
      <div className="uk-popup__row__info">
        <div className="uk-popup__row__title">{m.title}</div>
        <div className="uk-popup__row__sub">
          ch.{m.chapter}/{m.total} · {m.updatedLabel}
        </div>
      </div>
      <span className="uk-pill">{m.source}</span>
      {m.unread > 0 && (
        <span className="uk-pill uk-pill--accent" style={{ marginLeft: 4 }}>
          +{m.unread}
        </span>
      )}
    </div>
  );
}
