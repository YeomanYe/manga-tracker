import type { Manga, SourceSubscription } from '../types';

type OptionsProps = {
  shelf: Manga[];
  subscriptions: SourceSubscription[];
};

export function OptionsPage({ shelf, subscriptions }: OptionsProps) {
  const sources = Array.from(new Set(shelf.map((m) => m.source))).sort();
  return (
    <div className="uk-options">
      <h3>书架管理</h3>
      <p className="uk-options__sub">
        {shelf.length} 部 · {sources.length} 个源 · 全部本地存储
      </p>

      {sources.map((src) => {
        const items = shelf.filter((m) => m.source === src);
        return (
          <div key={src} className="uk-options__group">
            <div className="uk-options__group__head">
              <b>{src}（虚构源）</b>
              <span className="uk-pill">{items.length} 部</span>
            </div>
            {items.map((m) => (
              <div key={m.id} className="uk-options__row">
                <div className="uk-cover cover-sm">{m.initial}</div>
                <div className="uk-options__row__info">
                  <div className="title">{m.title}</div>
                  <div className="sub">
                    ch.{m.chapter}/{m.total} · {m.updatedLabel}
                  </div>
                </div>
                <button type="button" className="uk-btn uk-btn--ghost" title="编辑">
                  ✎
                </button>
                <button type="button" className="uk-btn uk-btn--ghost" title="移除">
                  ×
                </button>
              </div>
            ))}
          </div>
        );
      })}

      <h3 style={{ marginTop: 28 }}>源规则订阅</h3>
      <p className="uk-options__sub">
        支持 legado-v3 / manga-tracker-v1 / mihon-port 三种 wire format
      </p>

      <div className="uk-options__group">
        {subscriptions.map((sub) => (
          <div key={sub.url} className="uk-options__source-row">
            <FormatBadge format={sub.format} />
            <code>{sub.url}</code>
            <span className="uk-pill">{sub.siteCount} sites</span>
            <div className={`uk-toggle ${sub.enabled ? 'uk-toggle--on' : ''}`} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button type="button" className="uk-btn">
          + 添加订阅
        </button>
        <button type="button" className="uk-btn">
          导入 JSON 文件
        </button>
      </div>
    </div>
  );
}

function FormatBadge({ format }: { format: SourceSubscription['format'] }) {
  const cls = format === 'legado-v3' ? 'uk-pill uk-pill--accent' : 'uk-pill';
  return <span className={cls}>{format}</span>;
}
