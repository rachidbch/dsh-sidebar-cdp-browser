import { type Ref } from 'react';
/**
 * Navigation chrome, styled after the built-in better-sidebar browser bar:
 * circular token-driven icon buttons (chevrons / refresh / link-go) around a
 * single-line address input — same glyphs and same spacing rhythm.
 *
 * Edit ownership uses a dirty ref, NOT blur: clicking 前往 blurs the input
 * BEFORE the click fires, so an onBlur re-sync would clobber the typed URL
 * back to the current page's URL and navigate to the OLD address (the exact
 * bug fixed here). The input keeps the user's text across blur and only
 * re-syncs when a navigation actually changes the URL (dirty=false by then);
 * Escape abandons the edit explicitly. The parent remounts this component
 * per target switch (key=targetKey), which also resets any stale edit.
 */
export declare function BrowserToolbar(props: {
    url?: string;
    disabled?: boolean;
    /** Allows the parent to focus the address bar (e.g. right after opening a new tab). */
    inputRef?: Ref<HTMLInputElement>;
    onNavigate(url: string): void;
    onBack(): void;
    onForward(): void;
    onReload(): void;
}): import("react").JSX.Element;
