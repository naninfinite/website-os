/* @vitest-environment node */
import { describe, it, expect } from 'vitest';
import { parseCommand, type CommandContext } from '../parser';

const ctx: CommandContext = {
  eraId: 'terminal-os',
  apps: [
    { id: 'about', title: 'About.EXE', icon: 'about' } as any,
    { id: 'dimension', title: 'Dimension.EXE', icon: 'dimension' } as any,
  ],
  canPreview: true,
};

describe('Terminal parser whitelist', () => {
  it('help', () => {
    const res = parseCommand('help', ctx);
    expect(res).toEqual({ type: 'print', lines: expect.any(Array) });
  });

  it('apps lists registry apps', () => {
    const res = parseCommand('apps', ctx);
    expect(res.type).toBe('print');
    if (res.type === 'print') {
      expect(res.lines.some(l => l.includes('about'))).toBe(true);
      expect(res.lines.some(l => l.includes('dimension'))).toBe(true);
    }
  });

  it('open <id> returns open instruction when app exists', () => {
    const res = parseCommand('open dimension', ctx);
    expect(res).toEqual({ type: 'open', appId: 'dimension' });
  });

  it('open without arg prints usage', () => {
    const res = parseCommand('open', ctx);
    expect(res).toEqual({ type: 'print', lines: ['Usage: open <appId>'] });
  });

  it('open unknown prints error', () => {
    const res = parseCommand('open nope', ctx);
    expect(res).toEqual({ type: 'print', lines: ['Unknown app: nope'] });
  });

  it('clear returns clear instruction', () => {
    const res = parseCommand('clear', ctx);
    expect(res).toEqual({ type: 'clear' });
  });

  it('echo prints provided text (including spaces)', () => {
    const res = parseCommand('echo hello world', ctx);
    expect(res).toEqual({ type: 'print', lines: ['hello world'] });
  });

  it('time prints UTC and Local lines', () => {
    const res = parseCommand('time', ctx);
    expect(res.type).toBe('print');
    if (res.type === 'print') {
      expect(res.lines[0]).toMatch(/^UTC: /);
      expect(res.lines[1]).toMatch(/^Local: /);
    }
  });

  it('era prints active era', () => {
    const res = parseCommand('era', ctx);
    expect(res).toEqual({ type: 'print', lines: ['Active era: terminal-os (preview possible)'] });
  });

  it('theme validates whitelist and reports preview', () => {
    const res = parseCommand('theme os-91', ctx);
    expect(res).toEqual({ type: 'print', lines: ['Previewing era: os-91'] });
  });

  it('theme unknown shows usage', () => {
    const res = parseCommand('theme unknown-era', ctx);
    expect(res).toEqual({ type: 'print', lines: ['Usage: theme <terminal-os|os-91|now-os>'] });
  });

  it('unknown command yields help hint', () => {
    const res = parseCommand('rm -rf /', ctx);
    expect(res).toEqual({ type: 'print', lines: ["Unknown command: rm. Type 'help'"] });
  });
});


