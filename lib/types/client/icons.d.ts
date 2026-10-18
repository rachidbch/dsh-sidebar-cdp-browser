/**
 * Icon glyphs for the CDP live view chrome.
 *
 * These are copied verbatim from `@deepseek-ai/dsh-client-ui-primitives`
 * (the `ic_ds_*` figma extracts, fill="currentColor") so the toolbar matches
 * the built-in better-sidebar browser visually — pixel-identical glyphs, same
 * token-driven sizing. They are inlined rather than imported because the
 * client purity gate forbids value-importing `@deepseek-ai/*` packages from
 * a plugin bundle (types only); a runtime dependency on the host UI package
 * would also couple this plugin to the host's module seed.
 */
import type { ReactNode } from 'react';
export interface IconProps {
    size?: number;
    className?: string;
}
/** ic_ds_chevron_left_outline_14 — back. */
export declare const IconChevronLeftOutline14: ({ size, className }: IconProps) => ReactNode;
/** ic_ds_chevron_right_outline_14 — forward. */
export declare const IconChevronRightOutline14: ({ size, className }: IconProps) => ReactNode;
/** ic_ds_refresh_outline_14 — reload. */
export declare const IconRefreshOutline14: ({ size, className }: IconProps) => ReactNode;
/** ic_ds_link_outline_14 — go (same glyph the built-in sidebar browser uses for its go button). */
export declare const IconLinkOutline14: ({ size, className }: IconProps) => ReactNode;
/** ic_ds_plus_outline_16 — new tab. */
export declare const IconPlusOutline16: ({ size, className }: IconProps) => ReactNode;
/** ic_ds_close_fill_14 — close tab (same glyph the better-sidebar tab bar uses). */
export declare const IconCloseFill14: ({ size, className }: IconProps) => ReactNode;
