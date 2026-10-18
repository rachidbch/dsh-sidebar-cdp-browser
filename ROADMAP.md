# ROADMAP

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

## Wheel: trackpad two-finger scroll and scrollbar dragging do not reach the page

Reported 2026-10-18 on a laptop: a two-finger trackpad gesture scrolls every other pane but not the Agent Browser, and dragging the panel's scrollbar does nothing.

Why this survives the wheel fix: a trackpad two-finger gesture usually arrives as a `wheel` event with `deltaMode 0` and small deltas, so it should work now; a scrollbar drag fires no `wheel` event at all, it moves the pane's own scroll container. If the panel's scroll container is what moves, the canvas never sees either gesture.

Two candidate shapes:
- Let the pane scroll and translate that scroll offset into page scroll (the canvas already knows its draw rect, so the offset is measurable).
- Disable the pane's own scrolling for the live canvas so the gesture has nowhere else to go, and forward `wheel` only.

Needs a client change plus a real trackpad to verify; a headless test cannot produce a trackpad gesture.
