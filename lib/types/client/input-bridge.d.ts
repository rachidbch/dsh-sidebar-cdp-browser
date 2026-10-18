import type { KeyInput, MouseInput } from './cdp-api.ts';
import { type DrawRect, type Size } from './geometry.ts';
export interface InputBridgeOptions {
    canvas: HTMLCanvasElement;
    frameSize(): Size;
    frameId(): number | undefined;
    drawRect(): DrawRect | null;
    sendMouse(input: MouseInput, frameId?: number): boolean;
}
export declare function attachInputBridge(options: InputBridgeOptions): () => void;
declare const KEYBOARD_EVENT_SHAPE: {
    key: string;
    code: string;
    repeat: string;
    altKey: string;
    ctrlKey: string;
    metaKey: string;
    shiftKey: string;
};
/** The subset of KeyboardEvent the mapper reads (plain object testable). */
export type KeyboardEventLike = {
    [K in keyof typeof KEYBOARD_EVENT_SHAPE]?: unknown;
};
/** Map a DOM keyboard event to the CDP key input. Printable keys carry `text`
 *  so the page's own input pipeline produces the character (the Puppeteer
 *  `keyboard.type` semantics); Ctrl/Meta combos suppress text — they are
 *  shortcuts, not typing. */
export declare function mapKeyboardEvent(event: KeyboardEventLike, type: 'keyDown' | 'keyUp', keyCodeOf?: (event: KeyboardEventLike) => number | undefined): KeyInput;
export interface KeyboardBridgeOptions {
    /** A hidden textarea owning IME composition while the view is active. */
    sink: HTMLTextAreaElement;
    /** Whether the live view currently owns keyboard input (view focused/active). */
    enabled(): boolean;
    sendKey(input: KeyInput): boolean;
    sendText(text: string): boolean;
}
/**
 * Bridge keyboard input to CDP through two cooperating paths:
 *
 * 1. CAPTURE-PHASE WINDOW LISTENERS for keydown/keyup. This is the v0.1.1
 *    fix for the v0.1.0 "cannot type" bug: the hidden sink's programmatic focus is fragile
 *    (browsers may refuse or immediately move focus for a 1px,
 *    pointer-events:none textarea inside an overflow-hidden container, and the
 *    click itself re-targets focus to the canvas). A capture listener on
 *    `window` fires regardless of what element holds focus, so as long as the
 *    view is marked active (clicked, and no other DSH input owns the event)
 *    the keys flow. Events whose TARGET is an INPUT/TEXTAREA/SELECT or a
 *    contenteditable element are skipped, so typing into the DSH chat box or
 *    the sidebar's own fields never leaks into the remote page.
 *
 * 2. THE HIDDEN SINK for IME composition and paste only — the one thing that
 *    genuinely requires real focus. The view re-asserts focus on the sink at
 *    every canvas pointerdown (the keyboard claim) instead of relying on any
 *    earlier focus call surviving.
 *
 * - plain printable keys → keyDown/keyUp with `text` (page-side input pipeline);
 * - Ctrl/Meta shortcuts → keyDown/keyUp without text;
 * - IME → native composition in the sink; compositionend → one insertText;
 * - paste → the sink's paste event (browser-mediated clipboard) → insertText;
 * - blur / disable releases every still-pressed key (no stuck keys).
 */
export declare function attachKeyboardBridge(options: KeyboardBridgeOptions): () => void;
export {};
