export type PanelId = "home" | "connect" | "dimension" | "unknown";

export interface PanelMeta {
    id: PanelId;
    label: string; //label shown on desktop tile
    exeName: string; // titlebar text in the window
    description?: string; // tooltip text in the window
}

export const OG_PANELS: PanelMeta[] = [
    {id: "home", label: "HOME.EXE", exeName: "HOME.EXE", description: "File manager for browsing local/portfoloio files"},
    {id: "connect", label: "CONNECT.EXE", exeName: "CONNECT.EXE", description: "Connect with other players / multi-user experiments"},
    {id: "dimension", label: "DIMENSION.EXE", exeName: "DIMENSION.EXE", description: "Playground for interactive 3D (three.js, creative scenes"},
    {id: "unknown", label: "?.EXE", exeName: "?.EXE", description: "Unknown panel"},
]