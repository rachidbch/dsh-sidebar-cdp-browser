import type { FrameMetadata } from './cdp-api.ts';
import { type DrawRect } from './geometry.ts';
export interface RenderedFrame {
    targetKey: string;
    sequence: number;
    blob: Blob;
    metadata?: FrameMetadata;
    mimeType?: string;
    receivedAt: number;
}
export interface FrameRenderer {
    draw(canvas: HTMLCanvasElement, frame: RenderedFrame): Promise<DrawRect | null>;
    dispose(): void;
}
export declare function createFrameRenderer(): FrameRenderer;
