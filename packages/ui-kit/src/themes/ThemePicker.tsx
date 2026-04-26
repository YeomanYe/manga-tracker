import type { Theme, ThemeTokens } from '@manga/types';
import { useState } from 'react';
import { BUILTIN_THEMES } from './presets';

type ThemePickerProps = {
  current: string;
  customs: Theme[];
  onPick(id: string): void;
  onSaveCustom(name: string, tokens: ThemeTokens, mode: 'dark' | 'light'): void;
  onRemoveCustom(id: string): void;
};

export function ThemePicker({
  current,
  customs,
  onPick,
  onSaveCustom,
  onRemoveCustom,
}: ThemePickerProps) {
  const [editing, setEditing] = useState(false);
  const themes = [...BUILTIN_THEMES, ...customs];

  return (
    <div className="uk-theme-picker">
      <div className="uk-theme-list">
        {themes.map((t) => (
          <ThemeSwatch
            key={t.id}
            theme={t}
            cur={t.id === current}
            onPick={() => onPick(t.id)}
            onRemove={t.builtin ? undefined : () => onRemoveCustom(t.id)}
          />
        ))}
        <button type="button" className="uk-btn" onClick={() => setEditing(true)}>
          + 自定义主题
        </button>
      </div>
      {editing && (
        <ThemeEditor
          base={themes.find((t) => t.id === current) ?? (themes[0] as Theme)}
          onCancel={() => setEditing(false)}
          onSave={(name, tokens, mode) => {
            onSaveCustom(name, tokens, mode);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}

function ThemeSwatch({
  theme,
  cur,
  onPick,
  onRemove,
}: {
  theme: Theme;
  cur: boolean;
  onPick: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className={`uk-theme-swatch ${cur ? 'uk-theme-swatch--cur' : ''}`}>
      <button type="button" className="uk-theme-swatch__btn" onClick={onPick}>
        <span
          className="uk-theme-swatch__chip"
          style={{
            background: `linear-gradient(135deg, ${theme.tokens.bg} 0% 50%, ${theme.tokens.bgElev} 50% 100%)`,
          }}
        >
          <span className="uk-theme-swatch__main" style={{ background: theme.tokens.main }} />
          <span className="uk-theme-swatch__accent" style={{ background: theme.tokens.accent }} />
        </span>
        <span className="uk-theme-swatch__name">{theme.name}</span>
      </button>
      {onRemove && (
        <button type="button" className="uk-theme-swatch__remove" onClick={onRemove} title="删除">
          ×
        </button>
      )}
    </div>
  );
}

function ThemeEditor({
  base,
  onCancel,
  onSave,
}: {
  base: Theme;
  onCancel: () => void;
  onSave: (name: string, tokens: ThemeTokens, mode: 'dark' | 'light') => void;
}) {
  const [name, setName] = useState('我的主题');
  const [mode, setMode] = useState<'dark' | 'light'>(base.mode);
  const [tokens, setTokens] = useState<ThemeTokens>(base.tokens);

  const setToken = (k: keyof ThemeTokens, v: string) => setTokens({ ...tokens, [k]: v });

  return (
    <div className="uk-theme-editor">
      <h4>自定义主题</h4>
      <label className="uk-theme-editor__row">
        <span>名称</span>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="uk-theme-editor__row">
        <span>模式</span>
        <select value={mode} onChange={(e) => setMode(e.target.value as 'dark' | 'light')}>
          <option value="dark">暗色</option>
          <option value="light">亮色</option>
        </select>
      </label>
      <ColorRow label="背景" value={tokens.bg} onChange={(v) => setToken('bg', v)} />
      <ColorRow label="表面" value={tokens.bgElev} onChange={(v) => setToken('bgElev', v)} />
      <ColorRow label="正文" value={tokens.text} onChange={(v) => setToken('text', v)} />
      <ColorRow
        label="次要文字"
        value={tokens.textSoft}
        onChange={(v) => setToken('textSoft', v)}
      />
      <ColorRow label="主色" value={tokens.main} onChange={(v) => setToken('main', v)} />
      <ColorRow label="强调色" value={tokens.accent} onChange={(v) => setToken('accent', v)} />
      <div className="uk-theme-editor__actions">
        <button type="button" className="uk-btn" onClick={onCancel}>
          取消
        </button>
        <button
          type="button"
          className="uk-btn uk-btn--primary"
          onClick={() => onSave(name, tokens, mode)}
        >
          保存
        </button>
      </div>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="uk-theme-editor__row">
      <span>{label}</span>
      <input type="color" value={normalizeHex(value)} onChange={(e) => onChange(e.target.value)} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="uk-theme-editor__hex"
      />
    </label>
  );
}

function normalizeHex(c: string): string {
  // <input type="color"> requires #rrggbb. If user gave an rgba/css var, fallback.
  return /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#000000';
}
