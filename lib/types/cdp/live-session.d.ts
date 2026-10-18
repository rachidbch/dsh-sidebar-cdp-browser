import type { WebSocket } from 'ws';
import type { ResolvedCdpLiveConfig } from '../config.ts';
import { type FrameFieldOverrides, type FrameFieldValues } from '../frame-settings.ts';
import type { TicketClaims } from '../routes/http.ts';
import { EndpointManager } from './endpoint-manager.ts';
export interface LiveCdpSession {
    attach(claims: TicketClaims, socket: WebSocket): Promise<void> | void;
    close(): Promise<void>;
}
/**
 * Where the frame-capture overrides come from: the web-UI settings document
 * (read lazily, so a commit applies without a plugin reload). Absent keys
 * fall back to the loader config; see frame-settings.ts.
 */
export type FrameSource = () => FrameFieldOverrides;
export declare class CdpLiveSession implements LiveCdpSession {
    #private;
    constructor(config: ResolvedCdpLiveConfig, endpoints?: EndpointManager, frameSource?: FrameSource);
    /** The frame-capture params a NEW screencast would start with right now. */
    get frameConfig(): FrameFieldValues;
    /**
     * The CDP endpoint setting changed: close every attached client so they
     * re-open a ticket and land on a fresh connection to the new address. The
     * client's reconnect loop (with backoff) does the rest.
     */
    restart(reason: string): void;
    attach(claims: TicketClaims, ws: WebSocket): Promise<void>;
    close(): Promise<void>;
}
