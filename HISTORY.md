# HISTORY

2026-10-18 — Forked at v0.1.2; peer widened, webRuntime dropped, settings reads hardened. ADR-001, ADR-002.
2026-10-18 — Wheel input fixed in the sidebar panel: a wheel over the letterbox bar was dropped (null mapping) and the canvas listener missed wheels when an overlay sat above it. Now clamps to the page and also listens on window in capture phase.
2026-10-18 — Fit-to-pane: the panel no longer letterboxes the page. It fits the page WIDTH (so a wide fullscreen pane gets a larger page, not black bars) and the canvas grows to the scaled page height, clipped by the viewport, so page scrolling still reaches every part.
