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

export function App() {
  const [state, setState] = useState<AsyncState>(getInitialState());
  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (state === 'normal') url.searchParams.delete('state');
    else url.searchParams.set('state', state);
    window.history.replaceState(null, '', url);
  }, [state]);

  const filteredShelf = state === 'empty' ? [] : mockMangas;

  return (
    <div className="uk-root">
      <div className="app-toolbar">
        <span className="brand">
          manga<span className="dot">·</span>tracker
        </span>
        <span className="tag">UI Preview · Inkmono (Candidate B)</span>
        <span className="spacer" />
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

      <section className="app-section">
        <h2>
          Sync Bar <small>注入到漫画站页面（Shadow DOM 隔离）</small>
        </h2>
        <p className="desc">
          PC
          浏览器扩展的主操作入口。注入到第三方漫画站页面右下角，状态化按钮，不抢戏不污染原站样式。Inkmono
          为 Sync Bar 加了极轻的颗粒纹理（5% opacity）。
        </p>

        <div className="app-row" style={{ flexDirection: 'column', gap: 14 }}>
          <div>
            <span className="app-label">折叠态（默认）· 状态点指示</span>
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
              <div className="syncbar-pos">
                <SyncBarFolded status="in-shelf" />
              </div>
            </div>
          </div>

          <div>
            <span className="app-label">展开态 · 未在书架</span>
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
              <div className="syncbar-pos">
                <SyncBarExpanded
                  manga={{ title: '一拳超人', initial: '一', chapter: 182 }}
                  inShelf={false}
                />
              </div>
            </div>
          </div>

          <div>
            <span className="app-label">展开态 · 已在书架（章节翻页时）+ 进度更新 toast</span>
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
              <div className="syncbar-pos">
                <SyncBarExpanded
                  manga={{ title: '海贼王', initial: '海', chapter: 1108 }}
                  inShelf={true}
                  toast="已记录"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="app-section">
        <h2>
          Popup <small>360 × 500 · 工具栏图标弹出</small>
        </h2>
        <p className="desc">
          辅助操作面：跨站书架快速浏览、最近阅读、跳设置。Sync Bar 才是主操作入口。下面三个 Popup
          实例都用同一个 PopupShell 组件，仅 defaultTab 不同。
        </p>

        <div className="app-row">
          <div>
            <span className="app-label">「书架」Tab</span>
            <PopupShell
              shelf={filteredShelf}
              recent={mockRecent}
              state={state}
              defaultTab="shelf"
            />
          </div>
          <div>
            <span className="app-label">「最近阅读」Tab</span>
            <PopupShell
              shelf={filteredShelf}
              recent={mockRecent}
              state="normal"
              defaultTab="recent"
            />
          </div>
          <div>
            <span className="app-label">「当前页」Tab（未识别）</span>
            <PopupShell
              shelf={filteredShelf}
              recent={mockRecent}
              state="normal"
              defaultTab="current"
            />
          </div>
        </div>
      </section>

      <section className="app-section">
        <h2>
          Options <small>chrome://extensions 全屏页</small>
        </h2>
        <p className="desc">
          书架管理 + 源订阅 + 数据导入导出。这是 legado 漫画书源 import 的入口。三种 wire format 用
          pill 区分。
        </p>

        <OptionsPage shelf={mockMangas} subscriptions={mockSubscriptions} />
      </section>

      <section className="app-section">
        <h2>
          Mobile <small>Android · Capacitor · 4 屏并排走查</small>
        </h2>
        <p className="desc">
          书架（首页）/ 详情页 / WebView 阅读器外壳 / 设置。点「继续阅读」WebView
          跳到源站章节，注入脚本继续追踪进度。
        </p>

        <div className="app-row">
          <BookshelfPage shelf={filteredShelf} state={state} />
          <DetailPage manga={currentManga} />
          <ReaderShellPage manga={currentManga} />
          <SettingsPage />
        </div>
      </section>

      <footer className="app-footer">
        <div>
          本 preview 直接 import <code>@manga/ui-kit</code> 的真实 React 组件。扩展和移动端 app
          后续也将复用同一份组件。视觉语言：<strong>Inkmono · Candidate B</strong>。
        </div>
        <div style={{ marginTop: 8 }}>
          所有数据为虚构 mock，源标识使用 <code>example-1 ~ example-4</code>{' '}
          占位，不指向任何真实漫画站。
        </div>
        <div style={{ marginTop: 8 }}>
          <a href="../">← 返回设计文档</a> ·{' '}
          <a href="https://github.com/YeomanYe/manga-tracker">GitHub</a>
        </div>
      </footer>
    </div>
  );
}

function getInitialState(): AsyncState {
  if (typeof window === 'undefined') return 'normal';
  const s = new URL(window.location.href).searchParams.get('state');
  return STATES.includes(s as AsyncState) ? (s as AsyncState) : 'normal';
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('theme');
  return THEMES.includes(saved as Theme) ? (saved as Theme) : 'dark';
}
