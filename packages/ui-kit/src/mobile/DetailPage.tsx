import type { Manga } from '../types';
import { PhoneFrame } from './PhoneFrame';

type Props = {
  manga: Manga;
};

export function DetailPage({ manga }: Props) {
  const total = manga.total;
  const chapters = Array.from({ length: 5 }, (_, i) => total - i);
  return (
    <PhoneFrame>
      <div className="uk-phone__header">
        <span className="uk-phone__header__back">◀</span>
        <h3>{manga.title.replace(/（完结）$/, '')}</h3>
        <button type="button" className="uk-btn">
          ⇄ 换源
        </button>
      </div>
      <div className="uk-phone__content" style={{ paddingBottom: 80 }}>
        <div className="uk-detail-hero">
          <div className="uk-cover cover">{manga.initial}</div>
          <div>
            <div className="uk-detail-hero__title">{manga.title}</div>
            <div className="uk-detail-hero__author">{manga.author ?? '—'}</div>
            <span className="uk-pill">{manga.source}</span>
          </div>
        </div>
        <div className="uk-detail-summary">
          完全无敌的英雄琦玉为了寻找强敌而四处奔波……以下省略，简介数据来自源站抓取。
        </div>
        <div className="uk-chapter-list">
          <div className="uk-chapter-list__head">章节 · 共 {total} 话</div>
          {chapters.map((ch, idx) => (
            <div key={ch} className={`uk-chapter-row ${idx === 0 ? 'uk-chapter-row--cur' : ''}`}>
              <span>第 {ch} 话</span>
              <span className="num">{idx === 0 ? '▶ 在读' : '已读'}</span>
            </div>
          ))}
        </div>
      </div>
      <button type="button" className="uk-continue-cta">
        ▶ 继续阅读 · 第 {manga.chapter} 话
      </button>
    </PhoneFrame>
  );
}
