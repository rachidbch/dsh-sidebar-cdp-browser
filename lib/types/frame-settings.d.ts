/**
 * The frame-capture knobs the web UI exposes ("设置 → 侧边卡片 → 侧边栏内容 →
 * CDP实时视图"): one spec table shared by the host config schemas, the
 * UI-override reader, and the settings panel. Import-free on purpose — the
 * client bundle (browser-pure, Node builtins rejected at build time) and the
 * host bundle both value-import this module.
 *
 * @module dsh-sidebar-cdp-browser/frame-settings
 */
/** The four frame-capture keys adjustable from the web UI. */
export type FrameFieldKey = 'frameQuality' | 'frameEveryNth' | 'frameMaxWidth' | 'frameMaxHeight';
/** One frame field: pluginSettings key, allowed integer range, code default. */
export interface FrameFieldSpec {
    readonly key: FrameFieldKey;
    readonly min: number;
    readonly max: number;
    readonly def: number;
}
/**
 * The single source of truth for the frame-field ranges and defaults:
 * `config.ts` builds its zod / schemastery schemas from this table, and the
 * settings panel mirrors the same bounds in its inputs — they can never
 * drift apart.
 */
export declare const FRAME_FIELD_SPECS: readonly FrameFieldSpec[];
/** All four values resolved (loader config / effective capture params). */
export type FrameFieldValues = Record<FrameFieldKey, number>;
/** Only the keys explicitly set by the web UI (absent = use the base value). */
export type FrameFieldOverrides = Partial<FrameFieldValues>;
/** The code defaults as a complete value set. */
export declare function defaultFrameValues(): FrameFieldValues;
/**
 * Extract the VALID frame overrides from an arbitrary blob (the better-sidebar
 * pluginSettings document): junk — non-numbers, non-integers, out-of-range —
 * is silently ignored, so a corrupted doc can never poison the capture
 * params (the base value survives instead).
 */
export declare function readFrameOverrides(raw: unknown): FrameFieldOverrides;
/**
 * UI-over-_base precedence: each override that is still valid wins over the
 * base (loader-config) value; everything else keeps the base. Called at
 * screencast start, so a settings write applies without a plugin reload.
 */
export declare function resolveFrameValues(base: FrameFieldValues, overrides: FrameFieldOverrides): FrameFieldValues;
/** Value equality over all four keys (change detection for the restart nudge). */
export declare function sameFrameValues(a: FrameFieldValues, b: FrameFieldValues): boolean;
