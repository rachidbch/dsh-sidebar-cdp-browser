import type { KeyInput, MouseInput } from './cdp-api.ts';
import { type RenderedFrame } from './frame-renderer.ts';
export declare function LiveCanvas(props: {
    frame?: RenderedFrame;
    interactive: boolean;
    sendMouse(input: MouseInput, frameId?: number): boolean;
    sendKey(input: KeyInput): boolean;
    sendText(text: string): boolean;
}): import("react").JSX.Element;
