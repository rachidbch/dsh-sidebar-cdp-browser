import { EventEmitter } from 'node:events';
import type { BrowserAdapter } from './browser-adapter.js';
import { InputController } from './input-controller.js';
import { LeaseManager } from './lease-manager.js';
import { ScreencastController } from './screencast-controller.js';
import { TargetController } from './target-controller.js';
import { TargetRegistry, type TargetRegistryOptions } from './target-registry.js';
import type { TargetKey } from './types.js';
export type BrowserConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'closed';
export interface BrowserConnectionManagerOptions {
    connect: () => Promise<BrowserAdapter>;
    targetRegistry?: TargetRegistryOptions;
    leases?: LeaseManager;
    /**
     * How often (ms) to re-read target titles/urls into the registry; 0
     * disables the poll. Default 1000. Title-only updates never arrive as
     * puppeteer events (see TargetRegistry.refresh), so the poll is what keeps
     * tab titles live.
     */
    targetInfoPollMs?: number;
}
/** Composition root for one browser connection generation. */
export declare class BrowserConnectionManager extends EventEmitter {
    #private;
    readonly registry: TargetRegistry;
    readonly leases: LeaseManager;
    constructor(options: BrowserConnectionManagerOptions);
    get state(): BrowserConnectionState;
    get connected(): boolean;
    get targets(): TargetController;
    get screencast(): ScreencastController;
    get input(): InputController;
    /**
     * Create a new page target and return its registry key. `newPage()` already
     * waits for the target to appear + initialize, so the registry entry exists
     * by the time it resolves; the short poll is a belt-and-braces guard against
     * event-ordering surprises, not an expected wait.
     */
    createTarget(): Promise<TargetKey>;
    /**
     * Close a target: detach any session we hold first, then close it remotely.
     * The last remaining tab is refused — Chromium exits when its last target
     * closes, which would kill the browser for every viewer of this endpoint
     * (and leave the endpoint dead until the remote is restarted).
     */
    closeTarget(key: TargetKey): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    close(): Promise<void>;
    /** On-demand refresh (navigation nudge): fetch + apply immediately. */
    refreshTargetInfoNow(): Promise<void>;
}
