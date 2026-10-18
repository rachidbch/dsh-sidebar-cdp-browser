window.__ModuleLoader__.load({
	id: "dsh-sidebar-cdp-browser",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/cdp-api.ts
		const PROTOCOL_VERSION = 1;
		const DEFAULT_ENDPOINT_DISPLAY = "127.0.0.1:9222";
		async function apiCall(path, init) {
			const response = await fetch(path, {
				...init,
				headers: {
					accept: "application/json",
					...init?.body === void 0 ? {} : { "content-type": "application/json" },
					...init?.headers
				}
			});
			const body = await response.json().catch(() => null);
			if (!response.ok || body?.ok !== true || body.value === void 0) throw new Error(body?.error?.message ?? `HTTP ${response.status}`);
			return body.value;
		}
		function openLiveSession(sessionId, mode, signal) {
			return apiCall("/dsh-cdp-live/api/open", {
				method: "POST",
				body: JSON.stringify({
					sessionId,
					mode
				}),
				signal
			});
		}
		function websocketUrl(path, ticket) {
			const url = new URL(path, window.location.origin);
			url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
			url.searchParams.set("ticket", ticket);
			return url.toString();
		}
		function decodeMessage(data) {
			try {
				const value = JSON.parse(data);
				return value !== null && value.v === PROTOCOL_VERSION && typeof value.type === "string" ? value : null;
			} catch {
				return null;
			}
		}
		function requestId() {
			return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
		}
		function encodeCommand(command) {
			return JSON.stringify(command);
		}
		//#endregion
		//#region src/client/locales.ts
		/**
		* The zh/en copy tables. Language selection lives in i18n.ts (the DSH
		* locale service wiring); this module is pure data plus the key union.
		*
		* @module dsh-sidebar-cdp-browser/client/locales
		*/
		/** Dictionary namespace the plugin registers under the DSH locale service. */
		const NS = "dsh-sidebar-cdp-browser";
		const zh = {
			title: "CDP 实时视图",
			reconnect: "重新连接",
			noTargets: "没有可用的浏览器 Target",
			selectTarget: "选择一个 Target",
			loading: "等待画面…",
			back: "后退",
			forward: "前进",
			reload: "刷新",
			navigate: "前往",
			address: "输入 URL",
			newTab: "新建标签页",
			closeTab: "关闭标签页",
			keepLastTab: "需至少保留一个标签页（关闭最后一个会使浏览器退出）",
			connected: "已连接",
			opening: "正在授权…",
			connecting: "连接中…",
			reconnecting: "正在重连…",
			disconnected: "未连接",
			hidden: "面板不可见，画面流已暂停",
			retry: "重试",
			endpoint: "CDP 地址",
			endpointDesc: "Chromium 远程调试地址（http(s) 或 ws(s)）；修改保存后实时视图会自动重连。",
			endpointFallback: "留空使用默认地址 127.0.0.1:9222。支持 host:port（自动补 http://）或完整 URL。",
			interactive: "交互输入",
			interactiveDesc: "总开关：允许控制远程浏览器；实际键鼠控制还需在视图标题栏勾选「键盘鼠标远程控制」。",
			remoteControl: "键盘鼠标远程控制",
			remoteControlHint: "勾选后本视图才能向远程浏览器发送键盘、鼠标与导航指令；切换会自动重连（默认不勾选，即仅观看）。",
			remoteControlLocked: "需先在插件设置（齿轮）中开启「交互输入」才能勾选。",
			frameQuality: "画面质量",
			frameQualityDesc: "JPEG 编码质量，越高越清晰、占用带宽越大。",
			frameEveryNth: "抽帧间隔",
			frameEveryNthDesc: "每 N 帧取 1 帧；调大可降低负载，但画面会更卡顿。",
			frameMaxSize: "帧最大尺寸",
			frameMaxSizeDesc: "投影画面的像素上限，只影响清晰度与带宽，不改变页面实际布局。",
			frameWidth: "宽度",
			frameHeight: "高度",
			frameApplyHint: "帧参数保存后实时视图会自动重连，并按新参数取帧。",
			settingRangeHint: "超出范围的值保存时会自动收敛到最近的界限。",
			clickToType: "点击画面后可键盘输入",
			closeEndpointChanged: "CDP 地址已变更，正在重连…",
			closeFrameChanged: "帧参数已更新，正在重连…",
			closeBackpressure: "画面消费过慢，背压保护已断开连接",
			closedWithCode: "连接已断开（{code}）"
		};
		const en = {
			title: "CDP Live View",
			reconnect: "Reconnect",
			noTargets: "No browser targets are available",
			selectTarget: "Select a target",
			loading: "Waiting for frames…",
			back: "Back",
			forward: "Forward",
			reload: "Reload",
			navigate: "Go",
			address: "Enter URL",
			newTab: "New tab",
			closeTab: "Close tab",
			keepLastTab: "Keep at least one tab open (closing the last one exits the browser)",
			connected: "Connected",
			opening: "Authorizing…",
			connecting: "Connecting…",
			reconnecting: "Reconnecting…",
			disconnected: "Disconnected",
			hidden: "The panel is hidden; streaming is paused",
			retry: "Retry",
			endpoint: "CDP address",
			endpointDesc: "Chromium remote debugging address (http(s) or ws(s)); the live view reconnects automatically after saving a change.",
			endpointFallback: "Leave empty to use the default 127.0.0.1:9222. Accepts host:port (http:// is assumed) or a full URL.",
			interactive: "Interactive input",
			interactiveDesc: "Master switch: allow controlling the remote browser; actual control still needs the header's \"Keyboard & mouse control\" checkbox.",
			remoteControl: "Keyboard & mouse control",
			remoteControlHint: "Only when checked can this view send keyboard, mouse, and navigation commands; toggling reconnects (unchecked by default — view-only).",
			remoteControlLocked: "Turn on \"Interactive input\" in the plugin settings (gear) first.",
			frameQuality: "Frame quality",
			frameQualityDesc: "JPEG encoding quality; higher is sharper and heavier on bandwidth.",
			frameEveryNth: "Frame interval",
			frameEveryNthDesc: "Capture 1 of every N frames; higher trims load but looks choppier.",
			frameMaxSize: "Max frame size",
			frameMaxSizeDesc: "Pixel cap of the cast frames — sharpness/bandwidth only, never the page layout.",
			frameWidth: "Width",
			frameHeight: "Height",
			frameApplyHint: "Frame parameters reconnect the live view once saved, casting with the new values.",
			settingRangeHint: "Out-of-range values snap to the nearest bound on save.",
			clickToType: "Click the view to type",
			closeEndpointChanged: "CDP address changed; reconnecting…",
			closeFrameChanged: "Frame settings changed; reconnecting…",
			closeBackpressure: "Client fell behind; the backpressure guard closed the connection",
			closedWithCode: "Connection closed ({code})"
		};
		//#endregion
		//#region src/client/i18n.ts
		/**
		* Locale integration: registers the zh/en dictionaries with the DSH locale
		* service (via the client context's `locale` face) and serves `t()` from the
		* active locale. `t()` is a plain function over a module-level service
		* handle — React re-renders pick new copy up through the app-wide locale
		* re-render; the tab title and settings rows use `() => t(...)` callbacks so
		* their re-renders read fresh values.
		*
		* The active locale follows the DSH i18n system (the host-backed
		* `locale.preference` setting) rather than the raw browser language; the
		* browser language is only the pre-service fallback.
		*
		* @module dsh-sidebar-cdp-browser/client/i18n
		*/
		/** Attached service (module-level; the plugin is a singleton per page). */
		let localeService;
		/** The active locale id: the service snapshot, else the browser language. */
		function activeLocale() {
			return localeService?.getSnapshot().active ?? (typeof navigator !== "undefined" ? navigator.language : "en");
		}
		/** Translate one copy key in the active locale (zh* → zh, else en). */
		function t(key) {
			return (activeLocale().toLowerCase().startsWith("zh") ? zh : en)[key];
		}
		/** The known host-side close reasons, localized (unknown reasons pass
		*  through verbatim — they are diagnostic text, not UI copy). */
		const CLOSE_REASON_KEYS = {
			"cdp endpoint changed": "closeEndpointChanged",
			"cdp frame settings changed": "closeFrameChanged",
			"client backpressure limit exceeded": "closeBackpressure"
		};
		/** Localize a WebSocket close event into UI copy. */
		function closingMessage(code, reason) {
			const key = CLOSE_REASON_KEYS[reason];
			if (key !== void 0) return t(key);
			return reason !== "" ? reason : t("closedWithCode").replace("{code}", String(code));
		}
		/**
		* Wire the dictionaries to the service (called once from the plugin body).
		* @returns the disposer cordis holds via `ctx.effect`: unregisters the
		* dictionaries (each service disposer, when returned) and drops the
		* module-level service handle.
		*/
		function attachLocale(service) {
			localeService = service;
			const stops = ["zh", "en"].map((locale) => service.register(NS, locale, locale === "zh" ? { ...zh } : { ...en }));
			return () => {
				for (const stop of stops) if (typeof stop === "function") stop();
				localeService = void 0;
			};
		}
		//#endregion
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
		/** The code defaults as a complete value set. */
		function defaultFrameValues() {
			const values = {};
			for (const spec of FRAME_FIELD_SPECS) values[spec.key] = spec.def;
			return values;
		}
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
		//#endregion
		//#region \0dsh-cdp-css:/opt/dsh/plugins/dsh-sidebar-cdp-browser/src/client/cdp-live.module.css.mjs
		const css = ".RE9hea_root{height:100%;min-height:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);font-family:var(--dsw-font-family,system-ui, sans-serif);flex-direction:column;display:flex}.RE9hea_topRow{border-bottom:1px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;gap:8px;min-height:36px;padding:0 8px;display:flex}.RE9hea_endpointChip,.RE9hea_connectionToolbar{align-items:center;gap:6px;min-width:0;font-size:12px;display:flex}.RE9hea_endpointChip{color:var(--dsw-alias-label-tertiary);font-family:var(--dsw-font-mono,ui-monospace, monospace);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.RE9hea_settingsPanel{box-sizing:border-box;flex-direction:column;gap:8px;width:100%;min-width:320px;display:flex}.RE9hea_settingRow{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;flex:none;justify-content:space-between;align-items:center;gap:16px;min-width:0;padding:12px 14px;transition:border-color .16s,background .16s;display:flex}.RE9hea_settingRow:hover{border-color:var(--dsw-alias-label-dimmed)}.RE9hea_settingRowStack{flex-direction:column;justify-content:flex-start;align-items:stretch;gap:8px}.RE9hea_settingText{flex-direction:column;gap:4px;min-width:0;display:flex}.RE9hea_settingTitle{color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}.RE9hea_settingDesc{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}.RE9hea_settingHint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:18px}.RE9hea_settingControl{flex:none;align-items:center;gap:6px;display:flex}.RE9hea_settingTimes{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}.RE9hea_settingInput,.RE9hea_settingNumber{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;border-radius:8px;padding:5px 8px;font-size:13px;line-height:18px}.RE9hea_settingInput{width:100%;min-width:0;font-family:var(--dsw-font-mono,ui-monospace, monospace);flex:auto}.RE9hea_settingNumber{width:76px}.RE9hea_settingInput:focus-visible,.RE9hea_settingNumber:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.RE9hea_settingNumber[data-invalid=true]{border-color:var(--dsw-alias-state-error-primary)}.RE9hea_settingNumber[data-invalid=true]:focus-visible{outline-color:var(--dsw-alias-state-error-primary)}.RE9hea_settingSwitch{cursor:pointer;flex:none;display:inline-flex;position:relative}.RE9hea_switchInput{opacity:0;width:1px;height:1px;margin:0;position:absolute}.RE9hea_switchTrack{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:10px;align-items:center;width:36px;height:20px;padding:2px;transition:background .15s,border-color .15s;display:inline-flex}.RE9hea_switchThumb{background:var(--dsw-alias-label-tertiary);border-radius:50%;width:14px;height:14px;transition:transform .15s,background .15s;display:block}.RE9hea_settingSwitch:hover .RE9hea_switchTrack{border-color:var(--dsw-alias-label-dimmed)}.RE9hea_switchInput:checked+.RE9hea_switchTrack{border-color:var(--dsw-alias-button-primary-fill);background:var(--dsw-alias-button-primary-fill)}.RE9hea_switchInput:checked+.RE9hea_switchTrack .RE9hea_switchThumb{background:var(--dsw-alias-bg-layer-3);transform:translate(16px)}.RE9hea_switchInput:focus-visible+.RE9hea_switchTrack{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.RE9hea_connectionToolbar button,.RE9hea_statusOverlay button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);min-height:27px;color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:6px;padding:3px 8px}.RE9hea_connectionToolbar button:hover,.RE9hea_statusOverlay button:hover{background:var(--dsw-alias-interactive-bg-hover)}.RE9hea_connectionDot{background:var(--dsw-alias-label-tertiary);border-radius:50%;flex:none;width:8px;height:8px}.RE9hea_connectionStatus{align-items:center;gap:6px;min-width:0;display:flex}.RE9hea_controlToggle{border-right:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);white-space:nowrap;user-select:none;cursor:pointer;flex:none;align-items:center;gap:5px;padding-right:8px;font-size:12px;line-height:18px;display:inline-flex}.RE9hea_controlToggle:hover{color:var(--dsw-alias-label-primary)}.RE9hea_controlToggle input{width:13px;height:13px;accent-color:var(--dsw-alias-button-primary-fill);cursor:pointer;flex:none;margin:0}.RE9hea_controlToggle input:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.RE9hea_controlToggle[data-enabled=false]{color:var(--dsw-alias-label-dimmed);cursor:default}.RE9hea_controlToggle[data-enabled=false] input{cursor:default;opacity:.45}.RE9hea_connected{background:var(--dsw-alias-status-success)}.RE9hea_opening,.RE9hea_connecting,.RE9hea_reconnecting{background:var(--dsw-alias-status-warning)}.RE9hea_error{background:var(--dsw-alias-status-error)}.RE9hea_connectionLabel{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.RE9hea_targetTabs{border-bottom:1px solid var(--dsw-alias-border-l1);flex:none;align-items:stretch;gap:2px;padding:3px 6px;display:flex;overflow-x:auto}.RE9hea_tab{min-width:56px;max-width:180px;font:var(--dsw-font-xxs-12,12px system-ui);color:var(--dsw-alias-label-secondary);cursor:pointer;user-select:none;background:0 0;border:none;border-radius:6px;flex:none;align-items:center;gap:4px;padding:0 4px 0 10px;font-size:12px;line-height:26px;display:flex}.RE9hea_tab:hover{background:var(--dsw-alias-interactive-bg-hover)}.RE9hea_tabActive{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-active)}.RE9hea_tabTitle{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;overflow:hidden}.RE9hea_tabClose{width:18px;height:18px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:4px;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}.RE9hea_tabClose:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.RE9hea_tabClose:disabled{opacity:.4;cursor:default}.RE9hea_newTabButton{width:26px;height:26px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:50%;flex:none;justify-content:center;align-self:center;align-items:center;padding:0;display:inline-flex}.RE9hea_newTabButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.RE9hea_newTabButton:disabled{opacity:.4;cursor:default}.RE9hea_emptyTabs{color:var(--dsw-alias-label-tertiary);white-space:nowrap;padding:5px 8px;font-size:12px;line-height:26px}.RE9hea_browserBar{border-bottom:1px solid var(--dsw-alias-border-l1);flex:none;align-items:center;gap:4px;padding:6px 8px;display:flex}.RE9hea_iconButton{width:28px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:50%;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}.RE9hea_iconButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.RE9hea_iconButton:disabled{opacity:.4;cursor:default}.RE9hea_browserInput{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);min-width:0;height:28px;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xxs-12,12px system-ui);border-radius:6px;flex:1;padding:0 10px;font-size:12px}.RE9hea_browserInput:focus{border-color:var(--dsw-alias-border-l2);outline:none}.RE9hea_browserInput:disabled{opacity:.45;cursor:default}.RE9hea_viewport{background:var(--dsw-alias-bg-base);flex:1;min-height:0;position:relative;overflow:hidden}.RE9hea_canvasWrap{width:100%;height:100%;position:relative}.RE9hea_liveCanvas{touch-action:none;outline:none;width:100%;height:100%;display:block}.RE9hea_liveCanvas:focus-visible{outline:2px solid var(--dsw-alias-border-focus);outline-offset:-2px}.RE9hea_keySink{opacity:0;resize:none;pointer-events:none;caret-color:#0000;background:0 0;border:0;width:1px;height:1px;margin:0;padding:0;position:absolute;top:0;left:0;overflow:hidden}.RE9hea_typeHint{color:var(--dsw-alias-label-secondary);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 78%, transparent);border:1px solid var(--dsw-alias-border-l2);pointer-events:none;border-radius:999px;padding:2px 8px;font-size:11px;position:absolute;bottom:8px;right:8px}.RE9hea_statusOverlay{text-align:center;color:var(--dsw-alias-label-secondary);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 82%, transparent);flex-direction:column;justify-content:center;align-items:center;gap:10px;padding:24px;display:flex;position:absolute;inset:0}@media (width<=520px){.RE9hea_topRow{flex-direction:column;align-items:stretch;padding:5px 7px}.RE9hea_browserBar{flex-wrap:wrap}.RE9hea_browserInput{flex-basis:100%;order:2}.RE9hea_settingsPanel{min-width:0}.RE9hea_settingRow{flex-direction:column;align-items:stretch}.RE9hea_settingControl{justify-content:flex-start}}";
		const tagId = "dsh-sidebar-cdp-browser/cdp-live.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-sidebar-cdp-browser";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var cdp_live_module_css_default = {
			"switchInput": "RE9hea_switchInput",
			"topRow": "RE9hea_topRow",
			"opening": "RE9hea_opening",
			"reconnecting": "RE9hea_reconnecting",
			"emptyTabs": "RE9hea_emptyTabs",
			"settingRowStack": "RE9hea_settingRowStack",
			"newTabButton": "RE9hea_newTabButton",
			"connectionLabel": "RE9hea_connectionLabel",
			"settingSwitch": "RE9hea_settingSwitch",
			"connectionDot": "RE9hea_connectionDot",
			"tabTitle": "RE9hea_tabTitle",
			"browserBar": "RE9hea_browserBar",
			"settingControl": "RE9hea_settingControl",
			"statusOverlay": "RE9hea_statusOverlay",
			"settingsPanel": "RE9hea_settingsPanel",
			"connectionToolbar": "RE9hea_connectionToolbar",
			"browserInput": "RE9hea_browserInput",
			"controlToggle": "RE9hea_controlToggle",
			"viewport": "RE9hea_viewport",
			"liveCanvas": "RE9hea_liveCanvas",
			"iconButton": "RE9hea_iconButton",
			"connectionStatus": "RE9hea_connectionStatus",
			"switchTrack": "RE9hea_switchTrack",
			"connected": "RE9hea_connected",
			"settingRow": "RE9hea_settingRow",
			"settingDesc": "RE9hea_settingDesc",
			"typeHint": "RE9hea_typeHint",
			"settingTimes": "RE9hea_settingTimes",
			"settingInput": "RE9hea_settingInput",
			"endpointChip": "RE9hea_endpointChip",
			"settingNumber": "RE9hea_settingNumber",
			"switchThumb": "RE9hea_switchThumb",
			"settingTitle": "RE9hea_settingTitle",
			"tabActive": "RE9hea_tabActive",
			"tabClose": "RE9hea_tabClose",
			"error": "RE9hea_error",
			"tab": "RE9hea_tab",
			"settingText": "RE9hea_settingText",
			"targetTabs": "RE9hea_targetTabs",
			"root": "RE9hea_root",
			"canvasWrap": "RE9hea_canvasWrap",
			"keySink": "RE9hea_keySink",
			"connecting": "RE9hea_connecting",
			"settingHint": "RE9hea_settingHint"
		};
		//#endregion
		//#region src/client/settings.tsx
		/**
		* The side-card settings panel ("设置 → 侧边卡片 → 侧边栏内容 → CDP实时视图"
		* gear popup): the CDP endpoint, the interactive-mode switch, and the four
		* frame-capture knobs (quality / interval / max width × height), persisted in
		* better-sidebar's `pluginSettings['dsh-sidebar-cdp-browser:live']`.
		*
		* The row chrome mirrors better-sidebar's own secondary-settings popup rows
		* (l2 hairline card, 12px radius, layer-3 fill, 36×20 switch, compact numeric
		* inputs) so this panel reads as one design language with the other
		* sidebar-content feature panels. Number rows follow the same discipline as
		* dsh-sidebar-vscode's cap rows: the input shows the EFFECTIVE value at rest
		* (the stored override, else the host-served effective value — loader config
		* merged with overrides — else the code default), out-of-range drafts flag
		* live, and blur/Enter commits the clamped value only when it changed.
		*
		* @module dsh-sidebar-cdp-browser/client/settings
		*/
		/** Read-only route serving the host's effective frame config (routes/http.ts). */
		const CONFIG_ROUTE = "/dsh-cdp-live/api/config";
		/** One frame spec looked up by key (the table is tiny; find is clearest). */
		function specOf(key) {
			const spec = FRAME_FIELD_SPECS.find((entry) => entry.key === key);
			if (spec === void 0) throw new Error(`unknown frame field: ${key}`);
			return spec;
		}
		/** Empty endpoint = the default loopback address (the host normalizes). */
		function readSettings(value) {
			return {
				endpoint: typeof value?.endpoint === "string" ? value.endpoint : "",
				interactive: value?.interactive === true,
				frame: readFrameOverrides(value)
			};
		}
		/**
		* One bounded numeric input of a frame row. The draft is local state that is
		* null at rest (the input mirrors the effective value) and raw text while
		* editing, so external store updates never clobber a mid-edit draft and an
		* unchanged draft never produces a write.
		*/
		function FrameNumberInput(props) {
			const { spec, stored, fallback, ariaLabel, onWrite } = props;
			const effective = stored ?? fallback;
			const [draft, setDraft] = (0, react.useState)(null);
			const shown = draft ?? String(effective);
			const parsed = Number(shown);
			const outOfRange = shown.trim() !== "" && (!Number.isFinite(parsed) || parsed < spec.min || parsed > spec.max);
			/** Blur / Enter: empty or unparsable reverts; otherwise commit the
			* clamped value, writing only when it differs from what is in effect. */
			const commit = () => {
				if (draft === null) return;
				const text = draft.trim();
				setDraft(null);
				if (text === "" || !Number.isFinite(Number(text))) return;
				const clamped = Math.min(spec.max, Math.max(spec.min, Math.round(Number(text))));
				if (clamped !== effective) onWrite(clamped);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
				type: "number",
				className: cdp_live_module_css_default.settingNumber,
				value: shown,
				min: spec.min,
				max: spec.max,
				step: 1,
				inputMode: "numeric",
				"aria-label": ariaLabel,
				"aria-invalid": outOfRange,
				"data-invalid": outOfRange ? "true" : void 0,
				title: outOfRange ? t("settingRangeHint") : void 0,
				onChange: (event) => {
					setDraft(event.currentTarget.value);
				},
				onBlur: commit,
				onKeyDown: (event) => {
					if (event.key !== "Enter") return;
					event.preventDefault();
					commit();
					event.currentTarget.blur();
				}
			});
		}
		/** One frame row: title/description left, a single numeric input right. */
		function FrameRow(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: cdp_live_module_css_default.settingRow,
				"data-cdp-frame-row": props.spec.key,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: cdp_live_module_css_default.settingText,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: cdp_live_module_css_default.settingTitle,
						children: props.title
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: cdp_live_module_css_default.settingDesc,
						children: props.desc
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: cdp_live_module_css_default.settingControl,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FrameNumberInput, {
						spec: props.spec,
						stored: props.stored,
						fallback: props.fallback,
						ariaLabel: props.title,
						onWrite: props.onWrite
					})
				})]
			});
		}
		function SettingsPanel(props) {
			const settings = readSettings(props.pluginSettings);
			const [draft, setDraft] = (0, react.useState)(settings.endpoint);
			(0, react.useEffect)(() => {
				setDraft(settings.endpoint);
			}, [settings.endpoint]);
			const [hostFrame, setHostFrame] = (0, react.useState)(() => resolveFrameValues(defaultFrameValues(), settings.frame));
			(0, react.useEffect)(() => {
				if (typeof fetch !== "function") return;
				let cancelled = false;
				try {
					fetch(CONFIG_ROUTE, { headers: { accept: "application/json" } }).then(async (response) => await response.json()).then((body) => {
						if (!cancelled && body.ok === true && body.value?.frame !== void 0) setHostFrame(body.value.frame);
					}).catch(() => void 0);
				} catch {}
				return () => {
					cancelled = true;
				};
			}, []);
			/** The value one input shows at rest: the stored override, else effective. */
			const fallbackOf = (spec) => settings.frame[spec.key] ?? hostFrame[spec.key] ?? spec.def;
			const writeFrame = (key, next) => {
				props.updatePluginSetting(key, next);
			};
			const commitEndpoint = () => {
				const next = draft.trim();
				if (next !== settings.endpoint) props.updatePluginSetting("endpoint", next);
				else setDraft(next);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: cdp_live_module_css_default.settingsPanel,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `${cdp_live_module_css_default.settingRow} ${cdp_live_module_css_default.settingRowStack}`,
						"data-cdp-endpoint-row": true,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: cdp_live_module_css_default.settingText,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: cdp_live_module_css_default.settingTitle,
									children: t("endpoint")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: cdp_live_module_css_default.settingDesc,
									children: t("endpointDesc")
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "text",
								className: cdp_live_module_css_default.settingInput,
								value: draft,
								placeholder: DEFAULT_ENDPOINT_DISPLAY,
								"aria-label": t("endpoint"),
								spellCheck: false,
								onChange: (event) => {
									setDraft(event.target.value);
								},
								onBlur: commitEndpoint,
								onKeyDown: (event) => {
									if (event.key !== "Enter") return;
									event.preventDefault();
									commitEndpoint();
									event.currentTarget.blur();
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: cdp_live_module_css_default.settingDesc,
								children: t("endpointFallback")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: cdp_live_module_css_default.settingRow,
						"data-cdp-interactive-row": true,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: cdp_live_module_css_default.settingText,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: cdp_live_module_css_default.settingTitle,
								children: t("interactive")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: cdp_live_module_css_default.settingDesc,
								children: t("interactiveDesc")
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: cdp_live_module_css_default.settingSwitch,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								className: cdp_live_module_css_default.switchInput,
								checked: settings.interactive,
								"aria-label": t("interactive"),
								onChange: (event) => {
									props.updatePluginSetting("interactive", event.currentTarget.checked);
								}
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: cdp_live_module_css_default.switchTrack,
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: cdp_live_module_css_default.switchThumb })
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FrameRow, {
						spec: specOf("frameQuality"),
						title: t("frameQuality"),
						desc: t("frameQualityDesc"),
						stored: settings.frame.frameQuality,
						fallback: fallbackOf(specOf("frameQuality")),
						onWrite: (next) => writeFrame("frameQuality", next)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FrameRow, {
						spec: specOf("frameEveryNth"),
						title: t("frameEveryNth"),
						desc: t("frameEveryNthDesc"),
						stored: settings.frame.frameEveryNth,
						fallback: fallbackOf(specOf("frameEveryNth")),
						onWrite: (next) => writeFrame("frameEveryNth", next)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: cdp_live_module_css_default.settingRow,
						"data-cdp-frame-row": "frameMaxSize",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: cdp_live_module_css_default.settingText,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: cdp_live_module_css_default.settingTitle,
								children: t("frameMaxSize")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: cdp_live_module_css_default.settingDesc,
								children: t("frameMaxSizeDesc")
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: cdp_live_module_css_default.settingControl,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FrameNumberInput, {
									spec: specOf("frameMaxWidth"),
									stored: settings.frame.frameMaxWidth,
									fallback: fallbackOf(specOf("frameMaxWidth")),
									ariaLabel: `${t("frameMaxSize")} · ${t("frameWidth")}`,
									onWrite: (next) => writeFrame("frameMaxWidth", next)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: cdp_live_module_css_default.settingTimes,
									"aria-hidden": "true",
									children: "×"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FrameNumberInput, {
									spec: specOf("frameMaxHeight"),
									stored: settings.frame.frameMaxHeight,
									fallback: fallbackOf(specOf("frameMaxHeight")),
									ariaLabel: `${t("frameMaxSize")} · ${t("frameHeight")}`,
									onWrite: (next) => writeFrame("frameMaxHeight", next)
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: cdp_live_module_css_default.settingHint,
						children: t("frameApplyHint")
					})
				]
			});
		}
		//#endregion
		//#region src/client/use-target-store.ts
		function useTargetStore(initialKey) {
			const [targets, setTargets] = (0, react.useState)([]);
			const [selectedKey, setSelectedKey] = (0, react.useState)(initialKey);
			const replace = (0, react.useCallback)((next) => {
				const live = next.filter((target) => target.lifecycle !== "closed");
				setTargets(live);
				setSelectedKey((current) => current && live.some((target) => target.key === current) ? current : live[0]?.key);
			}, []);
			const remove = (0, react.useCallback)((key) => {
				setTargets((current) => current.filter((target) => target.key !== key));
				setSelectedKey((current) => current === key ? void 0 : current);
			}, []);
			const select = (0, react.useCallback)((key) => setSelectedKey(key), []);
			return {
				targets,
				selectedKey,
				selected: (0, react.useMemo)(() => targets.find((target) => target.key === selectedKey), [targets, selectedKey]),
				replace,
				remove,
				select
			};
		}
		//#endregion
		//#region src/client/use-cdp-socket.ts
		function useCdpSocket(options) {
			const { sessionId, mode, enabled, targetKey } = options;
			const socketRef = (0, react.useRef)(null);
			const selectedRef = (0, react.useRef)();
			const pendingMeta = (0, react.useRef)(null);
			const callbacks = (0, react.useRef)({
				onMessage: options.onMessage,
				onFrame: options.onFrame
			});
			const [state, setState] = (0, react.useState)("idle");
			const [error, setError] = (0, react.useState)();
			const [generation, setGeneration] = (0, react.useState)(0);
			callbacks.current = {
				onMessage: options.onMessage,
				onFrame: options.onFrame
			};
			const send = (0, react.useCallback)((command) => {
				const socket = socketRef.current;
				if (socket === null || socket.readyState !== WebSocket.OPEN) return false;
				socket.send(encodeCommand(command));
				return true;
			}, []);
			const reconnect = (0, react.useCallback)(() => setGeneration((value) => value + 1), []);
			(0, react.useEffect)(() => {
				if (!enabled) {
					setState("idle");
					return;
				}
				let disposed = false;
				let failures = 0;
				let retryTimer;
				let controller;
				const connect = async () => {
					if (disposed) return;
					controller?.abort();
					controller = new AbortController();
					try {
						setState(failures === 0 ? "opening" : "reconnecting");
						setError(void 0);
						const opened = await openLiveSession(sessionId, mode, controller.signal);
						if (disposed) return;
						setState("connecting");
						const socket = new WebSocket(websocketUrl(opened.wsPath, opened.ticket));
						socket.binaryType = "arraybuffer";
						socketRef.current = socket;
						socket.onopen = () => {
							failures = 0;
							setState("connected");
							socket.send(encodeCommand({
								v: 1,
								type: "targets.list",
								requestId: requestId()
							}));
							if (targetKey !== void 0) {
								selectedRef.current = targetKey;
								socket.send(encodeCommand({
									v: 1,
									type: "target.select",
									requestId: requestId(),
									targetKey
								}));
							}
						};
						socket.onmessage = (event) => {
							if (typeof event.data === "string") {
								const message = decodeMessage(event.data);
								if (message === null) return;
								if (message.type === "screencast.frameMeta") pendingMeta.current = {
									targetKey: message.targetKey,
									sequence: message.sequence,
									metadata: message.metadata,
									mimeType: message.mimeType,
									receivedAt: message.receivedAt
								};
								else callbacks.current.onMessage?.(message);
								return;
							}
							const pending = pendingMeta.current;
							if (pending === null) return;
							pendingMeta.current = null;
							const blob = event.data instanceof Blob ? event.data : new Blob([event.data], { type: pending.mimeType ?? "image/jpeg" });
							callbacks.current.onFrame?.({
								...pending,
								blob
							});
						};
						socket.onerror = () => socket.close();
						socket.onclose = (event) => {
							if (socketRef.current === socket) socketRef.current = null;
							if (disposed) return;
							failures += 1;
							setError(closingMessage(event.code, event.reason));
							if (failures >= 5) {
								setState("error");
								return;
							}
							const delay = Math.min(8e3, 500 * 2 ** Math.min(failures, 4)) + Math.round(Math.random() * 250);
							retryTimer = window.setTimeout(() => {
								connect();
							}, delay);
						};
					} catch (reason) {
						if (disposed || controller.signal.aborted) return;
						failures += 1;
						setError(reason instanceof Error ? reason.message : String(reason));
						if (failures >= 5) {
							setState("error");
							return;
						}
						retryTimer = window.setTimeout(() => {
							connect();
						}, Math.min(8e3, 500 * 2 ** Math.min(failures, 4)));
					}
				};
				connect();
				return () => {
					disposed = true;
					controller?.abort();
					if (retryTimer !== void 0) window.clearTimeout(retryTimer);
					socketRef.current?.close(1e3, "view hidden");
					socketRef.current = null;
					pendingMeta.current = null;
					selectedRef.current = void 0;
				};
			}, [
				enabled,
				generation,
				mode,
				sessionId
			]);
			(0, react.useEffect)(() => {
				if (state !== "connected" || targetKey === selectedRef.current) return;
				selectedRef.current = targetKey;
				if (targetKey === void 0) return;
				send({
					v: 1,
					type: "target.select",
					requestId: requestId(),
					targetKey
				});
			}, [
				send,
				state,
				targetKey
			]);
			return {
				state,
				error,
				reconnect,
				send
			};
		}
		//#endregion
		//#region src/client/ConnectionToolbar.tsx
		function ConnectionToolbar(props) {
			const label = props.state === "connected" ? t("connected") : props.state === "opening" ? t("opening") : props.state === "connecting" ? t("connecting") : props.state === "reconnecting" ? t("reconnecting") : t("disconnected");
			const stateClass = props.state === "idle" ? "" : ` ${cdp_live_module_css_default[props.state]}`;
			const control = props.remoteControl;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: cdp_live_module_css_default.connectionToolbar,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: cdp_live_module_css_default.controlToggle,
						"data-enabled": control.enabled ? "true" : "false",
						title: control.enabled ? t("remoteControlHint") : t("remoteControlLocked"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: control.checked,
							disabled: !control.enabled,
							onChange: (event) => control.onChange(event.currentTarget.checked)
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: cdp_live_module_css_default.controlToggleLabel,
							children: t("remoteControl")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: cdp_live_module_css_default.connectionStatus,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: `${cdp_live_module_css_default.connectionDot}${stateClass}`,
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: cdp_live_module_css_default.connectionLabel,
							title: props.error,
							children: label
						})]
					}),
					props.state !== "connected" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: props.onReconnect,
						children: t("reconnect")
					})
				]
			});
		}
		//#endregion
		//#region src/client/icons.tsx
		function glyph(size, viewBox, children, className) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				className,
				viewBox,
				fill: "none",
				xmlns: "http://www.w3.org/2000/svg",
				"aria-hidden": "true",
				children
			});
		}
		/** ic_ds_chevron_left_outline_14 — back. */
		const IconChevronLeftOutline14 = ({ size = 14, className }) => glyph(size, "0 0 14 14", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
			d: "M8.5 2.15137L8.07617 2.57617L5.34863 5.30273C5.09294 5.55843 4.86618 5.78438 4.70215 5.98828C4.53117 6.20088 4.38244 6.44405 4.33398 6.75C4.30778 6.91565 4.30778 7.08435 4.33398 7.25C4.38244 7.55595 4.53117 7.79912 4.70215 8.01172C4.86618 8.21561 5.09294 8.44157 5.34863 8.69727L8.07617 11.4238L8.5 11.8486L9.34863 11L8.92383 10.5762L6.19727 7.84863C5.92268 7.57405 5.75151 7.40124 5.6377 7.25977C5.53096 7.12709 5.52187 7.07728 5.51953 7.0625C5.51297 7.02105 5.51297 6.97895 5.51953 6.9375C5.52187 6.92272 5.53096 6.87291 5.6377 6.74023C5.75152 6.59876 5.92268 6.42595 6.19727 6.15137L8.92383 3.42383L9.34863 3L8.5 2.15137Z",
			fill: "currentColor"
		}), className);
		/** ic_ds_chevron_right_outline_14 — forward. */
		const IconChevronRightOutline14 = ({ size = 14, className }) => glyph(size, "0 0 14 14", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
			d: "M5.5 2.15137L5.92383 2.57617L8.65137 5.30273C8.90706 5.55843 9.13382 5.78438 9.29785 5.98828C9.46883 6.20088 9.61756 6.44405 9.66602 6.75C9.69222 6.91565 9.69222 7.08435 9.66602 7.25C9.61756 7.55595 9.46883 7.79912 9.29785 8.01172C9.13382 8.21561 8.90706 8.44157 8.65137 8.69727L5.92383 11.4238L5.5 11.8486L4.65137 11L5.07617 10.5762L7.80273 7.84863C8.07732 7.57405 8.24849 7.40124 8.3623 7.25977C8.46904 7.12709 8.47813 7.07728 8.48047 7.0625C8.48703 7.02105 8.48703 6.97895 8.48047 6.9375C8.47813 6.92272 8.46904 6.87291 8.3623 6.74023C8.24848 6.59876 8.07732 6.42595 7.80273 6.15137L5.07617 3.42383L4.65137 3L5.5 2.15137Z",
			fill: "currentColor"
		}), className);
		/** ic_ds_refresh_outline_14 — reload. */
		const IconRefreshOutline14 = ({ size = 14, className }) => glyph(size, "0 0 14 14", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
			d: "M1.272 6.21348C1.70645 3.08888 4.59169 0.908064 7.71634 1.34239C8.95495 1.51469 10.0438 2.07331 10.8814 2.87755L11.9458 1.81407C12.1347 1.6255 12.4572 1.75911 12.4575 2.02598V5.08751C12.4574 5.25303 12.3233 5.38731 12.1577 5.38731H9.0972C8.82993 5.38731 8.69629 5.06361 8.88528 4.87462L10.0327 3.72618C9.3732 3.09994 8.52006 2.66569 7.5513 2.53087C5.08313 2.18779 2.80376 3.91044 2.46048 6.37852C2.11747 8.84665 3.84009 11.1261 6.30814 11.4693C8.77612 11.8121 11.0557 10.0896 11.399 7.62169L11.9937 7.70372L12.5874 7.78673C12.153 10.9112 9.26756 13.0919 6.1431 12.6578C3.01854 12.2234 0.837738 9.33809 1.272 6.21348Z",
			fill: "currentColor"
		}), className);
		/** ic_ds_link_outline_14 — go (same glyph the built-in sidebar browser uses for its go button). */
		const IconLinkOutline14 = ({ size = 14, className }) => glyph(size, "0 0 14 14", /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
			d: "M8.19727 5.86969C9.2092 6.90067 9.20969 8.55271 8.19727 9.58338L6.88871 10.8919C5.85801 11.9039 4.20584 11.9037 3.17502 10.8919L3.10873 10.8243C2.09622 9.7934 2.09626 8.14148 3.10873 7.11058L4.36757 5.85174C4.28261 6.33758 4.30355 6.84354 4.44077 7.33362L3.89249 7.88053C3.30043 8.48348 3.30108 9.4507 3.89318 10.0536L3.94566 10.1061C4.54861 10.698 5.51521 10.6981 6.11808 10.1061L7.41283 8.81275C8.00484 8.21002 8.00504 7.24267 7.41352 6.63964L7.35966 6.58716C7.21975 6.44976 7.05995 6.34434 6.89009 6.27089L7.70009 5.4609C7.85176 5.55768 7.99607 5.67091 8.1296 5.80202L8.19727 5.86969Z",
			fill: "currentColor"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
			d: "M5.80913 8.12648C4.79584 7.09547 4.79591 5.44245 5.80913 4.41141C5.81733 4.40304 5.82707 4.39209 5.8409 4.37826L7.07833 3.14082C7.09224 3.12693 7.10311 3.11729 7.11148 3.10906C8.14253 2.09591 9.79557 2.09579 10.8266 3.10906L10.8908 3.17328C11.9041 4.20425 11.9039 5.85727 10.8908 6.88835L9.63193 8.14581C9.70566 7.66581 9.67564 7.16895 9.53456 6.68948L10.1063 6.11772C10.6989 5.51458 10.6992 4.54691 10.1063 3.94391L10.0552 3.8942C9.45215 3.30157 8.48446 3.30151 7.88142 3.8942L6.59358 5.18204C6.00081 5.78507 6.00092 6.75274 6.59358 7.35584L6.6433 7.40694C6.77998 7.54132 6.93555 7.64528 7.10112 7.71837L6.29251 8.52699C6.14446 8.43127 6.00395 8.31906 5.87335 8.1907L5.80913 8.12648Z",
			fill: "currentColor"
		})] }), className);
		/** ic_ds_plus_outline_16 — new tab. */
		const IconPlusOutline16 = ({ size = 16, className }) => glyph(size, "0 0 16 16", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
			d: "M8.64453 1.5V7.34961H14.5V8.65039H8.64453V14.5H7.34473V8.65039H1.5V7.34961H7.34473V1.5H8.64453Z",
			fill: "currentColor"
		}), className);
		/** ic_ds_close_fill_14 — close tab (same glyph the better-sidebar tab bar uses). */
		const IconCloseFill14 = ({ size = 14, className }) => glyph(size, "0 0 14 14", /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
			d: "M10.6074 4.40278L8.00975 6.99973L10.6074 9.59739L9.59736 10.6074L6.9997 8.00978L4.40274 10.6074L3.3927 9.59739L5.98966 6.99973L3.3927 4.40278L4.40274 3.39273L6.9997 5.98969L9.59736 3.39273L10.6074 4.40278Z",
			fill: "currentColor"
		}), className);
		//#endregion
		//#region src/client/TargetTabStrip.tsx
		/**
		* Remote browser tabs, styled after the better-sidebar tab bar: one row of
		* title tabs (active tab highlighted, title truncated with the URL as the
		* tooltip), a close button per tab, and a trailing "+" that opens a new tab —
		* the close/new controls only render while the session allows interaction.
		*/
		function TargetTabStrip(props) {
			const lastTab = props.targets.length <= 1;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: cdp_live_module_css_default.targetTabs,
				role: "tablist",
				children: [
					props.targets.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: cdp_live_module_css_default.emptyTabs,
						children: t("noTargets")
					}),
					props.targets.map((target) => {
						const active = target.key === props.selectedKey;
						const label = target.title || target.url || target.type;
						const closeBlocked = props.canClose && lastTab;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							role: "tab",
							"aria-selected": active,
							tabIndex: 0,
							className: `${cdp_live_module_css_default.tab}${active ? ` ${cdp_live_module_css_default.tabActive}` : ""}`,
							onClick: () => props.onSelect(target.key),
							onKeyDown: (event) => {
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									props.onSelect(target.key);
								}
							},
							title: `${label}\n${target.url}`,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: cdp_live_module_css_default.tabTitle,
								children: label
							}), props.canClose && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: cdp_live_module_css_default.tabClose,
								"aria-label": closeBlocked ? t("keepLastTab") : t("closeTab"),
								title: closeBlocked ? t("keepLastTab") : t("closeTab"),
								disabled: props.disabled || closeBlocked,
								onClick: (event) => {
									event.stopPropagation();
									props.onClose(target.key);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCloseFill14, { size: 12 })
							})]
						}, target.key);
					}),
					props.canCreate && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: cdp_live_module_css_default.newTabButton,
						"aria-label": t("newTab"),
						title: t("newTab"),
						disabled: props.disabled,
						onClick: props.onCreate,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconPlusOutline16, { size: 14 })
					})
				]
			});
		}
		//#endregion
		//#region src/client/BrowserToolbar.tsx
		/**
		* Navigation chrome, styled after the built-in better-sidebar browser bar:
		* circular token-driven icon buttons (chevrons / refresh / link-go) around a
		* single-line address input — same glyphs and same spacing rhythm.
		*
		* Edit ownership uses a dirty ref, NOT blur: clicking 前往 blurs the input
		* BEFORE the click fires, so an onBlur re-sync would clobber the typed URL
		* back to the current page's URL and navigate to the OLD address (the exact
		* bug fixed here). The input keeps the user's text across blur and only
		* re-syncs when a navigation actually changes the URL (dirty=false by then);
		* Escape abandons the edit explicitly. The parent remounts this component
		* per target switch (key=targetKey), which also resets any stale edit.
		*/
		function BrowserToolbar(props) {
			const [value, setValue] = (0, react.useState)(props.url ?? "");
			const dirty = (0, react.useRef)(false);
			(0, react.useEffect)(() => {
				if (!dirty.current) setValue(props.url ?? "");
			}, [props.url]);
			const abandon = () => {
				dirty.current = false;
				setValue(props.url ?? "");
			};
			const go = () => {
				const input = value.trim();
				if (!input) return;
				dirty.current = false;
				props.onNavigate(/^https?:\/\//i.test(input) ? input : `https://${input}`);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: cdp_live_module_css_default.browserBar,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: cdp_live_module_css_default.iconButton,
						"aria-label": t("back"),
						title: t("back"),
						disabled: props.disabled,
						onClick: props.onBack,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronLeftOutline14, {})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: cdp_live_module_css_default.iconButton,
						"aria-label": t("forward"),
						title: t("forward"),
						disabled: props.disabled,
						onClick: props.onForward,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronRightOutline14, {})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: cdp_live_module_css_default.iconButton,
						"aria-label": t("reload"),
						title: t("reload"),
						disabled: props.disabled,
						onClick: props.onReload,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefreshOutline14, {})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						ref: props.inputRef,
						className: cdp_live_module_css_default.browserInput,
						"aria-label": t("address"),
						value,
						placeholder: t("address"),
						spellCheck: false,
						disabled: props.disabled,
						onChange: (event) => {
							dirty.current = true;
							setValue(event.target.value);
						},
						onKeyDown: (event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								go();
							} else if (event.key === "Escape") {
								event.preventDefault();
								abandon();
							}
							event.stopPropagation();
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: cdp_live_module_css_default.iconButton,
						"aria-label": t("navigate"),
						title: t("navigate"),
						disabled: props.disabled || !value.trim(),
						onClick: go,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconLinkOutline14, {})
					})
				]
			});
		}
		//#endregion
		//#region src/client/geometry.ts
		function frameSize(metadata, fallback) {
			return {
				width: positive(metadata?.deviceWidth) ?? fallback.width,
				height: positive(metadata?.deviceHeight) ?? fallback.height
			};
		}
		function containRect(container, content) {
			if (container.width <= 0 || container.height <= 0 || content.width <= 0 || content.height <= 0) return {
				x: 0,
				y: 0,
				width: 0,
				height: 0,
				scale: 1
			};
			const scale = Math.min(container.width / content.width, container.height / content.height);
			const width = content.width * scale;
			const height = content.height * scale;
			return {
				x: (container.width - width) / 2,
				y: (container.height - height) / 2,
				width,
				height,
				scale
			};
		}
		function clientToFrame(client, bounds, draw, frame) {
			const x = client.x - bounds.left - draw.x;
			const y = client.y - bounds.top - draw.y;
			if (x < 0 || y < 0 || x > draw.width || y > draw.height || draw.width === 0 || draw.height === 0) return null;
			return {
				x: clamp(x / draw.width * frame.width, 0, frame.width),
				y: clamp(y / draw.height * frame.height, 0, frame.height)
			};
		}
		function positive(value) {
			return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : void 0;
		}
		function clamp(value, min, max) {
			return Math.min(max, Math.max(min, value));
		}
		//#endregion
		//#region src/client/frame-renderer.ts
		function createFrameRenderer() {
			let generation = 0;
			let bitmap = null;
			return {
				async draw(canvas, frame) {
					const request = ++generation;
					const next = await createImageBitmap(frame.blob);
					if (request !== generation) {
						next.close();
						return null;
					}
					bitmap?.close();
					bitmap = next;
					const context = canvas.getContext("2d", { alpha: false });
					if (!context) return null;
					const ratio = window.devicePixelRatio || 1;
					const cssSize = {
						width: canvas.clientWidth,
						height: canvas.clientHeight
					};
					const wantedWidth = Math.max(1, Math.round(cssSize.width * ratio));
					const wantedHeight = Math.max(1, Math.round(cssSize.height * ratio));
					if (canvas.width !== wantedWidth || canvas.height !== wantedHeight) {
						canvas.width = wantedWidth;
						canvas.height = wantedHeight;
					}
					context.setTransform(ratio, 0, 0, ratio, 0, 0);
					context.fillStyle = getComputedStyle(canvas).getPropertyValue("--dsw-alias-bg-base").trim() || "rgb(0 0 0)";
					context.fillRect(0, 0, cssSize.width, cssSize.height);
					const draw = containRect(cssSize, frameSize(frame.metadata, {
						width: next.width,
						height: next.height
					}));
					context.imageSmoothingEnabled = true;
					context.imageSmoothingQuality = "high";
					context.drawImage(next, draw.x, draw.y, draw.width, draw.height);
					return draw;
				},
				dispose() {
					generation++;
					bitmap?.close();
					bitmap = null;
				}
			};
		}
		//#endregion
		//#region src/client/input-bridge.ts
		function attachInputBridge(options) {
			const { canvas } = options;
			let buttons = 0;
			let moveFrame;
			let latestMove;
			const point = (event) => {
				const draw = options.drawRect();
				return draw ? clientToFrame({
					x: event.clientX,
					y: event.clientY
				}, canvas.getBoundingClientRect(), draw, options.frameSize()) : null;
			};
			const emit = (input) => {
				options.sendMouse(input, options.frameId());
			};
			const flushMove = () => {
				moveFrame = void 0;
				const event = latestMove;
				latestMove = void 0;
				if (event === void 0) return;
				const p = point(event);
				if (p !== null) emit({
					type: "mouseMoved",
					...p,
					button: "none",
					buttons,
					modifiers: modifiersOf(event)
				});
			};
			const move = (event) => {
				latestMove = event;
				if (moveFrame === void 0) moveFrame = window.requestAnimationFrame(flushMove);
			};
			const down = (event) => {
				const p = point(event);
				if (p === null) return;
				canvas.setPointerCapture(event.pointerId);
				buttons = event.buttons;
				emit({
					type: "mousePressed",
					...p,
					button: buttonOf(event.button),
					buttons,
					clickCount: event.detail || 1,
					modifiers: modifiersOf(event)
				});
			};
			const release = (event, cancelled = false) => {
				const p = point(event);
				buttons = cancelled ? 0 : event.buttons;
				if (p !== null) emit({
					type: "mouseReleased",
					...p,
					button: cancelled ? "none" : buttonOf(event.button),
					buttons,
					clickCount: event.detail || 1,
					modifiers: modifiersOf(event)
				});
			};
			const wheel = (event) => {
				const p = point(event);
				if (p === null) return;
				event.preventDefault();
				const factor = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? options.frameSize().height : 1;
				emit({
					type: "mouseWheel",
					...p,
					button: "none",
					buttons,
					deltaX: event.deltaX * factor,
					deltaY: event.deltaY * factor,
					modifiers: modifiersOf(event)
				});
			};
			const context = (event) => event.preventDefault();
			const cancel = (event) => release(event, true);
			canvas.addEventListener("pointermove", move);
			canvas.addEventListener("pointerdown", down);
			canvas.addEventListener("pointerup", release);
			canvas.addEventListener("pointercancel", cancel);
			canvas.addEventListener("wheel", wheel, { passive: false });
			canvas.addEventListener("contextmenu", context);
			return () => {
				if (moveFrame !== void 0) window.cancelAnimationFrame(moveFrame);
				canvas.removeEventListener("pointermove", move);
				canvas.removeEventListener("pointerdown", down);
				canvas.removeEventListener("pointerup", release);
				canvas.removeEventListener("pointercancel", cancel);
				canvas.removeEventListener("wheel", wheel);
				canvas.removeEventListener("contextmenu", context);
			};
		}
		function buttonOf(button) {
			return button === 0 ? "left" : button === 1 ? "middle" : button === 2 ? "right" : button === 3 ? "back" : button === 4 ? "forward" : "none";
		}
		function modifiersOf(event) {
			return (event.altKey ? 1 : 0) | (event.ctrlKey ? 2 : 0) | (event.metaKey ? 4 : 0) | (event.shiftKey ? 8 : 0);
		}
		/** Windows virtual-key codes for the keys pages most often switch on. */
		const VK = {
			Backspace: 8,
			Tab: 9,
			Enter: 13,
			Shift: 16,
			Control: 17,
			Alt: 18,
			CapsLock: 20,
			Escape: 27,
			Space: 32,
			PageUp: 33,
			PageDown: 34,
			End: 35,
			Home: 36,
			ArrowLeft: 37,
			ArrowUp: 38,
			ArrowRight: 39,
			ArrowDown: 40,
			Insert: 45,
			Delete: 46,
			Meta: 91,
			ContextMenu: 93
		};
		/** Map a DOM keyboard event to the CDP key input. Printable keys carry `text`
		*  so the page's own input pipeline produces the character (the Puppeteer
		*  `keyboard.type` semantics); Ctrl/Meta combos suppress text — they are
		*  shortcuts, not typing. */
		function mapKeyboardEvent(event, type, keyCodeOf = keyCodeFor) {
			const key = typeof event.key === "string" ? event.key : "";
			const code = typeof event.code === "string" ? event.code : "";
			const ctrlOrMeta = event.ctrlKey === true || event.metaKey === true;
			const modifiers = (event.altKey === true ? 1 : 0) | (event.ctrlKey === true ? 2 : 0) | (event.metaKey === true ? 4 : 0) | (event.shiftKey === true ? 8 : 0);
			const printable = key.length === 1 && !ctrlOrMeta;
			const keyCode = keyCodeOf(event);
			return {
				type,
				...key !== "" ? { key } : {},
				...code !== "" ? { code } : {},
				...printable ? {
					text: key,
					unmodifiedText: key.toLowerCase()
				} : {},
				...keyCode !== void 0 ? {
					windowsVirtualKeyCode: keyCode,
					nativeVirtualKeyCode: keyCode
				} : {},
				modifiers,
				...event.repeat === true ? { autoRepeat: true } : {}
			};
		}
		function keyCodeFor(event) {
			const key = typeof event.key === "string" ? event.key : "";
			if (key in VK) return VK[key];
			if (key.length === 1) {
				const charCode = key.toUpperCase().charCodeAt(0);
				if (charCode >= 48 && charCode <= 57 || charCode >= 65 && charCode <= 90) return charCode;
			}
		}
		/**
		* Bridge keyboard input to CDP through two cooperating paths:
		*
		* 1. CAPTURE-PHASE WINDOW LISTENERS for keydown/keyup. This is the v0.1.1
		*    fix for the v0.1.0 "cannot type" bug: the hidden sink's programmatic focus is fragile
		*    (browsers may refuse or immediately move focus for a 1px,
		*    pointer-events:none textarea inside an overflow-hidden container, and the
		*    click itself re-targets focus to the canvas). A capture listener on
		*    `window` fires regardless of what element holds focus, so as long as the
		*    view is marked active (clicked, and no other DSH input owns the event)
		*    the keys flow. Events whose TARGET is an INPUT/TEXTAREA/SELECT or a
		*    contenteditable element are skipped, so typing into the DSH chat box or
		*    the sidebar's own fields never leaks into the remote page.
		*
		* 2. THE HIDDEN SINK for IME composition and paste only — the one thing that
		*    genuinely requires real focus. The view re-asserts focus on the sink at
		*    every canvas pointerdown (the keyboard claim) instead of relying on any
		*    earlier focus call surviving.
		*
		* - plain printable keys → keyDown/keyUp with `text` (page-side input pipeline);
		* - Ctrl/Meta shortcuts → keyDown/keyUp without text;
		* - IME → native composition in the sink; compositionend → one insertText;
		* - paste → the sink's paste event (browser-mediated clipboard) → insertText;
		* - blur / disable releases every still-pressed key (no stuck keys).
		*/
		function attachKeyboardBridge(options) {
			const { sink } = options;
			const pressed = /* @__PURE__ */ new Map();
			const isTypingElsewhere = (event) => {
				const target = event.target;
				if (target === null || typeof target.tagName !== "string") return false;
				const tag = target.tagName;
				return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable === true;
			};
			const shouldHandle = (event) => options.enabled() && !isTypingElsewhere(event);
			const down = (event) => {
				if (!shouldHandle(event)) return;
				if (event.isComposing || event.key === "Process") return;
				if ((event.ctrlKey || event.metaKey) && (event.key === "v" || event.key === "V")) return;
				const input = mapKeyboardEvent(event, "keyDown");
				pressed.set(event.code, {
					...input,
					type: "keyUp"
				});
				options.sendKey(input);
				event.preventDefault();
				event.stopPropagation();
			};
			const up = (event) => {
				if (!shouldHandle(event)) return;
				const release = pressed.get(event.code) ?? mapKeyboardEvent(event, "keyUp");
				pressed.delete(event.code);
				options.sendKey(release);
				event.preventDefault();
				event.stopPropagation();
			};
			const compositionEnd = (event) => {
				if (event.data !== "") options.sendText(event.data);
			};
			const paste = (event) => {
				const text = event.clipboardData?.getData("text/plain") ?? "";
				if (text !== "") {
					options.sendText(text);
					event.preventDefault();
				}
			};
			const releaseAll = () => {
				for (const [code, release] of pressed) {
					pressed.delete(code);
					options.sendKey(release);
				}
			};
			window.addEventListener("keydown", down, { capture: true });
			window.addEventListener("keyup", up, { capture: true });
			sink.addEventListener("compositionend", compositionEnd);
			sink.addEventListener("paste", paste);
			sink.addEventListener("blur", releaseAll);
			return () => {
				window.removeEventListener("keydown", down, { capture: true });
				window.removeEventListener("keyup", up, { capture: true });
				sink.removeEventListener("compositionend", compositionEnd);
				sink.removeEventListener("paste", paste);
				sink.removeEventListener("blur", releaseAll);
				releaseAll();
			};
		}
		//#endregion
		//#region src/client/LiveCanvas.tsx
		function LiveCanvas(props) {
			const canvasRef = (0, react.useRef)(null);
			const sinkRef = (0, react.useRef)(null);
			const rendererRef = (0, react.useRef)(createFrameRenderer());
			const drawRef = (0, react.useRef)(null);
			const propsRef = (0, react.useRef)(props);
			const keyboardActiveRef = (0, react.useRef)(false);
			const [drawVersion, setDrawVersion] = (0, react.useState)(0);
			const [typing, setTyping] = (0, react.useState)(false);
			propsRef.current = props;
			(0, react.useEffect)(() => () => rendererRef.current.dispose(), []);
			(0, react.useEffect)(() => {
				const canvas = canvasRef.current;
				if (canvas === null || props.frame === void 0) return;
				let cancelled = false;
				rendererRef.current.draw(canvas, props.frame).then((draw) => {
					if (!cancelled) drawRef.current = draw;
				});
				return () => {
					cancelled = true;
				};
			}, [props.frame, drawVersion]);
			(0, react.useEffect)(() => {
				const canvas = canvasRef.current;
				if (canvas === null) return;
				const observer = new ResizeObserver(() => setDrawVersion((value) => value + 1));
				observer.observe(canvas);
				return () => observer.disconnect();
			}, []);
			(0, react.useEffect)(() => {
				const claim = () => {
					keyboardActiveRef.current = true;
					setTyping(true);
					sinkRef.current?.focus({ preventScroll: true });
				};
				const release = (event) => {
					if (canvasRef.current?.contains(event.target) === true) return;
					keyboardActiveRef.current = false;
					setTyping(false);
				};
				window.addEventListener("pointerdown", release, { capture: true });
				const canvas = canvasRef.current;
				canvas?.addEventListener("pointerdown", claim);
				return () => {
					window.removeEventListener("pointerdown", release, { capture: true });
					canvas?.removeEventListener("pointerdown", claim);
				};
			}, [props.interactive]);
			(0, react.useEffect)(() => {
				const canvas = canvasRef.current;
				if (canvas === null || !props.interactive) return;
				return attachInputBridge({
					canvas,
					frameSize: () => frameSize(propsRef.current.frame?.metadata, {
						width: 1,
						height: 1
					}),
					frameId: () => propsRef.current.frame?.sequence,
					drawRect: () => drawRef.current,
					sendMouse: (input, frameId) => propsRef.current.sendMouse(input, frameId)
				});
			}, [props.interactive]);
			(0, react.useEffect)(() => {
				const sink = sinkRef.current;
				if (sink === null || !props.interactive) return;
				return attachKeyboardBridge({
					sink,
					enabled: () => keyboardActiveRef.current,
					sendKey: (input) => propsRef.current.sendKey(input),
					sendText: (text) => propsRef.current.sendText(text)
				});
			}, [props.interactive]);
			(0, react.useEffect)(() => {
				if (props.interactive) return;
				keyboardActiveRef.current = false;
				sinkRef.current?.blur();
				setTyping(false);
			}, [props.interactive]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: cdp_live_module_css_default.canvasWrap,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("canvas", {
						ref: canvasRef,
						className: cdp_live_module_css_default.liveCanvas,
						tabIndex: -1,
						"aria-label": "CDP live browser canvas"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
						ref: sinkRef,
						className: cdp_live_module_css_default.keySink,
						tabIndex: -1,
						autoCapitalize: "off",
						autoCorrect: "off",
						spellCheck: false,
						"aria-hidden": true
					}),
					props.interactive && !typing && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: cdp_live_module_css_default.typeHint,
						children: t("clickToType")
					})
				]
			});
		}
		//#endregion
		//#region src/client/StatusOverlay.tsx
		function StatusOverlay(props) {
			let message;
			if (!props.visible) message = t("hidden");
			else if (props.error) message = props.error;
			else if (props.state === "opening") message = t("opening");
			else if (props.state === "connecting") message = t("connecting");
			else if (props.state === "reconnecting") message = t("reconnecting");
			else if (props.state !== "connected") message = t("disconnected");
			else if (!props.hasTarget) message = t("selectTarget");
			else if (!props.hasFrame) message = t("loading");
			if (!message) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: cdp_live_module_css_default.statusOverlay,
				role: "status",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: message }), (props.error || props.state === "error") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: props.onRetry,
					children: t("retry")
				})]
			});
		}
		//#endregion
		//#region src/client/SidebarCdpBrowser.tsx
		function SidebarCdpBrowser(props) {
			const settings = readSettings(props.store.getPrefs().pluginSettings?.["dsh-sidebar-cdp-browser:live"]);
			const targets = useTargetStore();
			const [frame, setFrame] = (0, react.useState)();
			const [listError, setListError] = (0, react.useState)();
			(0, react.useEffect)(() => {
				setListError(void 0);
			}, [settings.endpoint]);
			const interactiveAllowed = settings.interactive;
			const [armedInput, setArmedInput] = (0, react.useState)(false);
			const armed = interactiveAllowed && armedInput;
			(0, react.useEffect)(() => {
				if (!interactiveAllowed) setArmedInput(false);
			}, [interactiveAllowed]);
			const mode = armed ? "interactive" : "observe";
			const onMessage = (0, react.useCallback)((message) => {
				if (message.type === "ready" || message.type === "targets.changed") targets.replace(message.targets);
				else if (message.type === "target.closed") targets.remove(message.targetKey);
				else if (message.type === "response" && !message.ok) setListError(message.error?.message ?? "CDP command failed");
				else if (message.type === "response" && message.ok) {
					const key = message.result?.targetKey;
					if (typeof key === "string" && key !== "") targets.select(key);
				} else if (message.type === "error") setListError(message.message);
			}, [
				targets.remove,
				targets.replace,
				targets.select
			]);
			const socket = useCdpSocket({
				sessionId: props.scope.sessionId,
				mode,
				enabled: props.visible,
				targetKey: targets.selectedKey,
				onMessage,
				onFrame: (next) => {
					if (targets.selectedKey === void 0 || next.targetKey === targets.selectedKey) setFrame(next);
				}
			});
			(0, react.useEffect)(() => {
				setFrame(void 0);
			}, [settings.endpoint, targets.selectedKey]);
			const navigate = (0, react.useCallback)((url) => {
				if (targets.selectedKey === void 0) return;
				socket.send({
					v: 1,
					type: "navigate",
					requestId: requestId(),
					targetKey: targets.selectedKey,
					url
				});
			}, [socket.send, targets.selectedKey]);
			const history = (0, react.useCallback)((action) => {
				if (targets.selectedKey === void 0) return;
				socket.send({
					v: 1,
					type: "history",
					requestId: requestId(),
					targetKey: targets.selectedKey,
					action
				});
			}, [socket.send, targets.selectedKey]);
			const sendMouse = (0, react.useCallback)((event, frameId) => {
				if (targets.selectedKey === void 0) return false;
				return socket.send({
					v: 1,
					type: "input.mouse",
					requestId: requestId(),
					targetKey: targets.selectedKey,
					frameId,
					event
				});
			}, [socket.send, targets.selectedKey]);
			const sendKey = (0, react.useCallback)((event) => {
				if (targets.selectedKey === void 0) return false;
				return socket.send({
					v: 1,
					type: "input.key",
					requestId: requestId(),
					targetKey: targets.selectedKey,
					event
				});
			}, [socket.send, targets.selectedKey]);
			const sendText = (0, react.useCallback)((text) => {
				if (targets.selectedKey === void 0 || text === "") return false;
				return socket.send({
					v: 1,
					type: "input.text",
					requestId: requestId(),
					targetKey: targets.selectedKey,
					text
				});
			}, [socket.send, targets.selectedKey]);
			const createTarget = (0, react.useCallback)(() => {
				socket.send({
					v: 1,
					type: "targets.create",
					requestId: requestId()
				});
			}, [socket.send]);
			const closeTarget = (0, react.useCallback)((key) => {
				socket.send({
					v: 1,
					type: "target.close",
					requestId: requestId(),
					targetKey: key
				});
			}, [socket.send]);
			const interactiveReady = socket.state === "connected" && mode === "interactive";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: cdp_live_module_css_default.root,
				"data-sidebar-cdp-browser": "",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: cdp_live_module_css_default.topRow,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: cdp_live_module_css_default.endpointChip,
							title: t("endpoint"),
							children: settings.endpoint.trim() === "" ? DEFAULT_ENDPOINT_DISPLAY : settings.endpoint.trim()
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConnectionToolbar, {
							state: socket.state,
							error: socket.error,
							onReconnect: socket.reconnect,
							remoteControl: {
								enabled: interactiveAllowed,
								checked: armed,
								onChange: setArmedInput
							}
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TargetTabStrip, {
						targets: targets.targets,
						selectedKey: targets.selectedKey,
						canClose: interactiveReady,
						canCreate: interactiveReady,
						disabled: !interactiveReady,
						onSelect: targets.select,
						onClose: closeTarget,
						onCreate: createTarget
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BrowserToolbar, {
						url: targets.selected?.url,
						disabled: !targets.selectedKey || socket.state !== "connected" || mode !== "interactive",
						onNavigate: navigate,
						onBack: () => history("back"),
						onForward: () => history("forward"),
						onReload: () => history("reload")
					}, targets.selectedKey ?? "none"),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: cdp_live_module_css_default.viewport,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(LiveCanvas, {
							frame,
							interactive: mode === "interactive" && props.visible,
							sendMouse,
							sendKey,
							sendText
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatusOverlay, {
							visible: props.visible,
							state: socket.state,
							hasTarget: Boolean(targets.selectedKey),
							hasFrame: Boolean(frame),
							error: listError ?? socket.error,
							onRetry: () => {
								setListError(void 0);
								socket.reconnect();
							}
						})]
					})
				]
			});
		}
		//#endregion
		//#region src/client/index.tsx
		/** Services required before mounting: the sidebar registry (tab + settings
		*  panel) and the DSH locale service (zh/en copy follows the host-backed
		*  language preference instead of the raw browser language). */
		const inject = ["betterSidebar", "locale"];
		function LiveIcon(props) {
			const size = props.size ?? 16;
			return (0, react.createElement)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": true
			}, (0, react.createElement)("rect", {
				x: 1.5,
				y: 2.5,
				width: 13,
				height: 9,
				rx: 2,
				stroke: "currentColor"
			}), (0, react.createElement)("path", {
				d: "M5 14h6M8 11.5V14M5.5 7.2l1.5 1.5 3.5-3.5",
				stroke: "currentColor",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			}));
		}
		function apply(ctx) {
			ctx.effect(() => attachLocale(ctx.locale), "dsh-sidebar-cdp-browser: locale dictionaries");
			ctx.effect(() => ctx.betterSidebar.registerTab({
				id: "dsh-sidebar-cdp-browser:live",
				title: () => t("title"),
				icon: (size) => (0, react.createElement)(LiveIcon, { size }),
				order: 55,
				single: true,
				settings: { render: (props) => (0, react.createElement)(SettingsPanel, props) },
				component: (props) => (0, react.createElement)(SidebarCdpBrowser, props)
			}), "dsh-sidebar-cdp-browser: register live tab");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map