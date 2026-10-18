/**
 * Locale integration: registers the zh/en dictionaries with the DSH locale
 * service (via the client context's `locale` face) and serves `t()` from the
 * active locale. `t()` is a plain function over a module-level service
 * handle — React re-renders pick new copy up through the app-wide locale
 * re-render; the tab title and settings rows use `() => t(...)` callbacks so
 * their re-renders read fresh values.
 *
 * The active locale follows the DSH i18n system (the host-backed
 * `locale.preference` setting) rather than the raw browser language; the
 * browser language is only the pre-service fallback.
 *
 * @module dsh-sidebar-cdp-browser/client/i18n
 */
import { type LocaleKey } from './locales.ts';
/** One supported dictionary locale id. */
export type LocaleId = 'zh' | 'en';
/** The locale service face (structural subset of the better-sidebar context
 *  mirror of @deepseek-ai/dsh-client-locale). */
export interface LocaleServiceFace {
    /** Registers one locale's dictionary; returns an unregister disposer when
     *  the real service provides one (void-tolerant for foreign shapes). */
    register(ns: string, locale: string, dict: Record<string, string>): unknown;
    /** The active locale snapshot (`active` is 'zh' | 'en' today). */
    getSnapshot(): {
        active: string;
    };
}
/** The active locale id: the service snapshot, else the browser language. */
export declare function activeLocale(): string;
/** Translate one copy key in the active locale (zh* → zh, else en). */
export declare function t(key: LocaleKey): string;
/** Localize a WebSocket close event into UI copy. */
export declare function closingMessage(code: number, reason: string): string;
/**
 * Wire the dictionaries to the service (called once from the plugin body).
 * @returns the disposer cordis holds via `ctx.effect`: unregisters the
 * dictionaries (each service disposer, when returned) and drops the
 * module-level service handle.
 */
export declare function attachLocale(service: LocaleServiceFace): () => void;
