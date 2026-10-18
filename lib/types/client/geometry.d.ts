import type { FrameMetadata } from './cdp-api.ts';
export interface Size {
    width: number;
    height: number;
}
export interface Point {
    x: number;
    y: number;
}
export interface DrawRect extends Point, Size {
    scale: number;
}
export declare function frameSize(metadata: FrameMetadata | undefined, fallback: Size): Size;
export declare function containRect(container: Size, content: Size): DrawRect;
export declare function clientToFrame(client: Point, bounds: DOMRect, draw: DrawRect, frame: Size): Point | null;
