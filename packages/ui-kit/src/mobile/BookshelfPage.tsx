import { EmptyState, ErrorState, LoadingSkeleton } from '../states/States';
import type { AsyncState, Manga } from '../types';
import { PhoneFrame } from './PhoneFrame';
import { TabBar } from './TabBar';

type Props = {
  state?: AsyncState;
  shelf: Manga[];
};

export function BookshelfPage({ state = 'normal', shelf }: Props) {
  return (
    <PhoneFrame>
      <div className="uk-phone__header">
        <h3>书架</h3>
        <button type="button" className="uk-btn">
          ◇ 列表
        </button>
      </div>
      <div className="uk-phone__content">{renderBody(state, shelf)}</div>
      <TabBar cur="shelf" />
    </PhoneFrame>
  );
}

function renderBody(state: AsyncState, shelf: Manga[]) {
  if (state === 'loading') return <LoadingSkeleton rows={5} />;
  if (state === 'error')
    return (
      <ErrorState
        cta={
          <button type="button" className="uk-btn">
            重试
          </button>
        }
      />
    );
  if (state === 'empty' || shelf.length === 0)
    return (
      <EmptyState
        title="书架是空的"
        desc="先在 PC 浏览器装扩展，去漫画站翻几章，作品会跨设备同步过来。"
      />
    );
  return (
    <>
      {shelf.map((m) => (
        <div key={m.id} className="uk-shelf-row">
          <div className="uk-cover cover">{m.initial}</div>
          <div className="uk-shelf-row__info">
            <div className="uk-shelf-row__title">
              {m.title}
              {m.unread > 0 && <span className="uk-unread-badge">+{m.unread}</span>}
            </div>
            <div className="uk-shelf-row__sub">
              第 {m.chapter} 话 / 共 {m.total} 话
            </div>
            <div className="uk-shelf-row__meta">
              <span className="uk-pill">{m.source}</span>
              <span>· {m.updatedLabel}</span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
