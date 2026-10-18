# Internals

Host half registers `POST /dsh-cdp-live/api/open` (one-time ticket, 30s TTL), `GET /dsh-cdp-live/api/config`, and the `WS /sidebar/ws/cdp-live` upgrade. The client half is a better-sidebar tab that paints `Page.startScreencast` JPEG frames on a canvas and sends `Input.*` back.

The stream does not start on `ready`. The client must send `screencast.start` with a target key first, or the socket stays silent.

Diagnosing a blank panel, in order:
- `401` on the WS upgrade = no ticket, which is correct.
- `200` on `/api/open` but no frames = the client never sent `screencast.start`.
- `400` on `/config` with an empty body = the route handler threw; host-webserver turns a thrown handler into a bare 400.

## A client change needs a DSH restart AND a browser hard refresh

`lib/client.js` is handed to the page by the DSH process at start, once. Editing the file afterwards changes nothing: the panel re-mount reuses the already-loaded script, so a "close the tab and reopen it" test proves nothing about a client change. Sequence observed 2026-10-18: DSH booted 18:39, the bundle was edited at 19:14, and the panel still showed pre-edit behaviour until a restart.

To verify a client change: edit, `systemctl restart dsh.service`, then hard-refresh the page (Ctrl+Shift+R) so the browser cache drops the old bundle too. A host-half change needs only the restart.
