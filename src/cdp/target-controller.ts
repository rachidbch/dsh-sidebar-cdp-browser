import { EventEmitter } from 'node:events';
import type { CdpSessionAdapter } from './browser-adapter.js';
import type { TargetKey } from './types.js';
import { TargetRegistry } from './target-registry.js';

export class TargetController extends EventEmitter {
  readonly #sessions = new Map<TargetKey, Promise<CdpSessionAdapter>>();
  readonly #registry: TargetRegistry;
  readonly #onClosed = (target: { key: TargetKey }) => { void this.detach(target.key); };

  constructor(registry: TargetRegistry) {
    super();
    this.#registry = registry;
    registry.on('closed', this.#onClosed);
  }

  has(key: TargetKey): boolean { return this.#sessions.has(key); }

  attach(key: TargetKey): Promise<CdpSessionAdapter> {
    const current = this.#sessions.get(key);
    if (current) return current;
    const pending = this.#registry.resolve(key).createSession().then((session) => {
      try {
        this.#registry.markAttached(key, true);
      } catch (error) {
        // The target died between createSession() and the mark: hand the
        // just-obtained session back before surfacing the close.
        void session.detach().catch(() => undefined);
        throw error;
      }
      this.emit('attached', key, session);
      return session;
    }).catch((error) => {
      this.#sessions.delete(key);
      throw error;
    });
    this.#sessions.set(key, pending);
    return pending;
  }

  session(key: TargetKey): Promise<CdpSessionAdapter> {
    const session = this.#sessions.get(key);
    if (!session) throw new Error(`Target is not attached: ${key}`);
    return session;
  }

  async withSession<T>(key: TargetKey, operation: (session: CdpSessionAdapter) => Promise<T>): Promise<T> {
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
  async detach(key: TargetKey): Promise<void> {
    const pending = this.#sessions.get(key);
    if (!pending) return;
    this.#sessions.delete(key);
    const session = await pending.catch(() => undefined);
    if (session !== undefined) await session.detach().catch(() => undefined);
    const descriptor = this.#registry.describe(key);
    if (descriptor !== undefined && descriptor.lifecycle !== 'closed') this.#registry.markAttached(key, false);
    this.emit('detached', key);
  }

  async close(): Promise<void> {
    this.#registry.off('closed', this.#onClosed);
    await Promise.allSettled([...this.#sessions.keys()].map((key) => this.detach(key)));
    this.removeAllListeners();
  }
}
