'use client';

import { useEffect, useState } from 'react';

export default function TitleBar() {
  const [isElectron, setIsElectron] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
    if (!api?.isElectron) return;
    setIsElectron(true);

    api.windowIsMaximized?.().then(setIsMaximized).catch(() => {});
    const unsub = api.onMaximizeChange?.((m) => setIsMaximized(m));
    return () => { if (unsub) unsub(); };
  }, []);

  // Only render the custom bar inside the Electron app
  if (!isElectron) return null;

  const api = window.electronAPI;

  return (
    <div className="hb-titlebar">
      <div className="hb-titlebar-drag">
        <div className="hb-titlebar-brand">
          <span className="hb-titlebar-logo" aria-hidden="true">
            <span className="hb-titlebar-logo-bar" />
            <span className="hb-titlebar-logo-text">HB</span>
          </span>
          <span className="hb-titlebar-name">HexBrief</span>
        </div>
      </div>

      <div className="hb-titlebar-controls">
        <button
          className="hb-titlebar-btn"
          onClick={() => api?.windowMinimize?.()}
          aria-label="Minimise"
          title="Minimise"
        >
          <svg width="11" height="11" viewBox="0 0 11 11">
            <line x1="2" y1="5.5" x2="9" y2="5.5" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>

        <button
          className="hb-titlebar-btn"
          onClick={() => api?.windowMaximize?.()}
          aria-label={isMaximized ? 'Restore' : 'Maximise'}
          title={isMaximized ? 'Restore' : 'Maximise'}
        >
          {isMaximized ? (
            <svg width="11" height="11" viewBox="0 0 11 11">
              <rect x="2.5" y="3.5" width="5" height="5" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M4 3.5 V2 H8.5 V6.5 H7" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 11 11">
              <rect x="2.5" y="2.5" width="6" height="6" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          )}
        </button>

        <button
          className="hb-titlebar-btn hb-titlebar-close"
          onClick={() => api?.windowClose?.()}
          aria-label="Close"
          title="Close"
        >
          <svg width="11" height="11" viewBox="0 0 11 11">
            <line x1="2.5" y1="2.5" x2="8.5" y2="8.5" stroke="currentColor" strokeWidth="1" />
            <line x1="8.5" y1="2.5" x2="2.5" y2="8.5" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
