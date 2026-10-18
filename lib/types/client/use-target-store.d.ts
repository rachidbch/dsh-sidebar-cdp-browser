import type { TargetDescriptor, TargetKey } from './cdp-api.ts';
export interface TargetStore {
    targets: TargetDescriptor[];
    selectedKey?: TargetKey;
    selected?: TargetDescriptor;
    replace(targets: TargetDescriptor[]): void;
    remove(key: TargetKey): void;
    select(key: TargetKey): void;
}
export declare function useTargetStore(initialKey?: TargetKey): TargetStore;
