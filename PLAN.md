# PLAN

## Done

1. Fork at v0.1.2, remotes split (origin ours, upstream OG).
2. Widen webserver peer to 0.2.x; drop `webRuntime` from inject; harden settings reads.

## Next

3. Confirm the tab renders frames in the sidebar (human check).
4. Offer both patches upstream.

## Open defect: the panel goes stale after navigation

Reproduced 2026-10-18. The tab paints on open; after the agent navigates the same target to another URL, the panel keeps the old page until the user closes and reopens it.

What is already excluded:
- The server sees the new URL. Reading the plugin's own target list over `WS /sidebar/ws/cdp-live` returns `http://127.0.0.1:4180/` first, plus `chrome://newtab/`.
- The stream is alive. 470 frames in 8s, ~59 fps, no errors, before the navigation.
- The client did receive `targets.changed` (observed in the frame-counter run).

So the fault is between "client knows the target list changed" and "client repaints the shown target": either it keeps casting the old target key, or it ignores the frame for the new one because the key no longer matches `selected`.

## Fit-to-pane: the letterbox wastes space in fullscreen

Seen 2026-10-18 in fullscreen: a 1440x757 page inside a 1380x700+ pane is drawn with `containRect` (min of both scale ratios), so wide panes leave large black bands left and right while the page itself is fully visible but small.

Options, cheapest first:
- **Fit width, page scrolls.** Scale by `container.width / content.width` only, let the canvas overflow vertically and move the cast rect with scroll. Reclaims the horizontal bands, which is where the waste is.
- **Fit height too, with a zoom control.** Keep `contain`, add a 100%/fit toggle so the human can choose.
- **Reflow the remote page.** Resize the Chromium viewport to the pane ratio through `Emulation.setDeviceMetricsOverride`; best long-term, but it fights the requirement that the viewport matches what the agent sees.

## Cursor: the pointer shows no hover state

The canvas paints JPEG frames, which carry pixels, not a cursor. A hand cursor is drawn by the client for the whole surface, so links and inputs look identical.

Options:
- **Mirror `computedStyle.cursor`.** On `pointermove` (throttled to ~10 Hz), ask the page for `document.elementFromPoint(x, y)` and its computed `cursor`, then set `canvas.style.cursor`. Gives `pointer` over links, `text` over inputs, `default` elsewhere. One extra round trip per sample, and it lags the real hover slightly.
- **Do nothing.** Honest: the human sees the page, just not the pointer semantics.
