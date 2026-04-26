import type { ReactNode } from 'react';

type StateProps = {
  title: string;
  desc: string;
  cta?: ReactNode;
};

export function EmptyState({ title, desc, cta }: StateProps) {
  return (
    <div className="uk-state">
      <div className="uk-state__ico">∅</div>
      <p className="uk-state__title">{title}</p>
      <p className="uk-state__desc">{desc}</p>
      {cta}
    </div>
  );
}

export function LoadingState({ title = '加载中', desc = '正在读取本地数据' }: Partial<StateProps>) {
  return (
    <div className="uk-state uk-state--loading">
      <div className="uk-state__ico">◐</div>
      <p className="uk-state__title">{title}</p>
      <p className="uk-state__desc">{desc}</p>
    </div>
  );
}

export function ErrorState({ title = '加载失败', desc, cta }: Partial<StateProps>) {
  return (
    <div className="uk-state uk-state--error">
      <div className="uk-state__ico">!</div>
      <p className="uk-state__title">{title}</p>
      <p className="uk-state__desc">{desc ?? '本地存储读取出错。请检查权限或重新安装扩展。'}</p>
      {cta}
    </div>
  );
}

export function LoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div style={{ padding: 12 }}>
      {Array.from({ length: rows }, (_, i) => `sk-${i}`).map((key) => (
        <div key={key} className="uk-popup__row" style={{ padding: '10px 0' }}>
          <div className="uk-skel" style={{ width: 26, height: 34 }} />
          <div style={{ flex: 1, marginLeft: 10 }}>
            <div className="uk-skel" style={{ height: 11, width: '60%', marginBottom: 6 }} />
            <div className="uk-skel" style={{ height: 9, width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
