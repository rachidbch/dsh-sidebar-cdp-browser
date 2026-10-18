import { type WebSocket } from 'ws';
import type { TicketClaims, TicketRegistry } from './http.ts';
export interface CdpSession {
    attach(claims: TicketClaims, ws: WebSocket): Promise<void> | void;
    close(): Promise<void> | void;
}
export interface UpgradeRequest {
    url?: string;
    headers: Record<string, string | string[] | undefined>;
}
export interface UpgradeSocket {
    write(chunk: string): boolean;
    destroy(): void;
}
export declare function createCdpWebSocketRoute(tickets: TicketRegistry, session: CdpSession, trustedHosts?: readonly string[]): {
    path: string;
    handle(req: UpgradeRequest, socket: UpgradeSocket, head: Uint8Array): void;
    close(): Promise<void>;
};
export declare const WEBSOCKET_ROUTE: "/sidebar/ws/cdp-live";
