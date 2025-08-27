/**
 * SUMMARY
 * Terminal app stub. Provides minimal component and metadata for the registry.
 */
import React from 'react';

export const appMeta = { id: 'terminal', title: 'Terminal.EXE', icon: 'terminal' };

export default function TerminalApp() {
    return (
        <div>
            <h1>Terminal.EXE</h1>
            <p>Stub app. CRT shell and commands live here.</p>
        </div>
    )
}


