import { Config, type CdpLiveConfig } from './config.ts';
import { HTTP_ROUTES, type HttpRequest, type HttpResponse } from './routes/http.ts';
import { WEBSOCKET_ROUTE, type UpgradeRequest, type UpgradeSocket } from './routes/websocket.ts';
export declare const name = "dsh-sidebar-cdp-browser";
export declare const inject: string[];
export { Config };
/** The better-sidebar tab descriptor id whose pluginSettings blob holds the UI endpoint. */
export declare const LIVE_TAB_ID = "dsh-sidebar-cdp-browser:live";
export interface CdpLiveHostContext {
    webServer: {
        register(route: {
            kind: 'exact' | 'prefix';
            path: string;
            handler: (req: HttpRequest, res: HttpResponse) => void | Promise<void>;
        }): () => void;
        registerUpgrade(route: {
            path: string;
            handler: (req: UpgradeRequest, socket: UpgradeSocket, head: Uint8Array) => void;
        }): () => void;
    };
    sessions: {
        get(id: string): unknown;
    };
    webRuntime: {
        trustedHosts: readonly string[];
    };
    effect(fn: () => void | (() => void), label?: string): void;
    /**
     * Deferred service injection (cordis `ctx.inject`): the body mounts once the
     * named services are available. Used for the optional DSH settings service —
     * without it the endpoint stays at the UI default.
     */
    inject?(names: readonly string[], body: (ctx: {
        settings: {
            get(ns: string): unknown;
        };
    }) => void): unknown;
    /** Scoped event listener (cordis `ctx.on`); disposed with the calling fiber. */
    on?(event: string, listener: (...args: unknown[]) => void): unknown;
    /** Host logger (the DSH Context carries one); failures are console-logged when absent. */
    logger?: {
        warn(message: string, ...args: unknown[]): void;
    };
}
export declare function apply(ctx: CdpLiveHostContext, rawConfig?: CdpLiveConfig): void;
export type { CdpLiveConfig, ResolvedCdpLiveConfig } from './config.ts';
export { DEFAULT_CDP_ENDPOINT, normalizeCdpEndpoint } from './config.ts';
export { HTTP_ROUTES, WEBSOCKET_ROUTE };
export { createHttpHandlers, createTicketRegistry } from './routes/http.ts';
export { createCdpWebSocketRoute } from './routes/websocket.ts';
export { isTrustedRequest } from './trust-fence.ts';
