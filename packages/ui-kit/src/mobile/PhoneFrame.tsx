import type { ReactNode } from 'react';

type PhoneFrameProps = {
  children: ReactNode;
  showStatusBar?: boolean;
};

export function PhoneFrame({ children, showStatusBar = true }: PhoneFrameProps) {
  return (
    <div className="uk-phone">
      <div className="uk-phone__notch" />
      {showStatusBar && (
        <div className="uk-phone__statusbar">
          <span className="time">9:41</span>
          <span className="right">·..📶 100%</span>
        </div>
      )}
      {children}
    </div>
  );
}
