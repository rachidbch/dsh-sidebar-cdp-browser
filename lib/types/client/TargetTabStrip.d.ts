import type { TargetDescriptor } from './cdp-api.ts';
/**
 * Remote browser tabs, styled after the better-sidebar tab bar: one row of
 * title tabs (active tab highlighted, title truncated with the URL as the
 * tooltip), a close button per tab, and a trailing "+" that opens a new tab —
 * the close/new controls only render while the session allows interaction.
 */
export declare function TargetTabStrip(props: {
    targets: TargetDescriptor[];
    selectedKey?: string;
    canClose?: boolean;
    canCreate?: boolean;
    disabled?: boolean;
    onSelect(key: string): void;
    onClose(key: string): void;
    onCreate(): void;
}): import("react").JSX.Element;
