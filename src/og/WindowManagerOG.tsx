import React from "react";
import styles from "./WindowManagerOG.module.scss";
import type { PanelId } from "./panels";

type OgWindow = {
  id: string;
  app: PanelId;
  title: string;
  z: number;
  status: 'open' | 'minimized' | 'closed';
};

type Ctx = {
  windows: OgWindow[];
  openWindow: (app: PanelId, title: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreApp: (app: PanelId) => void;
};

const Ctx = React.createContext<Ctx | null>(null);
export function useOgWindows() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useOgWindows must be used within <WindowManagerOG>");
  return ctx;
}

let uid = 0;

export const WindowManagerOG: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windows, setWindows] = React.useState<OgWindow[]>([]);
  const [topZ, setTopZ] = React.useState(1);

  const openWindow = (app: PanelId, title: string) => {
    setWindows(ws => {
      const existing = ws.find(w => w.app === app);
      if (existing) {
        // If minimized: restore; if open: focus
        const nextTop = topZ + 1;
        setTopZ(nextTop);
        return ws.map(w => {
          if (w.id !== existing.id) return w;
          return { ...w, status: 'open', z: nextTop };
        });
      }
      const id = `ogw-${++uid}`;
      const z = topZ + 1;
      setTopZ(z);
      return [...ws, { id, app, title, z, status: 'open' }];
    });
  };

  const focusWindow = (id: string) => {
    setWindows(ws => {
      const z = topZ + 1;
      setTopZ(z);
      return ws.map(w => (w.id === id ? { ...w, z, status: 'open' } : w));
    });
  };

  const closeWindow = (id: string) => {
    setWindows(ws => ws.filter(w => w.id !== id));
  };

  const minimizeWindow = (id: string) => {
    setWindows(ws => ws.map(w => (w.id === id ? { ...w, status: 'minimized' } : w)));
  };

  const restoreApp = (app: PanelId) => {
    setWindows(ws => {
      const found = ws.find(w => w.app === app);
      if (!found) return ws;
      const z = topZ + 1;
      setTopZ(z);
      return ws.map(w => (w.id === found.id ? { ...w, status: 'open', z } : w));
    });
  };

  return (
    <Ctx.Provider value={{ windows, openWindow, closeWindow, focusWindow, minimizeWindow, restoreApp }}>
      <div className={styles.layerRoot}>
        {children}
        {windows.filter(w => w.status === 'open').map(w => (
          <OgWindow key={w.id} w={w} onFocus={focusWindow} onClose={closeWindow} onMinimize={minimizeWindow} />
        ))}
      </div>
    </Ctx.Provider>
  );
};

const OgWindow: React.FC<{
  w: OgWindow;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
}> = ({ w, onFocus, onClose, onMinimize }) => {
  const style: React.CSSProperties = {
    position: "absolute",
    left: 48,
    top: 48,
    width: 520,
    height: 360,
    zIndex: w.z,
  };

  return (
    <section
      role="dialog"
      aria-label={w.title}
      className={styles.window}
      style={style}
      onMouseDown={() => onFocus(w.id)}
      data-testid={`og-window-${w.id}`}
    >
      <header className={styles.titlebar}>
        <span>{w.title}</span>
        <div>
          <button className={styles.minimize} onClick={() => onMinimize(w.id)} aria-label="Minimize window">–</button>
          <button className={styles.close} onClick={() => onClose(w.id)} aria-label="Close window">×</button>
        </div>
      </header>
      <div className={styles.body}>
        <OgWindowBody app={w.app} />
      </div>
    </section>
  );
};

const OgWindowBody: React.FC<{ app: PanelId }> = ({ app }) => {
  switch (app) {
    case "home":
      return <div>file manager coming soon</div>;
    case "connect":
      return <div>multiplayer coming soon</div>;
    case "dimension":
      return <DimensionStub />;
    case "unknown":
      return <div>TBD</div>;
    default:
      return null;
  }
};

const DimensionStub: React.FC = () => (
  <div>
    <strong>DIMENSION.EXE</strong>
    <p>three.js playground will mount here (stub).</p>
    <div style={{ border: "1px solid currentColor", height: 220 }} aria-label="3D viewport placeholder" />
  </div>
);