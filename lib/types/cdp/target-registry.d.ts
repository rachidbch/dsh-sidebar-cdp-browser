import { EventEmitter } from 'node:events';
import type { BrowserAdapter, BrowserTargetAdapter } from './browser-adapter.js';
import type { TargetDescriptor, TargetKey } from './types.js';
export interface TargetRegistryOptions {
    include?: (target: BrowserTargetAdapter) => boolean;
    now?: () => number;
}
export declare class TargetRegistry extends EventEmitter {
    #private;
    constructor(options?: TargetRegistryOptions);
    bind(browser: BrowserAdapter): Promise<void>;
    unbind(): void;
    list(options?: {
        includeClosed?: boolean;
    }): TargetDescriptor[];
    resolve(key: TargetKey): BrowserTargetAdapter;
    describe(key: TargetKey): TargetDescriptor | undefined;
    /** The opaque key assigned to a live adapter, once it has been upserted. */
    keyOf(target: BrowserTargetAdapter): TargetKey | undefined;
    /**
     * Re-read the live title/url/type of every tracked target and emit one
     * 'changed' when anything moved.
     *
     * Needed because puppeteer's browser-level 'targetchanged' event only
     * fires when the URL changes: a title-only TargetInfo update (the normal
     * "page finished loading and set its title" moment) updates the adapter's
     * internal state but is never forwarded. The freshest title is therefore
     * already sitting on the adapter — it just has to be re-read. Pure memory
     * reads, no CDP round-trips; driven by the connection manager's poll.
     */
    refresh(): boolean;
    markAttached(key: TargetKey, attached: boolean): void;
    emit(event: 'changed', targets: TargetDescriptor[]): boolean;
    emit(event: 'closed', target: TargetDescriptor): boolean;
    on(event: 'changed', listener: (targets: TargetDescriptor[]) => void): this;
    on(event: 'closed', listener: (target: TargetDescriptor) => void): this;
}
