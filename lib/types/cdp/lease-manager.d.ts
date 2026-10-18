import { EventEmitter } from 'node:events';
import type { Lease, LeaseId, TargetKey } from './types.js';
export interface LeaseManagerOptions {
    minTtlMs?: number;
    maxTtlMs?: number;
    now?: () => number;
}
export declare class LeaseManager extends EventEmitter {
    #private;
    constructor(options?: LeaseManagerOptions);
    acquire(targetKey: TargetKey, owner: string, ttlMs: number): Lease;
    renew(id: LeaseId, ttlMs: number, owner?: string): Lease;
    assert(id: LeaseId, targetKey?: TargetKey, owner?: string): Lease;
    release(id: LeaseId, owner?: string): boolean;
    revokeTarget(targetKey: TargetKey): void;
    revokeOwner(owner: string): void;
    clear(): void;
}
