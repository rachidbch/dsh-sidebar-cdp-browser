import { type ResolvedCdpLiveConfig } from '../config.ts';
import { BrowserConnectionManager } from './browser-connection-manager.ts';
export interface ManagedConnection {
    endpoint: string;
    manager: BrowserConnectionManager;
    generation: string;
}
/**
 * Where the live endpoint comes from: the raw (possibly empty) string stored
 * in the web UI setting. Empty resolves to the default loopback address —
 * see {@link normalizeCdpEndpoint}. Read lazily at connect time so a settings
 * write is picked up without restarting the plugin.
 */
export type EndpointSource = () => string;
/** The single implicit CDP connection: one endpoint, dialed on demand. */
export declare class EndpointManager {
    #private;
    constructor(config: ResolvedCdpLiveConfig, source?: EndpointSource);
    /** The endpoint a NEW connection would use right now (normalized). */
    get endpoint(): string;
    ready(): boolean;
    get(): Promise<ManagedConnection>;
    /**
     * React to a settings commit: if the effective endpoint moved, dispose the
     * current connection so the next attach dials the new address. Returns
     * whether the endpoint actually changed.
     */
    applyEndpointChange(): Promise<boolean>;
    close(): Promise<void>;
}
