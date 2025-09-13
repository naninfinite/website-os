import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import { WindowManagerOG } from "../WindowManagerOG";
import { DesktopOG } from "../Desktop";
import { OG_PANELS } from "../panels";
import "@testing-library/jest-dom";

describe("OG Desktop integration", () => {
  it("renders all OG panels", () => {
    render(
      <WindowManagerOG>
        <DesktopOG />
      </WindowManagerOG>
    );
    for (const panel of OG_PANELS) {
      expect(
        screen.getByRole("button", { name: new RegExp(panel.exeName, "i") })
      ).toBeInTheDocument();
    }
  });

  it("opens DIMENSION.EXE when clicked", () => {
    render(
      <WindowManagerOG>
        <DesktopOG />
      </WindowManagerOG>
    );
    fireEvent.click(
      screen.getByRole("button", { name: /DIMENSION\.EXE/i })
    );
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
    fireEvent.click(
      screen.getByRole("button", { name: /HOME\.EXE/i })
    );
    const win = screen.getByRole("dialog", { name: "HOME.EXE" });
    fireEvent.click(
      within(win).getByRole("button", { name: /close/i })
    );
    expect(
      screen.queryByRole("dialog", { name: "HOME.EXE" })
    ).toBeNull();
  });
});