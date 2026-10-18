import { EventEmitter } from 'node:events';
import type { CdpSessionAdapter } from './browser-adapter.js';
import type { TargetKey } from './types.js';
import { TargetRegistry } from './target-registry.js';
export declare class TargetController extends EventEmitter {
    #private;
    constructor(registry: TargetRegistry);
    has(key: TargetKey): boolean;
    attach(key: TargetKey): Promise<CdpSessionAdapter>;
    session(key: TargetKey): Promise<CdpSessionAdapter>;
    withSession<T>(key: TargetKey, operation: (session: CdpSessionAdapter) => Promise<T>): Promise<T>;
    /**
     * Best-effort teardown (the v0.1.2 fix for the remotely-closed-tab
     * crash): once this resolves, the controller no longer tracks a session
     * for `key`. A target the remote browser already tore down rejects the
     * pending attach — or the session's own detach() — and both mean the
     * teardown goal is ALREADY met, so they are swallowed here. Never
     * rejecting is what makes the fire-and-forget detach from the registry's
     * 'closed' event safe: a rejection there would surface as an unhandled
     * rejection and take the host process down with it.
     */
    detach(key: TargetKey): Promise<void>;
    close(): Promise<void>;
}
