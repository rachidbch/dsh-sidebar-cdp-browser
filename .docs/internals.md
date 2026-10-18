# Internals

Host half registers three routes: `POST /dsh-cdp-live/api/open` (ticket, 30s TTL), `GET /dsh-cdp-live/api/config`, and the `WS /sidebar/ws/cdp-live` upgrade. The client half is a better-sidebar tab that draws `Page.startScreencast` JPEG frames on a canvas and sends `Input.*` back.

Failure signatures seen here:
- `400` from `/config` with no body = the route handler threw; host-webserver swallows it.
- `401` on the WS = no ticket, which is correct.
- `failed to import: Cannot find package 'schemastery'` = a linked package with no own `node_modules`.
