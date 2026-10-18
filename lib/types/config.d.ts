import s from 'schemastery';
/**
 * The single CDP endpoint model: no profile list, no host-side
 * endpoint declaration. The address lives in the web UI ("设置 → 侧边卡片 →
 * 侧边栏内容 → CDP实时视图"), persisted in better-sidebar's prefs document
 * under `pluginSettings['dsh-sidebar-cdp-browser:live'].endpoint`. An empty value
 * falls back to {@link DEFAULT_CDP_ENDPOINT}.
 *
 * The four frame-capture fields live in that same UI document and override
 * the loader values here per key (see frame-settings.ts); the loader config
 * stays the deployment default.
 */
export declare const DEFAULT_CDP_ENDPOINT = "http://127.0.0.1:9222";
/**
 * Normalize a raw endpoint string into a URL the host can dial: empty (or
 * non-string) → the default loopback address; a bare `host:port` gets an
 * `http://` scheme prefix; anything else must already be a valid http(s)/ws(s)
 * URL. Credentials are rejected (the CDP dial path has no auth support).
 * There is deliberately NO loopback/remote gate — the address is fully
 * operator-controlled from the web UI.
 */
export declare function normalizeCdpEndpoint(raw: unknown): string;
export interface CdpLiveConfig {
    ticketTtlMs?: number;
    connectTimeoutMs?: number;
    frameQuality?: number;
    frameMaxWidth?: number;
    frameMaxHeight?: number;
    frameEveryNth?: number;
    bufferedAmountSoftLimit?: number;
    bufferedAmountHardLimit?: number;
}
export interface ResolvedCdpLiveConfig {
    ticketTtlMs: number;
    connectTimeoutMs: number;
    frameQuality: number;
    frameMaxWidth: number;
    frameMaxHeight: number;
    frameEveryNth: number;
    bufferedAmountSoftLimit: number;
    bufferedAmountHardLimit: number;
}
/** DSH Loader configuration schema (runtime tuning only — the endpoint is a UI setting). */
export declare const Config: s<CdpLiveConfig>;
export declare function resolveCdpLiveConfig(value?: unknown): ResolvedCdpLiveConfig;
