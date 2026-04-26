import type { ReactNode } from 'react';
import { PhoneFrame } from './PhoneFrame';

type RowProps = {
  label: string;
  sub?: string;
  trailing?: ReactNode;
};

function Row({ label, sub, trailing }: RowProps) {
  return (
    <div className="uk-set-row">
      <div>
        <div className="uk-set-row__lab">{label}</div>
        {sub && <div className="uk-set-row__sub">{sub}</div>}
      </div>
      {trailing}
    </div>
  );
}

export function SettingsPage() {
  return (
    <PhoneFrame>
      <div className="uk-phone__header">
        <span className="uk-phone__header__back">◀</span>
        <h3>设置</h3>
      </div>
      <div className="uk-phone__content">
        <section className="uk-set-section">
          <div className="uk-set-section__title">源规则</div>
          <Row
            label="订阅源"
            sub="3 个，启用 2 个"
            trailing={
              <button type="button" className="uk-btn">
                管理
              </button>
            }
          />
          <Row
            label="导入 legado 漫画书源"
            sub="从 URL 或文件 · format: legado-v3"
            trailing={
              <button type="button" className="uk-btn uk-btn--primary">
                导入
              </button>
            }
          />
        </section>

        <section className="uk-set-section">
          <div className="uk-set-section__title">数据</div>
          <Row
            label="导出书架"
            sub="JSON · 12 部"
            trailing={
              <button type="button" className="uk-btn">
                导出
              </button>
            }
          />
          <Row
            label="导入书架"
            sub="从扩展端 JSON"
            trailing={
              <button type="button" className="uk-btn">
                导入
              </button>
            }
          />
        </section>

        <section className="uk-set-section">
          <div className="uk-set-section__title">阅读器</div>
          <Row
            label="广告屏蔽"
            sub="注入 EasyList 中文规则"
            trailing={<div className="uk-toggle uk-toggle--on" />}
          />
          <Row
            label="移动端 CSS 适配"
            sub="PC 站点强制移动布局"
            trailing={<div className="uk-toggle uk-toggle--on" />}
          />
        </section>

        <section className="uk-set-section">
          <div className="uk-set-section__title">关于</div>
          <Row label="版本" sub="v0.1.0 (debug)" />
        </section>
      </div>
    </PhoneFrame>
  );
}
