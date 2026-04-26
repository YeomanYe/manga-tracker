import type { Manga, SourceRule } from '@manga/types';
import { useState } from 'react';
import { PhoneFrame } from './PhoneFrame';
import { TabBar } from './TabBar';

/**
 * 添加作品 — V1's mobile-side analogue of the PC extension's auto-detection.
 * Flow:
 *   1. User pastes a manga page URL
 *   2. App finds a matching SourceRule by domain
 *   3. App fetches the HTML (via host-supplied fetcher — real impl uses
 *      @capacitor/http to bypass CORS; preview uses a mock)
 *   4. App parses with the rule + shows preview (cover / title / author)
 *   5. User confirms → bookshelfStore.add()
 *
 * The component is presentational + flow-driving only; the actual
 * fetcher/parser/store calls come in via props so this is reusable in
 * preview, mobile app, and (eventually) extension Options page.
 */
export type AddMangaResolver = (
  url: string,
) => Promise<
  | { kind: 'ok'; manga: Manga; rule: SourceRule }
  | { kind: 'no-rule'; host: string }
  | { kind: 'parse-failed'; rule: SourceRule }
  | { kind: 'fetch-failed'; error: Error }
>;

type AddMangaProps = {
  resolve: AddMangaResolver;
  onAdd(manga: Manga): Promise<void>;
};

type Status =
  | { kind: 'idle' }
  | { kind: 'resolving' }
  | { kind: 'preview'; manga: Manga; rule: SourceRule }
  | { kind: 'no-rule'; host: string }
  | { kind: 'parse-failed' }
  | { kind: 'fetch-failed'; message: string }
  | { kind: 'added'; title: string };

export function AddMangaPage({ resolve, onAdd }: AddMangaProps) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const submit = async () => {
    if (!url.trim()) return;
    setStatus({ kind: 'resolving' });
    const r = await resolve(url.trim());
    if (r.kind === 'ok') setStatus({ kind: 'preview', manga: r.manga, rule: r.rule });
    else if (r.kind === 'no-rule') setStatus({ kind: 'no-rule', host: r.host });
    else if (r.kind === 'parse-failed') setStatus({ kind: 'parse-failed' });
    else setStatus({ kind: 'fetch-failed', message: r.error.message });
  };

  const confirm = async () => {
    if (status.kind !== 'preview') return;
    await onAdd(status.manga);
    setStatus({ kind: 'added', title: status.manga.title });
    setUrl('');
  };

  return (
    <PhoneFrame>
      <div className="uk-phone__header">
        <h3>添加作品</h3>
      </div>
      <div className="uk-phone__content">
        <div className="uk-add">
          <label className="uk-add__row">
            <span>源站作品 URL</span>
            <input
              type="url"
              placeholder="https://example.com/manga/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </label>
          <p className="uk-add__hint">
            从浏览器复制漫画作品的页面链接粘贴到这里。会用已订阅的源规则解析作品信息。
          </p>
          <button
            type="button"
            className="uk-btn uk-btn--primary"
            onClick={submit}
            disabled={!url.trim() || status.kind === 'resolving'}
          >
            {status.kind === 'resolving' ? '解析中…' : '解析'}
          </button>

          <div className="uk-add__result">{renderStatus(status, confirm)}</div>
        </div>
      </div>
      <TabBar cur="add" />
    </PhoneFrame>
  );
}

function renderStatus(status: Status, onConfirm: () => void) {
  if (status.kind === 'idle' || status.kind === 'resolving') return null;
  if (status.kind === 'no-rule') {
    return (
      <div className="uk-add__msg uk-add__msg--warn">
        <strong>无匹配源规则</strong>
        <p>
          没有订阅 <code>{status.host}</code> 对应的规则。先到「我的 → 设置 → 源规则订阅」导入。
        </p>
      </div>
    );
  }
  if (status.kind === 'parse-failed') {
    return (
      <div className="uk-add__msg uk-add__msg--bad">
        <strong>解析失败</strong>
        <p>规则匹配上但提取不到标题。可能页面结构变了，规则需要更新。</p>
      </div>
    );
  }
  if (status.kind === 'fetch-failed') {
    return (
      <div className="uk-add__msg uk-add__msg--bad">
        <strong>抓取失败</strong>
        <p>{status.message}</p>
      </div>
    );
  }
  if (status.kind === 'added') {
    return (
      <div className="uk-add__msg uk-add__msg--good">
        <strong>已加入书架</strong>
        <p>《{status.title}》已添加。可在「书架」找到。</p>
      </div>
    );
  }
  // preview
  const m = status.manga;
  return (
    <div className="uk-add__preview">
      <div className="uk-cover" style={{ width: 60, height: 80, fontSize: 14 }}>
        {m.title.slice(0, 1)}
      </div>
      <div className="uk-add__preview__info">
        <div className="uk-add__preview__title">{m.title}</div>
        {m.author && <div className="uk-add__preview__author">{m.author}</div>}
        <span className="uk-pill">{status.rule.name}</span>
      </div>
      <button type="button" className="uk-btn uk-btn--accent" onClick={onConfirm}>
        + 加入书架
      </button>
    </div>
  );
}
