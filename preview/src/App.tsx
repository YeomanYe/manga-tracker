import {
  type AsyncState,
  BookshelfPage,
  DetailPage,
  OptionsPage,
  PopupShell,
  ReaderShellPage,
  SettingsPage,
  SyncBarExpanded,
  SyncBarFolded,
  type Theme,
  currentManga,
  mockMangas,
  mockRecent,
  mockSubscriptions,
} from '@manga/ui-kit';
import { useEffect, useState } from 'react';

const STATES: AsyncState[] = ['normal', 'empty', 'loading', 'error'];
const THEMES: Theme[] = ['dark', 'light'];

type Focus = 'all' | 'sync-bar' | 'popup' | 'options' | 'mobile';
const FOCUSES: { id: Focus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'sync-bar', label: 'SyncBar' },
  { id: 'popup', label: 'Popup' },
  { id: 'options', label: 'Options' },
  { id: 'mobile', label: 'Mobile' },
];

export function App() {
  const [state, setState] = useState<AsyncState>(getInitialQuery('state', STATES) ?? 'normal');
  const [focus, setFocus] = useState<Focus>(
    getInitialQuery(
      'focus',
      FOCUSES.map((f) => f.id),
    ) ?? 'all',
  );
  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    syncQuery({ state: state === 'normal' ? null : state, focus: focus === 'all' ? null : focus });
  }, [state, focus]);

  const filteredShelf = state === 'empty' ? [] : mockMangas;
  const show = (id: Focus) => focus === 'all' || focus === id;

  return (
    <div className="uk-root">
      <div className="app-toolbar">
        <span className="brand">
          manga<span className="dot">·</span>tracker
        </span>
        <span className="tag">Dev Preview · @manga/ui-kit · Inkmono</span>
        <span className="spacer" />
        <span className="tag">Focus:</span>
        <span className="seg">
          {FOCUSES.map((f) => (
            <button
              key={f.id}
              type="button"
              className={f.id === focus ? 'cur' : ''}
              onClick={() => setFocus(f.id)}
            >
              {f.label}
            </button>
          ))}
        </span>
        <span className="tag">State:</span>
        <span className="seg">
          {STATES.map((s) => (
            <button
              key={s}
              type="button"
              className={s === state ? 'cur' : ''}
              onClick={() => setState(s)}
            >
              {s}
            </button>
          ))}
        </span>
        <span className="seg">
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              className={t === theme ? 'cur' : ''}
              onClick={() => setTheme(t)}
            >
              {t}
            </button>
          ))}
        </span>
        <a href="../">← Design Doc</a>
      </div>

      <div className="app-banner">
        <strong>Dev preview</strong> — 在研发期 isolated debug <code>@manga/ui-kit</code> 组件。
        以后 <code>apps/extension</code>（Plasmo）和 <code>apps/mobile</code>（Capacitor）会 import
        同一份组件，preview 改一处即三端见效。 URL query 可定位：
        <code>?focus=sync-bar&amp;state=empty</code>
      </div>

      {show('sync-bar') && (
        <section className="app-section">
          <h2>
            SyncBar <small>注入到漫画站页面（Shadow DOM 隔离）</small>
          </h2>
          <p className="desc">
            PC 浏览器扩展的主操作入口。状态化按钮，不抢戏不污染原站样式。 Inkmono 为 Sync Bar 加了
            5% opacity 颗粒纹理。
          </p>

          <div
            className="app-row"
            style={{ flexDirection: 'column', alignItems: 'stretch', gap: 14 }}
          >
            <SyncBarDemo
              label="折叠态（默认）· 状态点指示"
              child={<SyncBarFolded status="in-shelf" />}
            />
            <SyncBarDemo
              label="展开态 · 未在书架"
              child={
                <SyncBarExpanded
                  manga={{ title: '一拳超人', initial: '一', chapter: 182 }}
                  inShelf={false}
                />
              }
            />
            <SyncBarDemo
              label="展开态 · 已在书架（章节翻页时）+ 进度更新 toast"
              child={
                <SyncBarExpanded
                  manga={{ title: '海贼王', initial: '海', chapter: 1108 }}
                  inShelf={true}
                  toast="已记录"
                />
              }
            />
          </div>
        </section>
      )}

      {show('popup') && (
        <section className="app-section">
          <h2>
            Popup <small>360 × 500 · 工具栏图标弹出</small>
          </h2>
          <p className="desc">
            辅助操作面：跨站书架快速浏览、最近阅读、跳设置。下面三个 PopupShell 实例仅 defaultTab
            不同。
          </p>

          <div className="app-row">
            <Labeled label="「书架」Tab">
              <PopupShell
                shelf={filteredShelf}
                recent={mockRecent}
                state={state}
                defaultTab="shelf"
              />
            </Labeled>
            <Labeled label="「最近阅读」Tab">
              <PopupShell
                shelf={filteredShelf}
                recent={mockRecent}
                state="normal"
                defaultTab="recent"
              />
            </Labeled>
            <Labeled label="「当前页」Tab（未识别）">
              <PopupShell
                shelf={filteredShelf}
                recent={mockRecent}
                state="normal"
                defaultTab="current"
              />
            </Labeled>
          </div>
        </section>
      )}

      {show('options') && (
        <section className="app-section">
          <h2>
            Options <small>chrome://extensions 全屏页</small>
          </h2>
          <p className="desc">
            书架管理 + 源订阅 + 数据导入导出。三种 wire format（legado-v3 / manga-tracker-v1 /
            mihon-port）用 pill 区分。
          </p>

          <OptionsPage shelf={mockMangas} subscriptions={mockSubscriptions} />
        </section>
      )}

      {show('mobile') && (
        <section className="app-section">
          <h2>
            Mobile <small>Android · Capacitor · 4 屏并排走查</small>
          </h2>
          <p className="desc">书架（首页）/ 详情页 / WebView 阅读器外壳 / 设置。</p>

          <div className="app-row">
            <BookshelfPage shelf={filteredShelf} state={state} />
            <DetailPage manga={currentManga} />
            <ReaderShellPage manga={currentManga} />
            <SettingsPage />
          </div>
        </section>
      )}

      <footer className="app-footer">
        <div>
          所有数据为虚构 mock。源标识 <code>example-1 ~ example-4</code> 占位，不指向真实漫画站。
        </div>
        <div style={{ marginTop: 8 }}>
          <a href="../">← Design Doc</a> ·{' '}
          <a href="https://github.com/YeomanYe/manga-tracker">GitHub</a>
        </div>
      </footer>
    </div>
  );
}

function SyncBarDemo({ label, child }: { label: string; child: React.ReactNode }) {
  return (
    <div>
      <span className="app-label">{label}</span>
      <div className="fakesite">
        <div className="fake-content">
          <div className="fake-cover" />
          <div className="fake-text">
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
        <div className="syncbar-pos">{child}</div>
      </div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="app-label">{label}</span>
      {children}
    </div>
  );
}

function getInitialQuery<T extends string>(key: string, allow: readonly T[]): T | null {
  if (typeof window === 'undefined') return null;
  const raw = new URL(window.location.href).searchParams.get(key);
  return allow.includes(raw as T) ? (raw as T) : null;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('theme');
  return THEMES.includes(saved as Theme) ? (saved as Theme) : 'dark';
}

function syncQuery(updates: Record<string, string | null>) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(updates)) {
    if (v === null) url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  window.history.replaceState(null, '', url);
}
