import { type ConnectionState, type LiveViewCommand, type ServerMessage } from './cdp-api.ts';
import type { RenderedFrame } from './frame-renderer.ts';
export interface UseCdpSocketOptions {
    sessionId: string;
    mode: 'observe' | 'interactive';
    enabled: boolean;
    targetKey?: string;
    onMessage?(message: ServerMessage): void;
    onFrame?(frame: RenderedFrame): void;
}
export interface CdpSocket {
    state: ConnectionState;
    error?: string;
    reconnect(): void;
    send(command: LiveViewCommand): boolean;
}
export declare function useCdpSocket(options: UseCdpSocketOptions): CdpSocket;
