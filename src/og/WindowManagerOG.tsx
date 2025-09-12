import React from "react";
import styles from "./WindowManagerOG.module.scss";
import type { PanelId } from "./panels";

type OgWindow = {
  id: string;
  app: PanelId;
  title: string;
  z: number;
};

type Ctx = {
  windows: OgWindow[];
  openWindow: (app: PanelId, title: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
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
    const id = `ogw-${++uid}`;
    const z = topZ + 1;
    setTopZ(z);
    setWindows(ws => [...ws, { id, app, title, z }]);
  };

  const focusWindow = (id: string) => {
    setWindows(ws => {
      const z = topZ + 1;
      setTopZ(z);
      return ws.map(w => (w.id === id ? { ...w, z } : w));
    });
  };

  const closeWindow = (id: string) => {
    setWindows(ws => ws.filter(w => w.id !== id));
  };

  return (
    <Ctx.Provider value={{ windows, openWindow, closeWindow, focusWindow }}>
      <div className={styles.layerRoot}>
        {children}
        {windows.map(w => (
          <OgWindow key={w.id} w={w} onFocus={focusWindow} onClose={closeWindow} />
        ))}
      </div>
    </Ctx.Provider>
  );
};

const OgWindow: React.FC<{
  w: OgWindow;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
}> = ({ w, onFocus, onClose }) => {
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
        <button className={styles.close} onClick={() => onClose(w.id)} aria-label="Close window">×</button>
      </header>
      <div className={styles.body}>
        <OgWindowBody app={w.app} />
      </div>
    </section>
  );
};

const OgWindowBody: React.FC<{ app: PanelId }> = ({ app }) => {
  switch (app) {
    case "home":      return <div>HOME.EXE — intro coming soon.</div>;
    case "connect":   return <div>CONNECT.EXE — contact & links coming soon.</div>;
    case "dimension": return <DimensionStub />;
    case "unknown":   return <div>?.EXE — TBD.</div>;
    default:          return null;
  }
};

const DimensionStub: React.FC = () => (
  <div>
    <strong>DIMENSION.EXE</strong>
    <p>three.js playground will mount here (stub).</p>
    <div style={{ border: "1px solid currentColor", height: 220 }} aria-label="3D viewport placeholder" />
  </div>
);