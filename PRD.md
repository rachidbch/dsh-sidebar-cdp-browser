# PRD

Local fork of `dsh-sidebar-cdp-browser` (upstream: chendefine), based on v0.1.2.

## Why we forked

Project a headless Chromium into DSH's right sidebar as a live canvas, so the human and the agent watch the same browser.

## Scope of our divergence

- Mount on DSH 0.2.x: the upstream peer range names a webserver 0.1.x, and its inject list names `webRuntime`, a service removed in 0.2.x.
- Fail soft when sidebar prefs are unreadable, so the config route keeps answering.

## Non-goals

- Changing the CDP protocol or the tab UI.
