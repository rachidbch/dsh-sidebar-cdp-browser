/**
 * The side-card settings panel ("设置 → 侧边卡片 → 侧边栏内容 → CDP实时视图"
 * gear popup): the CDP endpoint, the interactive-mode switch, and the four
 * frame-capture knobs (quality / interval / max width × height), persisted in
 * better-sidebar's `pluginSettings['dsh-sidebar-cdp-browser:live']`.
 *
 * The row chrome mirrors better-sidebar's own secondary-settings popup rows
 * (l2 hairline card, 12px radius, layer-3 fill, 36×20 switch, compact numeric
 * inputs) so this panel reads as one design language with the other
 * sidebar-content feature panels. Number rows follow the same discipline as
 * dsh-sidebar-vscode's cap rows: the input shows the EFFECTIVE value at rest
 * (the stored override, else the host-served effective value — loader config
 * merged with overrides — else the code default), out-of-range drafts flag
 * live, and blur/Enter commits the clamped value only when it changed.
 *
 * @module dsh-sidebar-cdp-browser/client/settings
 */
import type { SidebarSettingsRenderProps } from 'dsh-better-sidebar/client/service';
import { type FrameFieldOverrides } from '../frame-settings.ts';
export interface LiveViewSettings {
    endpoint: string;
    interactive: boolean;
    /** Only the EXPLICIT frame overrides this panel stored; absent keys fall
     * back to the loader config (the host merges — see frame-settings.ts). */
    frame: FrameFieldOverrides;
}
/** Empty endpoint = the default loopback address (the host normalizes). */
export declare function readSettings(value: Record<string, unknown> | undefined): LiveViewSettings;
export declare function SettingsPanel(props: SidebarSettingsRenderProps): import("react").JSX.Element;
