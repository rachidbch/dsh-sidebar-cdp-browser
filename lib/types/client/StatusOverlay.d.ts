import type { ConnectionState } from './cdp-api.ts';
export declare function StatusOverlay(props: {
    visible: boolean;
    state: ConnectionState;
    hasTarget: boolean;
    hasFrame: boolean;
    error?: string;
    onRetry(): void;
}): import("react").JSX.Element | null;
