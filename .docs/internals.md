# Internals

Host half registers `POST /dsh-cdp-live/api/open` (one-time ticket, 30s TTL), `GET /dsh-cdp-live/api/config`, and the `WS /sidebar/ws/cdp-live` upgrade. The client half is a better-sidebar tab that paints `Page.startScreencast` JPEG frames on a canvas and sends `Input.*` back.

The stream does not start on `ready`. The client must send `screencast.start` with a target key first, or the socket stays silent.

Diagnosing a blank panel, in order:
- `401` on the WS upgrade = no ticket, which is correct.
- `200` on `/api/open` but no frames = the client never sent `screencast.start`.
- `400` on `/config` with an empty body = the route handler threw; host-webserver turns a thrown handler into a bare 400.
