import type { ConnectionState } from './cdp-api.ts';
/**
 * The runtime arm switch shown in the title bar, LEFT of the connection
 * status: keyboard/mouse control stays off until it is explicitly checked,
 * even when the plugin's "interactive input" setting is on. `enabled` is
 * false while that master setting is off — then the box renders unchecked
 * and grayed out (see SidebarCdpBrowser for the mode wiring).
 */
export interface RemoteControlToggle {
    enabled: boolean;
    checked: boolean;
    onChange(next: boolean): void;
}
export declare function ConnectionToolbar(props: {
    state: ConnectionState;
    error?: string;
    onReconnect(): void;
    remoteControl: RemoteControlToggle;
}): import("react").JSX.Element;
