import type { Manga } from '../types';

type Props = {
  manga: Manga;
};

export function ReaderShellPage({ manga }: Props) {
  return (
    <div className="uk-phone">
      <div className="uk-phone__notch" />
      <div className="uk-reader" style={{ marginTop: 28 }}>
        <div className="uk-reader__topbar">
          <span style={{ cursor: 'pointer' }}>◀</span>
          <span>第 {manga.chapter} 话</span>
          <span className="src">{manga.source}</span>
        </div>
        <div className="uk-reader__webview">
          <div className="uk-reader__webview__pages">
            <div />
            <div />
          </div>
        </div>
        <div className="uk-reader__botbar">
          <span>◀ 上一话</span>
          <span className="nav">
            {manga.chapter} / {manga.total}
          </span>
          <span>下一话 ▶</span>
        </div>
      </div>
    </div>
  );
}
