import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import { WindowManagerOG } from "../WindowManagerOG";
import { DesktopOG } from "../Desktop";
import { OG_PANELS } from "../panels";
// matchers are installed via vitest.setup.ts

describe("OG Desktop integration", () => {
  it("renders all OG panels", () => {
    render(
      <WindowManagerOG>
        <DesktopOG />
      </WindowManagerOG>
    );
    const dock = screen.getByRole('navigation', { name: /OG Dock/i });
    for (const panel of OG_PANELS) {
      // Desktop tiles use aria-label "Open <EXE>"
      expect(screen.getByLabelText(`Open ${panel.exeName}`)).toBeInTheDocument();
      // Dock buttons use the EXE label directly
      expect(within(dock).getByRole("button", { name: panel.exeName })).toBeInTheDocument();
    }
  });

  it("opens DIMENSION.EXE when clicked", () => {
    render(
      <WindowManagerOG>
        <DesktopOG />
      </WindowManagerOG>
    );
    fireEvent.click(screen.getByRole("button", { name: /Open DIMENSION\.EXE/i }));
    expect(
      screen.getByRole("dialog", { name: "DIMENSION.EXE" })
    ).toBeInTheDocument();
  });

  it("closes window when close button clicked", () => {
    render(
      <WindowManagerOG>
        <DesktopOG />
      </WindowManagerOG>
    );
    fireEvent.click(screen.getByRole("button", { name: /Open HOME\.EXE/i }));
    const win = screen.getByRole("dialog", { name: "HOME.EXE" });
    fireEvent.click(
      within(win).getByRole("button", { name: /close/i })
    );
    expect(
      screen.queryByRole("dialog", { name: "HOME.EXE" })
    ).toBeNull();
  });
});