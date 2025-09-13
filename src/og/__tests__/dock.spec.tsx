/* @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { WindowManagerOG } from '../WindowManagerOG';
import { DesktopOG } from '../Desktop';

describe('DockOG behavior', () => {
  it('renders all dock labels (dock region)', () => {
    render(
      <WindowManagerOG>
        <DesktopOG />
      </WindowManagerOG>
    );
    const dock = screen.getByRole('navigation', { name: /OG Dock/i });
    expect(within(dock).getByRole('button', { name: /HOME\.EXE/i })).toBeInTheDocument();
    expect(within(dock).getByRole('button', { name: /CONNECT\.EXE/i })).toBeInTheDocument();
    expect(within(dock).getByRole('button', { name: /DIMENSION\.EXE/i })).toBeInTheDocument();
    expect(within(dock).getByRole('button', { name: /\?\.EXE/i })).toBeInTheDocument();
  });

  it('open → active; minimize → hidden; restore via dock', () => {
    render(
      <WindowManagerOG>
        <DesktopOG />
      </WindowManagerOG>
    );

    // open HOME via desktop tile
    fireEvent.click(screen.getAllByRole('button', { name: /Open HOME\.EXE/i })[0]);
    const dock = screen.getByRole('navigation', { name: /OG Dock/i });
    const homeDock = within(dock).getByRole('button', { name: /HOME\.EXE/i });
    expect(homeDock).toHaveAttribute('aria-pressed', 'true');

    // minimize via window button
    const dialog = screen.getByRole('dialog', { name: 'HOME.EXE' });
    const minimize = screen.getByLabelText('Minimize window');
    fireEvent.click(minimize);
    expect(screen.queryByRole('dialog', { name: 'HOME.EXE' })).toBeNull();
    // still active
    expect(homeDock).toHaveAttribute('aria-pressed', 'true');

    // restore via dock
    fireEvent.click(homeDock);
    expect(screen.getByRole('dialog', { name: 'HOME.EXE' })).toBeInTheDocument();

    // close and ensure inactive
    fireEvent.click(screen.getByLabelText('Close window'));
    expect(screen.queryByRole('dialog', { name: 'HOME.EXE' })).toBeNull();
    expect(homeDock).toHaveAttribute('aria-pressed', 'false');
  });
});


