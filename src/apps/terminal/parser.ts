/**
 * SUMMARY
 * Pure parser/command table for Terminal.EXE. No DOM here; return strings or
 * instructions the UI can act on.
 */
import type { AppMeta } from '../../shell/appRegistry';

export type CommandResult =
  | { type: 'print'; lines: string[] }
  | { type: 'clear' }
  | { type: 'open'; appId: string }
  | { type: 'noop' };

export type CommandContext = {
  eraId: string;
  apps: AppMeta[];
  canPreview: boolean;
};

export function parseCommand(input: string, ctx: CommandContext): CommandResult {
  const text = input.trim();
  if (text.length === 0) return { type: 'noop' };
  const [cmd, ...rest] = text.split(/\s+/);
  const arg = rest.join(' ');
  switch (cmd) {
    case 'help':
      return {
        type: 'print',
        lines: [
          'Commands:',
          '  help                 Show this help',
          '  apps                 List available apps',
          '  open <appId>        Open an app',
          '  clear               Clear the screen',
          '  echo <text>         Print text',
          '  time                Show current UTC and local time',
          '  era                 Show active era',
          '  theme <era>         Preview era (dev only)'
        ],
      };
    case 'apps': {
      const lines = ctx.apps.map((a) => `${a.id} — ${a.title}`);
      return { type: 'print', lines: lines.length ? lines : ['No apps registered'] };
    }
    case 'open': {
      const id = arg;
      if (!id) return { type: 'print', lines: ['Usage: open <appId>'] };
      const match = ctx.apps.find((a) => a.id === id);
      if (!match) return { type: 'print', lines: [`Unknown app: ${id}`] };
      return { type: 'open', appId: id };
    }
    case 'clear':
      return { type: 'clear' };
    case 'echo':
      return { type: 'print', lines: [arg] };
    case 'time': {
      const now = new Date();
      const utc = now.toUTCString();
      const local = now.toString();
      return { type: 'print', lines: [`UTC: ${utc}`, `Local: ${local}`] };
    }
    case 'era': {
      const suffix = ctx.canPreview ? ' (preview possible)' : '';
      return { type: 'print', lines: [`Active era: ${ctx.eraId}${suffix}`] };
    }
    case 'theme': {
      if (!ctx.canPreview) return { type: 'print', lines: ['Preview disabled (VITE_FORCE_ERA active)'] };
      const id = arg as any;
      if (!id || !['terminal-os', 'os-91', 'now-os'].includes(id)) return { type: 'print', lines: ['Usage: theme <terminal-os|os-91|now-os>'] };
      // UI will apply preview via setEraForDev
      return { type: 'print', lines: [`Previewing era: ${id}`] };
    }
    default:
      return { type: 'print', lines: [`Unknown command: ${cmd}. Type 'help'`] };
  }
}


