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

## Deferred to ROADMAP.md

Fit-to-pane and cursor mirroring moved there: they are product decisions still open, not tasks in flight.
