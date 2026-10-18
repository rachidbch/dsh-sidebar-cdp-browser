import type { FrameFieldValues } from '../frame-settings.ts';
export interface HttpRequest {
    method?: string;
    url?: string;
    headers: Record<string, string | string[] | undefined>;
    [Symbol.asyncIterator](): AsyncIterator<string | Uint8Array>;
}
export interface HttpResponse {
    writeHead(status: number, headers?: Record<string, string>): void;
    end(body?: string | Uint8Array): void;
}
export interface OpenRequest {
    sessionId: string;
    mode: 'observe' | 'interactive';
}
export interface TicketClaims extends OpenRequest {
    issuedAt: number;
    expiresAt: number;
}
export interface TicketRegistry {
    issue(input: OpenRequest): {
        ticket: string;
        expiresAt: number;
    };
    consume(ticket: string): TicketClaims | undefined;
    revoke(ticket: string): boolean;
    clear(): void;
}
export declare function createTicketRegistry(ttlMs: number, now?: () => number): TicketRegistry;
export interface HttpRouteDeps {
    tickets: TicketRegistry;
    hasSession(sessionId: string): boolean;
    /**
     * The frame-capture values in effect RIGHT NOW (loader config merged with
     * the web-UI overrides) — served to the settings panel so unset fields
     * display the real effective value, never a misleading code default.
     */
    frameConfig(): FrameFieldValues;
}
export declare function createHttpHandlers(deps: HttpRouteDeps, trustedHosts?: readonly string[]): {
    open(req: HttpRequest, res: HttpResponse): Promise<void>;
    /** Read-only: the effective frame-capture config for the settings panel. */
    config(req: HttpRequest, res: HttpResponse): Promise<void>;
};
export declare const HTTP_ROUTES: {
    readonly open: "/dsh-cdp-live/api/open";
    readonly config: "/dsh-cdp-live/api/config";
};
