import s from "schemastery";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { EventEmitter } from "node:events";
import puppeteer from "puppeteer-core";
import { WebSocketServer } from "ws";
//#region src/frame-settings.ts
/**
* The single source of truth for the frame-field ranges and defaults:
* `config.ts` builds its zod / schemastery schemas from this table, and the
* settings panel mirrors the same bounds in its inputs — they can never
* drift apart.
*/
const FRAME_FIELD_SPECS = [
	{
		key: "frameQuality",
		min: 20,
		max: 90,
		def: 60
	},
	{
		key: "frameEveryNth",
		min: 1,
		max: 30,
		def: 1
	},
	{
		key: "frameMaxWidth",
		min: 320,
		max: 3840,
		def: 1280
	},
	{
		key: "frameMaxHeight",
		min: 240,
		max: 2160,
		def: 900
	}
];
/** Whether one raw number is a valid value for the spec (int, in range). */
function isValid(spec, value) {
	return typeof value === "number" && Number.isInteger(value) && value >= spec.min && value <= spec.max;
}
/**
* Extract the VALID frame overrides from an arbitrary blob (the better-sidebar
* pluginSettings document): junk — non-numbers, non-integers, out-of-range —
* is silently ignored, so a corrupted doc can never poison the capture
* params (the base value survives instead).
*/
function readFrameOverrides(raw) {
	const overrides = {};
	if (raw === null || typeof raw !== "object") return overrides;
	const blob = raw;
	for (const spec of FRAME_FIELD_SPECS) {
		const value = blob[spec.key];
		if (isValid(spec, value)) overrides[spec.key] = value;
	}
	return overrides;
}
/**
* UI-over-_base precedence: each override that is still valid wins over the
* base (loader-config) value; everything else keeps the base. Called at
* screencast start, so a settings write applies without a plugin reload.
*/
function resolveFrameValues(base, overrides) {
	const merged = {};
	for (const spec of FRAME_FIELD_SPECS) {
		const override = overrides[spec.key];
		merged[spec.key] = isValid(spec, override) ? override : base[spec.key];
	}
	return merged;
}
/** Value equality over all four keys (change detection for the restart nudge). */
function sameFrameValues(a, b) {
	return FRAME_FIELD_SPECS.every((spec) => a[spec.key] === b[spec.key]);
}
//#endregion
//#region src/config.ts
/**
* The single CDP endpoint model: no profile list, no host-side
* endpoint declaration. The address lives in the web UI ("设置 → 侧边卡片 →
* 侧边栏内容 → CDP实时视图"), persisted in better-sidebar's prefs document
* under `pluginSettings['dsh-sidebar-cdp-browser:live'].endpoint`. An empty value
* falls back to {@link DEFAULT_CDP_ENDPOINT}.
*
* The four frame-capture fields live in that same UI document and override
* the loader values here per key (see frame-settings.ts); the loader config
* stays the deployment default.
*/
const DEFAULT_CDP_ENDPOINT = "http://127.0.0.1:9222";
const CDP_ENDPOINT_PROTOCOLS = /* @__PURE__ */ new Set([
	"http:",
	"https:",
	"ws:",
	"wss:"
]);
/**
* Normalize a raw endpoint string into a URL the host can dial: empty (or
* non-string) → the default loopback address; a bare `host:port` gets an
* `http://` scheme prefix; anything else must already be a valid http(s)/ws(s)
* URL. Credentials are rejected (the CDP dial path has no auth support).
* There is deliberately NO loopback/remote gate — the address is fully
* operator-controlled from the web UI.
*/
function normalizeCdpEndpoint(raw) {
	const trimmed = typeof raw === "string" ? raw.trim() : "";
	if (trimmed === "") return DEFAULT_CDP_ENDPOINT;
	const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed) ? trimmed : `http://${trimmed}`;
	let url;
	try {
		url = new URL(withScheme);
	} catch {
		throw new Error(`invalid CDP endpoint: ${trimmed}`);
	}
	if (!CDP_ENDPOINT_PROTOCOLS.has(url.protocol)) throw new Error(`unsupported CDP endpoint protocol: ${url.protocol}`);
	if (url.username !== "" || url.password !== "") throw new Error("credentials in CDP endpoint URLs are not supported");
	return url.toString();
}
/**
* Build the four frame-field schema members from the shared spec table
* (frame-settings.ts), so the loader schema, the UI panel inputs, and the
* override reader share one set of ranges/defaults. The mapped-type cast
* keeps the literal keys for zod / schemastery inference.
*/
function frameSchemas(build) {
	const entries = FRAME_FIELD_SPECS.map((spec) => [spec.key, build(spec)]);
	return Object.fromEntries(entries);
}
const RuntimeConfigSchema = z.object({
	ticketTtlMs: z.number().int().min(5e3).max(12e4).default(3e4),
	connectTimeoutMs: z.number().int().min(1e3).max(12e4).default(15e3),
	...frameSchemas((spec) => z.number().int().min(spec.min).max(spec.max).default(spec.def)),
	bufferedAmountSoftLimit: z.number().int().min(65536).max(16777216).default(524288),
	bufferedAmountHardLimit: z.number().int().min(262144).max(67108864).default(4194304),
	trustedHosts: z.array(z.string()).default([])
}).strict();
/** DSH Loader configuration schema (runtime tuning only — the endpoint is a UI setting). */
const Config = s.object({
	ticketTtlMs: s.number().step(1).min(5e3).max(12e4).default(3e4),
	connectTimeoutMs: s.number().step(1).min(1e3).max(12e4).default(15e3),
	...frameSchemas((spec) => s.number().step(1).min(spec.min).max(spec.max).default(spec.def)),
	bufferedAmountSoftLimit: s.number().step(1).min(65536).max(16777216).default(524288),
	bufferedAmountHardLimit: s.number().step(1).min(262144).max(67108864).default(4194304)
}).i18n({
	zh: {
		ticketTtlMs: "一次性 ticket 有效期（毫秒）",
		connectTimeoutMs: "CDP 连接超时（毫秒）",
		frameQuality: "JPEG 画质（20–90；部署默认值，可被 Web UI 覆盖）",
		frameEveryNth: "每 N 帧取 1 帧（1–30；部署默认值，可被 Web UI 覆盖）",
		frameMaxWidth: "帧最大宽度像素（320–3840；部署默认值，可被 Web UI 覆盖）",
		frameMaxHeight: "帧最大高度像素（240–2160；部署默认值，可被 Web UI 覆盖）",
		bufferedAmountSoftLimit: "发送缓冲软上限（字节），超过开始丢帧",
		bufferedAmountHardLimit: "发送缓冲硬上限（字节），超过断开连接（须大于软上限）"
	},
	en: {
		ticketTtlMs: "One-time ticket TTL (ms)",
		connectTimeoutMs: "CDP connection timeout (ms)",
		frameQuality: "JPEG quality (20–90; deployment default, web-UI overridable)",
		frameEveryNth: "Keep 1 of every N frames (1–30; deployment default, web-UI overridable)",
		frameMaxWidth: "Max frame width in pixels (320–3840; deployment default, web-UI overridable)",
		frameMaxHeight: "Max frame height in pixels (240–2160; deployment default, web-UI overridable)",
		bufferedAmountSoftLimit: "Soft send-buffer limit in bytes; frames drop past it",
		bufferedAmountHardLimit: "Hard send-buffer limit in bytes; the connection closes past it (must exceed the soft limit)"
	}
});
function resolveCdpLiveConfig(value = {}) {
	const parsed = RuntimeConfigSchema.parse(value);
	if (parsed.bufferedAmountHardLimit <= parsed.bufferedAmountSoftLimit) throw new Error("bufferedAmountHardLimit must be greater than bufferedAmountSoftLimit");
	return parsed;
}
const targetKeySchema = z.string().min(16).max(256);
const requestIdSchema = z.string().min(1).max(128);
const screencastOptionsSchema = z.object({
	format: z.enum(["jpeg", "png"]).optional(),
	quality: z.number().int().min(20).max(90).optional(),
	maxWidth: z.number().int().positive().max(3840).optional(),
	maxHeight: z.number().int().positive().max(2160).optional(),
	everyNthFrame: z.number().int().positive().max(30).optional()
}).strict();
const mouseEventSchema = z.object({
	type: z.enum([
		"mousePressed",
		"mouseReleased",
		"mouseMoved",
		"mouseWheel"
	]),
	x: z.number().finite(),
	y: z.number().finite(),
	button: z.enum([
		"none",
		"left",
		"middle",
		"right",
		"back",
		"forward"
	]).optional(),
	buttons: z.number().int().nonnegative().optional(),
	clickCount: z.number().int().nonnegative().max(4).optional(),
	deltaX: z.number().finite().optional(),
	deltaY: z.number().finite().optional(),
	modifiers: z.number().int().min(0).max(15).optional()
}).strict();
const clientRequestSchema = z.discriminatedUnion("type", [
	z.object({
		v: z.literal(1),
		type: z.literal("targets.list"),
		requestId: requestIdSchema
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("targets.create"),
		requestId: requestIdSchema
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("target.select"),
		requestId: requestIdSchema,
		targetKey: targetKeySchema
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("target.detach"),
		requestId: requestIdSchema,
		targetKey: targetKeySchema
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("target.close"),
		requestId: requestIdSchema,
		targetKey: targetKeySchema
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("visibility"),
		requestId: requestIdSchema,
		targetKey: targetKeySchema.optional(),
		visible: z.boolean()
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("screencast.start"),
		requestId: requestIdSchema,
		targetKey: targetKeySchema,
		options: screencastOptionsSchema.optional()
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("screencast.stop"),
		requestId: requestIdSchema,
		targetKey: targetKeySchema
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("input.mouse"),
		requestId: requestIdSchema,
		targetKey: targetKeySchema,
		frameId: z.number().int().nonnegative().optional(),
		event: mouseEventSchema
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("input.key"),
		requestId: requestIdSchema,
		targetKey: targetKeySchema,
		event: z.object({
			type: z.enum([
				"keyDown",
				"keyUp",
				"rawKeyDown",
				"char"
			]),
			key: z.string().max(128).optional(),
			code: z.string().max(128).optional(),
			text: z.string().max(65536).optional(),
			unmodifiedText: z.string().max(65536).optional(),
			windowsVirtualKeyCode: z.number().int().optional(),
			nativeVirtualKeyCode: z.number().int().optional(),
			modifiers: z.number().int().min(0).max(15).optional(),
			autoRepeat: z.boolean().optional(),
			isKeypad: z.boolean().optional(),
			isSystemKey: z.boolean().optional(),
			location: z.number().int().min(0).max(3).optional()
		}).strict()
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("input.text"),
		requestId: requestIdSchema,
		targetKey: targetKeySchema,
		text: z.string().max(1e6)
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("navigate"),
		requestId: requestIdSchema,
		targetKey: targetKeySchema,
		url: z.string().url().max(8192)
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("history"),
		requestId: requestIdSchema,
		targetKey: targetKeySchema,
		action: z.enum([
			"back",
			"forward",
			"reload"
		])
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("ping"),
		requestId: requestIdSchema
	}).strict()
]);
const targetDescriptorSchema = z.object({
	key: targetKeySchema,
	type: z.string(),
	title: z.string(),
	url: z.string(),
	lifecycle: z.enum([
		"available",
		"attached",
		"closed"
	]),
	attached: z.boolean(),
	createdAt: z.number(),
	updatedAt: z.number()
}).strict();
const serverMessageSchema = z.discriminatedUnion("type", [
	z.object({
		v: z.literal(1),
		type: z.literal("ready"),
		generation: z.string(),
		mode: z.enum(["observe", "interactive"]),
		targets: z.array(targetDescriptorSchema)
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("response"),
		requestId: requestIdSchema,
		ok: z.boolean(),
		result: z.unknown().optional(),
		error: z.object({
			code: z.string(),
			message: z.string()
		}).strict().optional()
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("targets.changed"),
		targets: z.array(targetDescriptorSchema)
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("target.closed"),
		targetKey: targetKeySchema,
		reason: z.string().optional()
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("screencast.frameMeta"),
		targetKey: targetKeySchema,
		sequence: z.number().int().nonnegative(),
		metadata: z.record(z.string(), z.unknown()),
		mimeType: z.enum(["image/jpeg", "image/png"]),
		byteLength: z.number().int().nonnegative(),
		receivedAt: z.number()
	}).strict(),
	z.object({
		v: z.literal(1),
		type: z.literal("error"),
		code: z.string(),
		message: z.string(),
		recoverable: z.boolean()
	}).strict()
]);
function parseClientRequest(value) {
	return clientRequestSchema.parse(value);
}
function parseJsonClientRequest(input) {
	const text = typeof input === "string" ? input : input.toString("utf8");
	return parseClientRequest(JSON.parse(text));
}
function encodeServerMessage(message) {
	return JSON.stringify(serverMessageSchema.parse(message));
}
//#endregion
//#region src/cdp/target-registry.ts
var TargetRegistry = class extends EventEmitter {
	#byTarget = /* @__PURE__ */ new WeakMap();
	#byKey = /* @__PURE__ */ new Map();
	#include;
	#now;
	#browser;
	#created = (target) => {
		this.#upsert(target, "available");
	};
	#changed = (target) => {
		this.#upsert(target);
	};
	#destroyed = (target) => {
		this.#destroy(target);
	};
	constructor(options = {}) {
		super();
		this.#include = options.include ?? ((target) => target.type === "page" || target.type === "webview");
		this.#now = options.now ?? Date.now;
	}
	async bind(browser) {
		this.unbind();
		this.#browser = browser;
		browser.onTargetCreated(this.#created);
		browser.onTargetChanged(this.#changed);
		browser.onTargetDestroyed(this.#destroyed);
		for (const target of await browser.listTargets()) this.#upsert(target, "available");
	}
	unbind() {
		const browser = this.#browser;
		if (!browser) return;
		browser.offTargetCreated(this.#created);
		browser.offTargetChanged(this.#changed);
		browser.offTargetDestroyed(this.#destroyed);
		this.#browser = void 0;
	}
	list(options = {}) {
		return [...this.#byKey.values()].map(({ descriptor }) => ({ ...descriptor })).filter((descriptor) => options.includeClosed || descriptor.lifecycle !== "closed");
	}
	resolve(key) {
		const record = this.#byKey.get(key);
		if (!record || record.descriptor.lifecycle === "closed") throw new Error(`Unknown or closed target: ${key}`);
		return record.target;
	}
	describe(key) {
		const descriptor = this.#byKey.get(key)?.descriptor;
		return descriptor ? { ...descriptor } : void 0;
	}
	/** The opaque key assigned to a live adapter, once it has been upserted. */
	keyOf(target) {
		const record = this.#byTarget.get(target);
		return record !== void 0 && record.descriptor.lifecycle !== "closed" ? record.descriptor.key : void 0;
	}
	/**
	* Re-read the live title/url/type of every tracked target and emit one
	* 'changed' when anything moved.
	*
	* Needed because puppeteer's browser-level 'targetchanged' event only
	* fires when the URL changes: a title-only TargetInfo update (the normal
	* "page finished loading and set its title" moment) updates the adapter's
	* internal state but is never forwarded. The freshest title is therefore
	* already sitting on the adapter — it just has to be re-read. Pure memory
	* reads, no CDP round-trips; driven by the connection manager's poll.
	*/
	refresh() {
		let changed = false;
		const now = this.#now();
		for (const { target, descriptor } of this.#byKey.values()) {
			if (descriptor.lifecycle === "closed") continue;
			if (descriptor.title !== target.title) {
				descriptor.title = target.title;
				descriptor.updatedAt = now;
				changed = true;
			}
			if (descriptor.url !== target.url) {
				descriptor.url = target.url;
				descriptor.updatedAt = now;
				changed = true;
			}
			if (descriptor.type !== target.type) {
				descriptor.type = target.type;
				descriptor.updatedAt = now;
				changed = true;
			}
		}
		if (changed) this.emit("changed", this.list());
		return changed;
	}
	markAttached(key, attached) {
		const record = this.#byKey.get(key);
		if (!record || record.descriptor.lifecycle === "closed") throw new Error(`Unknown or closed target: ${key}`);
		record.descriptor.attached = attached;
		record.descriptor.lifecycle = attached ? "attached" : "available";
		record.descriptor.updatedAt = this.#now();
		this.#emitChanged(record.descriptor);
	}
	emit(event, ...args) {
		return super.emit(event, ...args);
	}
	on(event, listener) {
		return super.on(event, listener);
	}
	#upsert(target, initialState) {
		if (!this.#include(target)) return;
		const existing = this.#byTarget.get(target);
		const now = this.#now();
		if (existing) {
			existing.descriptor.type = target.type;
			existing.descriptor.title = target.title;
			existing.descriptor.url = target.url;
			existing.descriptor.updatedAt = now;
			this.#emitChanged(existing.descriptor);
			return;
		}
		const key = randomBytes(18).toString("base64url");
		const descriptor = {
			key,
			type: target.type,
			title: target.title,
			url: target.url,
			lifecycle: initialState ?? "available",
			attached: false,
			createdAt: now,
			updatedAt: now
		};
		const record = {
			target,
			descriptor
		};
		this.#byTarget.set(target, record);
		this.#byKey.set(key, record);
		this.#emitChanged(descriptor);
	}
	#destroy(target) {
		const record = this.#byTarget.get(target);
		if (!record || record.descriptor.lifecycle === "closed") return;
		record.descriptor.lifecycle = "closed";
		record.descriptor.attached = false;
		record.descriptor.updatedAt = this.#now();
		this.emit("closed", { ...record.descriptor });
		this.#byKey.delete(record.descriptor.key);
		this.#emitChanged(record.descriptor);
	}
	#emitChanged(_descriptor) {
		this.emit("changed", this.list());
	}
};
//#endregion
//#region src/cdp/target-controller.ts
var TargetController = class extends EventEmitter {
	#sessions = /* @__PURE__ */ new Map();
	#registry;
	#onClosed = (target) => {
		this.detach(target.key);
	};
	constructor(registry) {
		super();
		this.#registry = registry;
		registry.on("closed", this.#onClosed);
	}
	has(key) {
		return this.#sessions.has(key);
	}
	attach(key) {
		const current = this.#sessions.get(key);
		if (current) return current;
		const pending = this.#registry.resolve(key).createSession().then((session) => {
			try {
				this.#registry.markAttached(key, true);
			} catch (error) {
				session.detach().catch(() => void 0);
				throw error;
			}
			this.emit("attached", key, session);
			return session;
		}).catch((error) => {
			this.#sessions.delete(key);
			throw error;
		});
		this.#sessions.set(key, pending);
		return pending;
	}
	session(key) {
		const session = this.#sessions.get(key);
		if (!session) throw new Error(`Target is not attached: ${key}`);
		return session;
	}
	async withSession(key, operation) {
		return operation(await this.attach(key));
	}
	/**
	* Best-effort teardown (the v0.1.2 fix for the remotely-closed-tab
	* crash): once this resolves, the controller no longer tracks a session
	* for `key`. A target the remote browser already tore down rejects the
	* pending attach — or the session's own detach() — and both mean the
	* teardown goal is ALREADY met, so they are swallowed here. Never
	* rejecting is what makes the fire-and-forget detach from the registry's
	* 'closed' event safe: a rejection there would surface as an unhandled
	* rejection and take the host process down with it.
	*/
	async detach(key) {
		const pending = this.#sessions.get(key);
		if (!pending) return;
		this.#sessions.delete(key);
		const session = await pending.catch(() => void 0);
		if (session !== void 0) await session.detach().catch(() => void 0);
		const descriptor = this.#registry.describe(key);
		if (descriptor !== void 0 && descriptor.lifecycle !== "closed") this.#registry.markAttached(key, false);
		this.emit("detached", key);
	}
	async close() {
		this.#registry.off("closed", this.#onClosed);
		await Promise.allSettled([...this.#sessions.keys()].map((key) => this.detach(key)));
		this.removeAllListeners();
	}
};
//#endregion
//#region src/cdp/input-controller.ts
var InputController = class {
	targets;
	constructor(targets) {
		this.targets = targets;
	}
	async dispatchMouse(targetKey, input) {
		validateCoordinate(input.x, "x");
		validateCoordinate(input.y, "y");
		await this.targets.withSession(targetKey, async (session) => {
			await session.send("Input.dispatchMouseEvent", compact$1({
				type: input.type,
				x: input.x,
				y: input.y,
				button: input.button,
				buttons: input.buttons,
				clickCount: input.clickCount,
				deltaX: input.deltaX,
				deltaY: input.deltaY,
				modifiers: input.modifiers
			}));
		});
	}
	async dispatchKey(targetKey, input) {
		if (!input.key && !input.code && !input.text && input.type !== "keyUp") throw new Error("Key event requires key, code, or text");
		await this.targets.withSession(targetKey, async (session) => {
			await session.send("Input.dispatchKeyEvent", compact$1({ ...input }));
		});
	}
	async insertText(targetKey, input) {
		const text = typeof input === "string" ? input : input.text;
		await this.targets.withSession(targetKey, async (session) => {
			await session.send("Input.insertText", { text });
		});
	}
	async navigate(targetKey, input) {
		const request = typeof input === "string" ? { url: input } : input;
		assertNavigationUrl(request.url);
		return this.targets.withSession(targetKey, async (session) => {
			await session.send("Page.enable");
			return session.send("Page.navigate", compact$1({
				url: request.url,
				referrer: request.referrer
			}));
		});
	}
	async history(targetKey, action) {
		await this.targets.withSession(targetKey, async (session) => {
			await session.send("Page.enable");
			if (action === "reload") {
				await session.send("Page.reload", { ignoreCache: false });
				return;
			}
			const history = await session.send("Page.getNavigationHistory");
			const index = action === "back" ? history.currentIndex - 1 : history.currentIndex + 1;
			const entry = history.entries[index];
			if (entry !== void 0) await session.send("Page.navigateToHistoryEntry", { entryId: entry.id });
		});
	}
};
function validateCoordinate(value, name) {
	if (!Number.isFinite(value)) throw new Error(`${name} must be finite`);
}
function assertNavigationUrl(value) {
	const url = new URL(value);
	if (!["http:", "https:"].includes(url.protocol)) throw new Error(`Navigation protocol is not allowed: ${url.protocol}`);
}
function compact$1(value) {
	return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== void 0));
}
//#endregion
//#region src/cdp/lease-manager.ts
var LeaseManager = class extends EventEmitter {
	#byId = /* @__PURE__ */ new Map();
	#byTarget = /* @__PURE__ */ new Map();
	#minTtlMs;
	#maxTtlMs;
	#now;
	constructor(options = {}) {
		super();
		this.#minTtlMs = options.minTtlMs ?? 1e3;
		this.#maxTtlMs = options.maxTtlMs ?? 3e5;
		this.#now = options.now ?? Date.now;
	}
	acquire(targetKey, owner, ttlMs) {
		this.#prune();
		const currentId = this.#byTarget.get(targetKey);
		const current = currentId && this.#byId.get(currentId);
		if (current) {
			if (current.owner !== owner) throw new Error("Target lease is held by another owner");
			return this.renew(current.id, ttlMs, owner);
		}
		const now = this.#now();
		const lease = {
			id: randomBytes(18).toString("base64url"),
			targetKey,
			owner,
			issuedAt: now,
			expiresAt: now + this.#ttl(ttlMs)
		};
		this.#byId.set(lease.id, lease);
		this.#byTarget.set(targetKey, lease.id);
		this.emit("acquired", { ...lease });
		return { ...lease };
	}
	renew(id, ttlMs, owner) {
		const lease = this.assert(id);
		if (owner !== void 0 && owner !== lease.owner) throw new Error("Lease owner mismatch");
		lease.expiresAt = this.#now() + this.#ttl(ttlMs);
		this.emit("renewed", { ...lease });
		return { ...lease };
	}
	assert(id, targetKey, owner) {
		this.#prune();
		const lease = this.#byId.get(id);
		if (!lease) throw new Error("Lease is missing or expired");
		if (targetKey !== void 0 && lease.targetKey !== targetKey) throw new Error("Lease does not cover target");
		if (owner !== void 0 && lease.owner !== owner) throw new Error("Lease owner mismatch");
		return lease;
	}
	release(id, owner) {
		const lease = this.#byId.get(id);
		if (!lease) return false;
		if (owner !== void 0 && owner !== lease.owner) throw new Error("Lease owner mismatch");
		this.#delete(lease, "released");
		return true;
	}
	revokeTarget(targetKey) {
		const id = this.#byTarget.get(targetKey);
		const lease = id && this.#byId.get(id);
		if (lease) this.#delete(lease, "target-revoked");
	}
	revokeOwner(owner) {
		for (const lease of [...this.#byId.values()]) if (lease.owner === owner) this.#delete(lease, "owner-revoked");
	}
	clear() {
		for (const lease of [...this.#byId.values()]) this.#delete(lease, "cleared");
	}
	#ttl(ttlMs) {
		if (!Number.isFinite(ttlMs) || ttlMs < this.#minTtlMs || ttlMs > this.#maxTtlMs) throw new Error(`Lease TTL must be between ${this.#minTtlMs} and ${this.#maxTtlMs} ms`);
		return Math.floor(ttlMs);
	}
	#prune() {
		const now = this.#now();
		for (const lease of [...this.#byId.values()]) if (lease.expiresAt <= now) this.#delete(lease, "expired");
	}
	#delete(lease, reason) {
		this.#byId.delete(lease.id);
		if (this.#byTarget.get(lease.targetKey) === lease.id) this.#byTarget.delete(lease.targetKey);
		this.emit("revoked", { ...lease }, reason);
	}
};
//#endregion
//#region src/cdp/frame-queue.ts
/**
* A single-slot asynchronous queue. A producer never waits; a newer frame
* replaces the queued frame, which bounds latency and memory under backpressure.
*/
var LatestFrameQueue = class {
	#onDrop;
	#latest;
	#waiting;
	#closed = false;
	constructor(options = {}) {
		this.#onDrop = options.onDrop;
	}
	get closed() {
		return this.#closed;
	}
	get hasFrame() {
		return this.#latest !== void 0;
	}
	push(frame) {
		if (this.#closed) {
			this.#drop(frame);
			return false;
		}
		if (this.#waiting) {
			const resolve = this.#waiting;
			this.#waiting = void 0;
			resolve({
				value: frame,
				done: false
			});
			return true;
		}
		if (this.#latest !== void 0) this.#drop(this.#latest);
		this.#latest = frame;
		return true;
	}
	take() {
		if (this.#latest !== void 0) {
			const value = this.#latest;
			this.#latest = void 0;
			return Promise.resolve({
				value,
				done: false
			});
		}
		if (this.#closed) return Promise.resolve({
			value: void 0,
			done: true
		});
		if (this.#waiting) return Promise.reject(/* @__PURE__ */ new Error("Only one LatestFrameQueue consumer is supported"));
		return new Promise((resolve) => {
			this.#waiting = resolve;
		});
	}
	close() {
		if (this.#closed) return;
		this.#closed = true;
		if (this.#latest !== void 0) {
			this.#drop(this.#latest);
			this.#latest = void 0;
		}
		const resolve = this.#waiting;
		this.#waiting = void 0;
		resolve?.({
			value: void 0,
			done: true
		});
	}
	[Symbol.asyncIterator]() {
		return {
			next: () => this.take(),
			return: async () => {
				this.close();
				return {
					value: void 0,
					done: true
				};
			}
		};
	}
	async #drop(frame) {
		try {
			await this.#onDrop?.(frame);
		} catch {}
	}
};
//#endregion
//#region src/cdp/screencast-controller.ts
var ScreencastController = class {
	#targets;
	#active = /* @__PURE__ */ new Map();
	constructor(targets) {
		this.#targets = targets;
	}
	async start(targetKey, options = {}) {
		const existing = this.#active.get(targetKey);
		if (existing) return existing.queue;
		const session = await this.#targets.attach(targetKey);
		const active = {
			session,
			sequence: 0,
			queue: new LatestFrameQueue(),
			handler: () => void 0
		};
		active.handler = (payload) => {
			const event = payload;
			session.send("Page.screencastFrameAck", { sessionId: event.sessionId }).catch(() => void 0);
			active.queue.push({
				targetKey,
				sequence: active.sequence++,
				data: event.data,
				metadata: event.metadata,
				receivedAt: Date.now()
			});
		};
		session.on("Page.screencastFrame", active.handler);
		this.#active.set(targetKey, active);
		try {
			await session.send("Page.enable");
			await session.send("Page.startScreencast", compact({
				format: options.format ?? "jpeg",
				quality: options.quality ?? 80,
				maxWidth: options.maxWidth,
				maxHeight: options.maxHeight,
				everyNthFrame: options.everyNthFrame ?? 1
			}));
			return active.queue;
		} catch (error) {
			this.#active.delete(targetKey);
			session.off("Page.screencastFrame", active.handler);
			active.queue.close();
			throw error;
		}
	}
	async stop(targetKey) {
		const active = this.#active.get(targetKey);
		if (!active) return;
		this.#active.delete(targetKey);
		active.queue.close();
		active.session.off("Page.screencastFrame", active.handler);
		await active.session.send("Page.stopScreencast").catch(() => void 0);
	}
	async close() {
		await Promise.allSettled([...this.#active.keys()].map((key) => this.stop(key)));
	}
};
function compact(value) {
	return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== void 0));
}
//#endregion
//#region src/cdp/browser-connection-manager.ts
/** Composition root for one browser connection generation. */
var BrowserConnectionManager = class extends EventEmitter {
	registry;
	leases;
	#connectAdapter;
	#targetInfoPollMs;
	#adapter;
	#targets;
	#screencast;
	#input;
	#state = "idle";
	#transition;
	#pollTimer;
	constructor(options) {
		super();
		this.#connectAdapter = options.connect;
		this.#targetInfoPollMs = options.targetInfoPollMs ?? 1e3;
		this.registry = new TargetRegistry(options.targetRegistry);
		this.leases = options.leases ?? new LeaseManager();
		this.registry.on("closed", (target) => this.leases.revokeTarget(target.key));
	}
	get state() {
		return this.#state;
	}
	get connected() {
		return this.#state === "connected" && this.#adapter?.isConnected() === true;
	}
	get targets() {
		return this.#require(this.#targets, "Target controller");
	}
	get screencast() {
		return this.#require(this.#screencast, "Screencast controller");
	}
	get input() {
		return this.#require(this.#input, "Input controller");
	}
	/**
	* Create a new page target and return its registry key. `newPage()` already
	* waits for the target to appear + initialize, so the registry entry exists
	* by the time it resolves; the short poll is a belt-and-braces guard against
	* event-ordering surprises, not an expected wait.
	*/
	async createTarget() {
		const target = await this.#require(this.#adapter, "Browser adapter").createTarget();
		const deadline = Date.now() + 3e3;
		for (;;) {
			const key = this.registry.keyOf(target);
			if (key !== void 0) return key;
			if (Date.now() >= deadline) throw new Error("new target did not appear in the registry");
			await new Promise((resolve) => setTimeout(resolve, 15));
		}
	}
	/**
	* Close a target: detach any session we hold first, then close it remotely.
	* The last remaining tab is refused — Chromium exits when its last target
	* closes, which would kill the browser for every viewer of this endpoint
	* (and leave the endpoint dead until the remote is restarted).
	*/
	async closeTarget(key) {
		const target = this.registry.resolve(key);
		if (this.registry.list().length <= 1) throw new Error("cannot close the last remaining tab: the remote browser would exit");
		await this.#require(this.#targets, "Target controller").detach(key);
		await target.close();
	}
	connect() {
		if (this.#state === "closed") return Promise.reject(/* @__PURE__ */ new Error("Browser connection manager is closed"));
		if (this.#state === "connected") return Promise.resolve();
		if (this.#transition) return this.#transition;
		this.#setState("connecting");
		this.#transition = (async () => {
			const adapter = await this.#connectAdapter();
			if (!adapter.isConnected()) throw new Error("Browser adapter connected in disconnected state");
			const targets = new TargetController(this.registry);
			this.#adapter = adapter;
			this.#targets = targets;
			this.#screencast = new ScreencastController(targets);
			this.#input = new InputController(targets);
			await this.registry.bind(adapter);
			await adapter.refreshTargetInfo().catch(() => void 0);
			this.registry.refresh();
			this.#startTargetInfoPoll();
			this.#setState("connected");
		})().catch(async (error) => {
			await this.#cleanup();
			this.#setState("idle");
			throw error;
		}).finally(() => {
			this.#transition = void 0;
		});
		return this.#transition;
	}
	disconnect() {
		if (this.#state === "idle") return Promise.resolve();
		if (this.#state === "closed") return Promise.resolve();
		if (this.#transition && this.#state === "disconnecting") return this.#transition;
		const waitForConnect = this.#transition;
		this.#setState("disconnecting");
		this.#transition = (async () => {
			if (waitForConnect) await waitForConnect.catch(() => void 0);
			await this.#cleanup();
			this.#setState("idle");
		})().finally(() => {
			this.#transition = void 0;
		});
		return this.#transition;
	}
	async close() {
		if (this.#state === "closed") return;
		await this.disconnect();
		this.leases.clear();
		this.registry.removeAllListeners();
		this.#setState("closed");
		this.removeAllListeners();
	}
	async #cleanup() {
		this.#stopTargetInfoPoll();
		const screencast = this.#screencast;
		const targets = this.#targets;
		const adapter = this.#adapter;
		this.#screencast = void 0;
		this.#input = void 0;
		this.#targets = void 0;
		this.#adapter = void 0;
		this.registry.unbind();
		this.leases.clear();
		await screencast?.close().catch(() => void 0);
		await targets?.close().catch(() => void 0);
		await adapter?.disconnect().catch(() => void 0);
	}
	/** Keep tab titles live: fetch via commands, then apply (see refreshTargetInfo). */
	#startTargetInfoPoll() {
		this.#stopTargetInfoPoll();
		if (this.#targetInfoPollMs <= 0) return;
		this.#pollTimer = setInterval(() => {
			this.#pollTargetInfo();
		}, this.#targetInfoPollMs);
		this.#pollTimer.unref?.();
	}
	#pollTargetInfo = () => {
		const adapter = this.#adapter;
		if (adapter === void 0 || this.#state !== "connected") return;
		adapter.refreshTargetInfo().then(() => {
			this.registry.refresh();
		}, () => void 0);
	};
	/** On-demand refresh (navigation nudge): fetch + apply immediately. */
	async refreshTargetInfoNow() {
		const adapter = this.#adapter;
		if (adapter === void 0 || this.#state !== "connected") return;
		await adapter.refreshTargetInfo();
		this.registry.refresh();
	}
	#stopTargetInfoPoll() {
		if (this.#pollTimer === void 0) return;
		clearInterval(this.#pollTimer);
		this.#pollTimer = void 0;
	}
	#setState(state) {
		this.#state = state;
		this.emit("state", state);
	}
	#require(value, label) {
		if (!value || this.#state !== "connected") throw new Error(`${label} is unavailable while ${this.#state}`);
		return value;
	}
};
//#endregion
//#region src/cdp/puppeteer-adapter.ts
var PuppeteerSessionAdapter = class {
	session;
	constructor(session) {
		this.session = session;
	}
	send(method, params) {
		return this.session.send(method, params);
	}
	on(event, handler) {
		this.session.on(event, handler);
	}
	off(event, handler) {
		this.session.off(event, handler);
	}
	async detach() {
		await this.session.detach();
	}
};
/**
* Event-driven title (puppeteer's internal TargetInfo cache). This cache only
* updates from Target.targetInfoChanged events — and Chromium never emits
* title-only updates, so after a navigation it stays on the tentative title
* (e.g. "baidu.com") forever. It is the FALLBACK; the primary source is the
* browser adapter's command-fetched snapshot (see refreshTargetInfo).
*/
function eventTitle(target) {
	const title = (target._getTargetInfo?.())?.title?.trim();
	return title ? title : target.url();
}
function targetIdOf(target) {
	return target._targetId;
}
var PuppeteerTargetAdapter = class {
	target;
	browserAdapter;
	#id;
	constructor(target, browserAdapter) {
		this.target = target;
		this.browserAdapter = browserAdapter;
		this.#id = targetIdOf(target);
	}
	get type() {
		return this.target.type();
	}
	/** Command-fetched snapshot first (titles never arrive as events); event cache second. */
	get title() {
		const title = this.browserAdapter.snapshotOf(this.#id)?.title?.trim();
		return title ? title : eventTitle(this.target);
	}
	/** URL events DO fire on commit, so the event-driven url is the freshest source. */
	get url() {
		return this.target.url() || this.browserAdapter.snapshotOf(this.#id)?.url || "";
	}
	async createSession() {
		return new PuppeteerSessionAdapter(await this.target.createCDPSession());
	}
	async close() {
		await (await this.target.asPage()).close();
	}
};
var PuppeteerBrowserAdapter = class {
	browser;
	#wrappers = /* @__PURE__ */ new WeakMap();
	#created = /* @__PURE__ */ new Map();
	#changed = /* @__PURE__ */ new Map();
	#destroyed = /* @__PURE__ */ new Map();
	/** targetId → freshest title/url, fetched via Target.getTargets commands. */
	#snapshots = /* @__PURE__ */ new Map();
	#infoSession;
	constructor(browser) {
		this.browser = browser;
	}
	snapshotOf(targetId) {
		return this.#snapshots.get(targetId);
	}
	async refreshTargetInfo() {
		if (this.#infoSession === void 0) this.#infoSession = await this.browser.target().createCDPSession();
		const result = await this.#infoSession.send("Target.getTargets");
		this.#snapshots.clear();
		for (const info of result.targetInfos) this.#snapshots.set(info.targetId, {
			title: info.title ?? "",
			url: info.url ?? ""
		});
	}
	async listTargets() {
		return this.browser.targets().map((target) => this.#wrap(target));
	}
	/**
	* New page via puppeteer's `newPage()`: it resolves only after the target
	* has appeared (targetcreated) AND initialized, so the registry entry is
	* already live by the time the caller maps the adapter to a TargetKey.
	* No defaultViewport is configured at connect time, so the page keeps the
	* browser's natural size instead of being forced into an 800x600 override.
	*/
	async createTarget() {
		const page = await this.browser.newPage();
		return this.#wrap(page.target());
	}
	onTargetCreated(handler) {
		this.#on("targetcreated", this.#created, handler);
	}
	offTargetCreated(handler) {
		this.#off("targetcreated", this.#created, handler);
	}
	onTargetChanged(handler) {
		this.#on("targetchanged", this.#changed, handler);
	}
	offTargetChanged(handler) {
		this.#off("targetchanged", this.#changed, handler);
	}
	onTargetDestroyed(handler) {
		this.#on("targetdestroyed", this.#destroyed, handler);
	}
	offTargetDestroyed(handler) {
		this.#off("targetdestroyed", this.#destroyed, handler);
	}
	isConnected() {
		return this.browser.connected;
	}
	async disconnect() {
		await this.browser.disconnect();
	}
	#wrap(target) {
		let wrapper = this.#wrappers.get(target);
		if (!wrapper) {
			wrapper = new PuppeteerTargetAdapter(target, this);
			this.#wrappers.set(target, wrapper);
		}
		return wrapper;
	}
	#on(event, map, handler) {
		if (map.has(handler)) return;
		const wrapped = (target) => handler(this.#wrap(target));
		map.set(handler, wrapped);
		this.browser.on(event, wrapped);
	}
	#off(event, map, handler) {
		const wrapped = map.get(handler);
		if (!wrapped) return;
		map.delete(handler);
		this.browser.off(event, wrapped);
	}
};
async function connectPuppeteer(options) {
	return new PuppeteerBrowserAdapter(await puppeteer.connect({
		browserWSEndpoint: options.browserWSEndpoint,
		headers: options.headers,
		/**
		* puppeteer's connect() defaults defaultViewport to a frozen 800x600 and
		* applies it inside newPage()/target.page() via Emulation override — every
		* tab we create would render at 800x600 regardless of the browser's real
		* window size ("new tabs come up narrow"). null (≠ undefined, so the
		* destructuring default does not kick in) makes CdpPage skip the override
		* entirely: new pages keep the remote browser's natural viewport, same as
		* tabs that existed before we connected.
		*/
		defaultViewport: null
	}));
}
//#endregion
//#region src/cdp/endpoint-manager.ts
/** The single implicit CDP connection: one endpoint, dialed on demand. */
var EndpointManager = class {
	#config;
	#source;
	#current;
	constructor(config, source = () => "") {
		this.#config = config;
		this.#source = source;
	}
	/** The endpoint a NEW connection would use right now (normalized). */
	get endpoint() {
		return normalizeCdpEndpoint(this.#source());
	}
	ready() {
		return this.#current?.manager.connected === true;
	}
	async get() {
		const endpoint = this.endpoint;
		let current = this.#current;
		if (current !== void 0 && current.endpoint !== endpoint) {
			await current.manager.close().catch(() => void 0);
			this.#current = current = void 0;
		}
		if (current !== void 0 && current.manager.state === "connected" && !current.manager.connected) {
			await current.manager.close().catch(() => void 0);
			this.#current = current = void 0;
		}
		if (current === void 0 || current.manager.state === "closed") {
			const generation = randomBytes(12).toString("base64url");
			current = {
				endpoint,
				manager: new BrowserConnectionManager({ connect: async () => connectPuppeteer({ browserWSEndpoint: await resolveBrowserWsEndpoint(endpoint, this.#config.connectTimeoutMs) }) }),
				generation
			};
			this.#current = current;
		}
		await current.manager.connect();
		return current;
	}
	/**
	* React to a settings commit: if the effective endpoint moved, dispose the
	* current connection so the next attach dials the new address. Returns
	* whether the endpoint actually changed.
	*/
	async applyEndpointChange() {
		const endpoint = this.endpoint;
		if (this.#current === void 0 || this.#current.endpoint === endpoint) return false;
		await this.close();
		return true;
	}
	async close() {
		const current = this.#current;
		this.#current = void 0;
		if (current !== void 0) await current.manager.close().catch(() => void 0);
	}
};
async function resolveBrowserWsEndpoint(endpoint, timeoutMs) {
	const url = new URL(endpoint);
	if (url.protocol === "ws:" || url.protocol === "wss:") return url.toString();
	const versionUrl = new URL("/json/version", url);
	const response = await fetch(versionUrl, {
		redirect: "error",
		signal: AbortSignal.timeout(timeoutMs),
		headers: { accept: "application/json" }
	});
	if (!response.ok) throw new Error(`CDP discovery failed with HTTP ${response.status}`);
	const value = await response.json();
	if (typeof value.webSocketDebuggerUrl !== "string") throw new Error("CDP discovery response has no webSocketDebuggerUrl");
	const advertised = new URL(value.webSocketDebuggerUrl);
	if (advertised.protocol !== "ws:" && advertised.protocol !== "wss:") throw new Error(`CDP discovery returned a non-WebSocket URL: ${advertised.protocol}`);
	const resolved = new URL(advertised);
	resolved.protocol = url.protocol === "https:" ? "wss:" : "ws:";
	resolved.host = url.host;
	return resolved.toString();
}
//#endregion
//#region src/cdp/live-session.ts
var CdpLiveSession = class {
	#config;
	#endpoints;
	#frameSource;
	#sockets = /* @__PURE__ */ new Set();
	constructor(config, endpoints = new EndpointManager(config), frameSource = () => ({})) {
		this.#config = config;
		this.#endpoints = endpoints;
		this.#frameSource = frameSource;
	}
	/** The frame-capture params a NEW screencast would start with right now. */
	get frameConfig() {
		return resolveFrameValues(this.#config, this.#frameSource());
	}
	/**
	* The CDP endpoint setting changed: close every attached client so they
	* re-open a ticket and land on a fresh connection to the new address. The
	* client's reconnect loop (with backoff) does the rest.
	*/
	restart(reason) {
		for (const socket of [...this.#sockets]) socket.close(1012, reason.slice(0, 120));
	}
	async attach(claims, ws) {
		const owner = `${claims.sessionId}:${randomBytes(10).toString("base64url")}`;
		let selected;
		let framePump;
		let closed = false;
		const early = [];
		ws.on("message", (data, binary) => {
			if (!binary) early.push(data.toString());
		});
		this.#sockets.add(ws);
		ws.on("close", () => {
			this.#sockets.delete(ws);
		});
		const { manager, generation } = await this.#endpoints.get();
		const { registry, leases, screencast, targets } = manager;
		const sendJson = (message) => {
			if (ws.readyState === ws.OPEN) ws.send(encodeServerMessage(message));
		};
		const response = (requestId, result) => sendJson({
			v: 1,
			type: "response",
			requestId,
			ok: true,
			...result === void 0 ? {} : { result }
		});
		const failure = (requestId, error) => sendJson({
			v: 1,
			type: "response",
			requestId,
			ok: false,
			error: {
				code: "command-failed",
				message: error instanceof Error ? error.message : String(error)
			}
		});
		const sendTargets = () => sendJson({
			v: 1,
			type: "targets.changed",
			targets: manager.registry.list()
		});
		const onTargetsChanged = () => sendTargets();
		const stopSelected = async () => {
			const key = selected;
			selected = void 0;
			if (key === void 0) return;
			leases.revokeOwner(owner);
			await screencast.stop(key).catch(() => void 0);
			await targets.detach(key).catch(() => void 0);
			await framePump?.catch(() => void 0);
			framePump = void 0;
		};
		let switching = Promise.resolve();
		const startTarget = (key) => {
			const next = switching.then(() => startTargetNow(key));
			switching = next.catch(() => void 0);
			return next;
		};
		const startTargetNow = async (key) => {
			if (selected === key && framePump !== void 0) return;
			await stopSelected();
			registry.resolve(key);
			leases.acquire(key, owner, 6e4);
			selected = key;
			try {
				const frame = this.frameConfig;
				const queue = await screencast.start(key, {
					format: "jpeg",
					quality: frame.frameQuality,
					maxWidth: frame.frameMaxWidth,
					maxHeight: frame.frameMaxHeight,
					everyNthFrame: frame.frameEveryNth
				});
				framePump = (async () => {
					for await (const frame of queue) {
						if (closed || selected !== key || ws.readyState !== ws.OPEN) return;
						if (ws.bufferedAmount > this.#config.bufferedAmountHardLimit) {
							ws.close(1013, "client backpressure limit exceeded");
							return;
						}
						if (ws.bufferedAmount > this.#config.bufferedAmountSoftLimit) continue;
						const bytes = Buffer.from(frame.data, "base64");
						sendJson({
							v: 1,
							type: "screencast.frameMeta",
							targetKey: frame.targetKey,
							sequence: frame.sequence,
							metadata: frame.metadata,
							mimeType: "image/jpeg",
							byteLength: bytes.byteLength,
							receivedAt: frame.receivedAt
						});
						if (ws.readyState === ws.OPEN) ws.send(bytes, { binary: true });
					}
				})();
				framePump.catch(() => void 0);
			} catch (error) {
				if (selected === key) selected = void 0;
				throw error;
			}
		};
		/**
		* The remotely-closed-tab path (leak fixed in v0.1.2). The teardown
		* below MUST go through stopSelected() rather than just clearing
		* `selected`: clearing alone strands the screencast entry, the frame
		* queue, and the parked pump forever, because every later cleanup only
		* acts on what is selected. stopSelected() reads `selected` before
		* clearing it, so calling it here while this socket still owns the key
		* releases everything. It never rejects, so fire-and-forget is safe.
		*/
		const onTargetClosed = (target) => {
			sendJson({
				v: 1,
				type: "target.closed",
				targetKey: target.key,
				reason: "target closed"
			});
			if (selected === target.key) stopSelected();
		};
		manager.registry.on("changed", onTargetsChanged);
		manager.registry.on("closed", onTargetClosed);
		const requireInteractive = () => {
			if (claims.mode !== "interactive") throw new Error("interactive control is not permitted");
		};
		/**
		* A navigation commits its URL long before the new document's title
		* exists, and Chromium NEVER emits title-only TargetInfo updates — the
		* real title is only observable via Target.getTargets commands (see
		* BrowserAdapter.refreshTargetInfo). These nudges fetch + apply right
		* after a navigation so the tab title flips within a beat instead of
		* waiting for the 1s poll.
		*/
		const nudgeTitleRefresh = () => {
			for (const delay of [
				250,
				800,
				2e3
			]) setTimeout(() => {
				manager.refreshTargetInfoNow().catch(() => void 0);
			}, delay).unref?.();
		};
		const handle = async (request) => {
			try {
				switch (request.type) {
					case "targets.list":
						response(request.requestId, { targets: manager.registry.list() });
						break;
					case "targets.create": {
						requireInteractive();
						const targetKey = await manager.createTarget();
						response(request.requestId, { targetKey });
						break;
					}
					case "target.select":
						await startTarget(request.targetKey);
						response(request.requestId);
						break;
					case "target.detach":
						if (selected === request.targetKey) await stopSelected();
						else await manager.targets.detach(request.targetKey);
						response(request.requestId);
						break;
					case "target.close":
						requireInteractive();
						if (selected === request.targetKey) await stopSelected();
						await manager.closeTarget(request.targetKey);
						response(request.requestId);
						break;
					case "visibility":
						if (!request.visible) await stopSelected();
						else if (request.targetKey !== void 0) await startTarget(request.targetKey);
						response(request.requestId);
						break;
					case "screencast.start":
						await startTarget(request.targetKey);
						response(request.requestId);
						break;
					case "screencast.stop":
						if (selected === request.targetKey) await stopSelected();
						else await manager.screencast.stop(request.targetKey);
						response(request.requestId);
						break;
					case "input.mouse":
						requireInteractive();
						await manager.input.dispatchMouse(request.targetKey, request.event);
						response(request.requestId);
						break;
					case "input.key":
						requireInteractive();
						await manager.input.dispatchKey(request.targetKey, request.event);
						response(request.requestId);
						break;
					case "input.text":
						requireInteractive();
						await manager.input.insertText(request.targetKey, request.text);
						response(request.requestId);
						break;
					case "navigate":
						requireInteractive();
						await manager.input.navigate(request.targetKey, request.url);
						nudgeTitleRefresh();
						response(request.requestId);
						break;
					case "history":
						requireInteractive();
						await manager.input.history(request.targetKey, request.action);
						nudgeTitleRefresh();
						response(request.requestId);
						break;
					case "ping": response(request.requestId, { pong: Date.now() });
				}
			} catch (error) {
				failure(request.requestId, error);
			}
		};
		sendJson({
			v: 1,
			type: "ready",
			generation,
			mode: claims.mode,
			targets: manager.registry.list()
		});
		ws.listeners("message").slice().forEach((listener) => ws.off("message", listener));
		ws.on("message", (data, binary) => {
			if (binary) return;
			try {
				handle(parseJsonClientRequest(data.toString()));
			} catch (error) {
				sendJson({
					v: 1,
					type: "error",
					code: "invalid-message",
					message: error instanceof Error ? error.message : String(error),
					recoverable: true
				});
			}
		});
		ws.on("close", () => {
			cleanup();
		});
		ws.on("error", () => {
			ws.close();
		});
		for (const buffered of early.splice(0)) try {
			handle(parseJsonClientRequest(buffered));
		} catch {}
		const cleanup = async () => {
			if (closed) return;
			closed = true;
			this.#sockets.delete(ws);
			manager.registry.off("changed", onTargetsChanged);
			manager.registry.off("closed", onTargetClosed);
			await stopSelected();
		};
	}
	async close() {
		this.restart("plugin shutdown");
		this.#sockets.clear();
		await this.#endpoints.close();
	}
};
//#endregion
//#region src/trust-fence.ts
function value(headers, name) {
	const found = headers[name] ?? headers[name.toLowerCase()];
	return Array.isArray(found) ? found[0] : found;
}
function authority(raw) {
	try {
		return new URL(`http://${raw}`);
	} catch {
		return;
	}
}
function isLoopbackHostname(hostname) {
	const normalized = hostname.toLowerCase();
	if (normalized === "localhost" || normalized === "::1" || normalized === "[::1]") return true;
	return /^127(?:\.\d{1,3}){3}$/.test(normalized);
}
function isTrustedRequest(request, trustedHosts = []) {
	const host = value(request.headers, "host");
	if (!host) return false;
	const parsed = authority(host);
	if (!parsed) return false;
	if (!(isLoopbackHostname(parsed.hostname) || trustedHosts.some((entry) => {
		const candidate = authority(entry);
		return candidate !== void 0 && candidate.hostname === parsed.hostname && (!candidate.port || candidate.port === parsed.port);
	})) || value(request.headers, "sec-fetch-site") === "cross-site") return false;
	const origin = value(request.headers, "origin");
	if (!origin) return true;
	try {
		return new URL(origin).host === parsed.host;
	} catch {
		return false;
	}
}
//#endregion
//#region src/routes/http.ts
function createTicketRegistry(ttlMs, now = Date.now) {
	const entries = /* @__PURE__ */ new Map();
	const prune = () => {
		const time = now();
		for (const [ticket, claims] of entries) if (claims.expiresAt <= time) entries.delete(ticket);
	};
	return {
		issue(value) {
			prune();
			const issuedAt = now();
			const ticket = randomBytes(32).toString("base64url");
			const claims = {
				...value,
				issuedAt,
				expiresAt: issuedAt + ttlMs
			};
			entries.set(ticket, claims);
			return {
				ticket,
				expiresAt: claims.expiresAt
			};
		},
		consume(ticket) {
			prune();
			const claims = entries.get(ticket);
			entries.delete(ticket);
			return claims !== void 0 && claims.expiresAt > now() ? { ...claims } : void 0;
		},
		revoke(ticket) {
			return entries.delete(ticket);
		},
		clear() {
			entries.clear();
		}
	};
}
const openSchema = z.object({
	sessionId: z.string().min(1).max(256),
	mode: z.enum(["observe", "interactive"]).default("observe")
}).strict();
async function readBody(req, maxBytes = 65536) {
	const chunks = [];
	let size = 0;
	for await (const chunk of req) {
		const bytes = typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk;
		size += bytes.byteLength;
		if (size > maxBytes) throw new Error("request body too large");
		chunks.push(bytes);
	}
	if (size === 0) return {};
	const joined = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		joined.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return JSON.parse(new TextDecoder().decode(joined));
}
function send(res, status, value) {
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store",
		"x-content-type-options": "nosniff"
	});
	res.end(JSON.stringify(value));
}
function createHttpHandlers(deps, trustedHosts = []) {
	return {
		async open(req, res) {
			if (!isTrustedRequest(req, trustedHosts)) return send(res, 403, {
				ok: false,
				error: {
					code: "forbidden",
					message: "forbidden"
				}
			});
			if (req.method !== "POST") return send(res, 405, {
				ok: false,
				error: {
					code: "method",
					message: "method not allowed"
				}
			});
			try {
				const parsed = openSchema.parse(await readBody(req));
				if (!deps.hasSession(parsed.sessionId)) return send(res, 404, {
					ok: false,
					error: {
						code: "session-not-found",
						message: "session not found"
					}
				});
				const issued = deps.tickets.issue(parsed);
				return send(res, 200, {
					ok: true,
					value: {
						protocolVersion: 1,
						ticket: issued.ticket,
						expiresAt: issued.expiresAt,
						wsPath: "/sidebar/ws/cdp-live"
					}
				});
			} catch (error) {
				return send(res, 400, {
					ok: false,
					error: {
						code: "bad-request",
						message: error instanceof Error ? error.message : "invalid request"
					}
				});
			}
		},
		/** Read-only: the effective frame-capture config for the settings panel. */
		async config(req, res) {
			if (!isTrustedRequest(req, trustedHosts)) return send(res, 403, {
				ok: false,
				error: {
					code: "forbidden",
					message: "forbidden"
				}
			});
			if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, {
				ok: false,
				error: {
					code: "method",
					message: "method not allowed"
				}
			});
			return send(res, 200, {
				ok: true,
				value: { frame: deps.frameConfig() }
			});
		}
	};
}
const HTTP_ROUTES = {
	open: "/dsh-cdp-live/api/open",
	config: "/dsh-cdp-live/api/config"
};
//#endregion
//#region src/routes/websocket.ts
function createCdpWebSocketRoute(tickets, session, trustedHosts = []) {
	const server = new WebSocketServer({
		noServer: true,
		maxPayload: 11e5,
		perMessageDeflate: false
	});
	/**
	* Reject an upgrade with a real HTTP status instead of a bare destroy: a
	* destroyed socket surfaces in the browser as an unexplained 1006, while a
	* written status shows up as "Unexpected response code: <status>" in the
	* console — the difference between a five-second and a one-hour diagnosis.
	* Origin is deliberately NOT required: sanctioned reverse-proxy deployments
	* rewrite Host to loopback and strip Origin entirely (their fence pattern),
	* so the gate here is the trust fence (Host + cross-site markers) plus the
	* single-use ticket bound to session/mode — the same posture as the
	* better-sidebar terminal upgrade, with a stronger ticket on top.
	*/
	const refuse = (socket, status, reason) => {
		socket.write(`HTTP/1.1 ${status} ${reason}\r\nConnection: close\r\n\r\n`);
		socket.destroy();
	};
	return {
		path: "/sidebar/ws/cdp-live",
		handle(req, socket, head) {
			if (!isTrustedRequest(req, trustedHosts)) return refuse(socket, 403, "Forbidden");
			let url;
			try {
				url = new URL(req.url ?? "/", "http://dsh.internal");
			} catch {
				return refuse(socket, 400, "Bad Request");
			}
			if (url.pathname !== "/sidebar/ws/cdp-live") return refuse(socket, 404, "Not Found");
			const ticket = url.searchParams.get("ticket");
			const claims = ticket === null ? void 0 : tickets.consume(ticket);
			if (claims === void 0) return refuse(socket, 401, "Unauthorized");
			server.handleUpgrade(req, socket, Buffer.from(head), (ws) => {
				Promise.resolve(session.attach(claims, ws)).catch((error) => {
					ws.close(1011, error instanceof Error ? error.message.slice(0, 120) : "CDP session failed");
				});
			});
		},
		async close() {
			for (const client of server.clients) client.close(1001, "plugin shutdown");
			await new Promise((resolve) => server.close(() => resolve()));
			await session.close();
		}
	};
}
const WEBSOCKET_ROUTE = "/sidebar/ws/cdp-live";
//#endregion
//#region src/index.ts
const name = "dsh-sidebar-cdp-browser";
/** Non-loopback authorities this deployment serves; webRuntime, which used to carry them, is gone in 0.2.x. */
const TRUSTED_HOSTS = [];
/**
 * Extra authorities the trust fence accepts besides loopback, from the plugin
 * config. A reverse proxy or tailnet name makes the request Host non-loopback,
 * and an empty list would refuse every live-view ticket.
 */
function trustedHostList(config) {
	const list = config && Array.isArray(config.trustedHosts) ? config.trustedHosts : [];
	return list.filter((entry) => typeof entry === "string" && entry.trim() !== "").map((entry) => entry.trim());
}
const inject = [
	"webServer",
	"sessions"
];
/** The better-sidebar tab descriptor id whose pluginSettings blob holds the UI endpoint. */
const LIVE_TAB_ID = "dsh-sidebar-cdp-browser:live";
/** The better-sidebar prefs namespace (registered by dsh-better-sidebar's host half). */
const SIDEBAR_PREFS_NS = "dsh-better-sidebar";
function apply(ctx, rawConfig) {
	const config = resolveCdpLiveConfig(rawConfig);
	const tickets = createTicketRegistry(config.ticketTtlMs);
	let readUiSettings = () => ({});
	const readUiEndpoint = () => {
		const raw = readUiSettings().endpoint;
		return typeof raw === "string" ? raw : "";
	};
	const readUiFrameOverrides = () => readFrameOverrides(readUiSettings());
	const endpoints = new EndpointManager(config, readUiEndpoint);
	const session = new CdpLiveSession(config, endpoints, readUiFrameOverrides);
	const loggingSession = {
		attach: (claims, ws) => session.attach(claims, ws).catch((error) => {
			const line = `[dsh-sidebar-cdp-browser] CDP session attach failed: ${error instanceof Error ? `${error.message}` : String(error)}`;
			if (ctx.logger !== void 0) ctx.logger.warn(line);
			else console.warn(line);
			throw error;
		}),
		close: () => session.close()
	};
	const handlers = createHttpHandlers({
		tickets,
		hasSession: (sessionId) => ctx.sessions.get(sessionId) !== void 0,
		frameConfig: () => {
			try {
				return resolveFrameValues(config, readUiFrameOverrides());
			} catch (error) {
				ctx.logger?.warn?.("[dsh-sidebar-cdp-browser] frame config read failed, serving loader defaults", error);
				return resolveFrameValues(config, () => ({}));
			}
		}
	}, trustedHostList(config));
	const ws = createCdpWebSocketRoute(tickets, loggingSession, trustedHostList(config));
	ctx.inject?.(["settings"], (face) => {
		readUiSettings = () => {
			try {
				return face.settings.get(SIDEBAR_PREFS_NS)?.pluginSettings?.["dsh-sidebar-cdp-browser:live"] ?? {};
			} catch (error) {
				ctx.logger?.warn?.("[dsh-sidebar-cdp-browser] sidebar prefs unavailable", error);
				return {};
			}
		};
		let lastFrame = resolveFrameValues(config, readUiFrameOverrides());
		ctx.on?.("settings/document-updated", (...args) => {
			if (args[0] !== SIDEBAR_PREFS_NS) return;
			endpoints.applyEndpointChange().then((endpointChanged) => {
				const nextFrame = resolveFrameValues(config, readUiFrameOverrides());
				const frameChanged = !sameFrameValues(lastFrame, nextFrame);
				lastFrame = nextFrame;
				if (endpointChanged) session.restart("cdp endpoint changed");
				else if (frameChanged) session.restart("cdp frame settings changed");
			}).catch(() => void 0);
		});
	});
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: HTTP_ROUTES.open,
		handler: handlers.open
	}), "dsh-sidebar-cdp-browser: open route");
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: HTTP_ROUTES.config,
		handler: async (req, res) => {
			try {
				return await handlers.config(req, res);
			} catch (error) {
				ctx.logger?.error?.("[dsh-sidebar-cdp-browser] config handler failed", error);
				if (!res.headersSent) res.writeHead(500, { "content-type": "application/json" });
				res.end(JSON.stringify({ ok: false, error: String(error && error.stack || error) }));
			}
		}
	}), "dsh-sidebar-cdp-browser: config route");
	ctx.effect(() => ctx.webServer.registerUpgrade({
		path: WEBSOCKET_ROUTE,
		handler: ws.handle
	}), "dsh-sidebar-cdp-browser: websocket route");
	ctx.effect(() => () => {
		tickets.clear();
		ws.close();
	}, "dsh-sidebar-cdp-browser: teardown");
}
//#endregion
export { Config, DEFAULT_CDP_ENDPOINT, HTTP_ROUTES, LIVE_TAB_ID, WEBSOCKET_ROUTE, apply, createCdpWebSocketRoute, createHttpHandlers, createTicketRegistry, inject, isTrustedRequest, name, normalizeCdpEndpoint };
