/* @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TerminalApp from '../index';
import { EraProvider } from '../../../shell/era/EraContext';

function renderWithEra(ui: React.ReactElement) {
  return render(<EraProvider>{ui}</EraProvider>);
}

describe('Terminal.EXE UI', () => {
  it('renders CRT prompt banner and echoes command (snapshot prompt)', () => {
    const { asFragment } = renderWithEra(<TerminalApp />);
    // Initial banner line
    expect(screen.getByText(/Type help to begin\./i)).toBeTruthy();
    // Prompt before input
    // Prompt element uses static text; assert by role+class to avoid regex split issues
    const promptEl = document.querySelector('.terminal-prompt');
    expect(promptEl?.textContent).toMatch(/guest@website-os:terminal-os \$ /i);
    // Snapshot baseline that includes prompt markup
    expect(asFragment()).toMatchSnapshot();

    // Type `help` and submit; check that the echoed prompt+command appears
    const input = screen.getByLabelText(/Terminal input/i);
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.submit(input.closest('form')!);
    expect(screen.getByText(/Commands:/i)).toBeInTheDocument();
  });
});


