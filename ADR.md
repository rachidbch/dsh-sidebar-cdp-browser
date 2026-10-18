# ADR

## ADR-001: Drop `webRuntime` instead of shimming it
Status: accepted (2026-10-18)
Context: The plugin injected `webRuntime` for its `trustedHosts` list; that service has zero references in DSH 0.2.1-rc.2, so the plugin never mounted.
Decision: Inject only `webServer` and `sessions`, and pass an empty trusted-hosts list.
Consequences: Mounts again. Trust stays loopback-only; a remote deployment would need its own authority list.

## ADR-002: Peer range widened, not pinned
Status: accepted (2026-10-18)
Context: `dsh-host-webserver ^0.1.0-rc.6` excludes 0.2.1-rc.2, but the three APIs used (`register`, `registerUpgrade`, `sessions.get`) are unchanged.
Decision: Declare `^0.1.0-rc.6 || ^0.2.1-rc.1`.
Consequences: Installs without an exemption; a future breaking change in those APIs would need a real fix.
