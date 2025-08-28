/**
 * SUMMARY
 * Terminal.EXE: toy shell to open apps via commands. Accessible prompt with
 * history navigation and pure parser. Uses WindowManager openApp.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useEra } from '../../shell/era/EraContext';
import { getAllApps } from '../../shell/appRegistry';
import { parseCommand, type CommandResult } from './parser';
import { useWindowing } from '../../shell/windowing/context';

type Line = { id: number; text: string };

export default function TerminalApp(): JSX.Element {
  const { eraId, isForced, setEraForDev, userPrefs } = useEra();
  const { openApp } = useWindowing();
  const [lines, setLines] = useState<Line[]>([{ id: 0, text: 'Type help to begin.' }]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const nextIdRef = useRef(1);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addLines = (texts: string[]) => {
    setLines((prev) => [
      ...prev,
      ...texts.map((t) => ({ id: nextIdRef.current++, text: t }))
    ]);
  };

  const handleResult = (res: CommandResult, raw: string) => {
    switch (res.type) {
      case 'print':
        addLines(res.lines);
        break;
      case 'clear':
        setLines([]);
        break;
      case 'open':
        openApp(res.appId);
        break;
      case 'noop':
        break;
    }
    if (raw) setHistory((h) => [...h, raw]);
    setHistIdx(-1);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = input.trim();
    if (!raw) return;
    addLines([promptText(eraId) + raw]);
    const ctx = { eraId, apps: getAllApps(), canPreview: !isForced };
    const res = parseCommand(raw, ctx);
    // Special-case theme to actually call preview
    if (res.type === 'print' && raw.startsWith('theme ') && !isForced) {
      const target = raw.split(/\s+/)[1];
      if (target === 'terminal-os' || target === 'os-91' || target === 'now-os') {
        setEraForDev?.(target as any);
      }
    }
    handleResult(res, raw);
    setInput('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      setInput('');
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHistIdx((idx) => {
        const next = idx < 0 ? history.length - 1 : Math.max(0, idx - 1);
        setInput(history[next] ?? input);
        return next;
      });
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHistIdx((idx) => {
        const next = idx < 0 ? -1 : Math.min(history.length - 1, idx + 1);
        setInput(next === -1 ? '' : (history[next] ?? ''));
        return next;
      });
      return;
    }
  };

  return (
    <div className="terminal">
      <div className="terminal-screen" role="log" aria-live="polite">
        {lines.map((l) => (
          <div key={l.id} className="terminal-line">{l.text}</div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="terminal-input-row">
        <label className="sr-only" htmlFor="terminal-input">Terminal input</label>
        <span aria-hidden="true" className="terminal-prompt">{promptText(eraId)}</span>
        <input
          id="terminal-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="terminal-input"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label={`Terminal input, era ${eraId}${!isForced && userPrefs.devEraOverride ? ' (preview)' : ''}`}
        />
      </form>
    </div>
  );
}

function promptText(eraId: string): string {
  return `guest@website-os:${eraId} $ `;
}



