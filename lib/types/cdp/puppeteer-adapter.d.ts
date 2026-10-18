import { type Browser } from 'puppeteer-core';
import type { BrowserAdapter, BrowserTargetAdapter } from './browser-adapter.js';
interface TargetInfoSnapshot {
    title: string;
    url: string;
}
export declare class PuppeteerBrowserAdapter implements BrowserAdapter {
    #private;
    readonly browser: Browser;
    constructor(browser: Browser);
    snapshotOf(targetId: string): TargetInfoSnapshot | undefined;
    refreshTargetInfo(): Promise<void>;
    listTargets(): Promise<readonly BrowserTargetAdapter[]>;
    /**
     * New page via puppeteer's `newPage()`: it resolves only after the target
     * has appeared (targetcreated) AND initialized, so the registry entry is
     * already live by the time the caller maps the adapter to a TargetKey.
     * No defaultViewport is configured at connect time, so the page keeps the
     * browser's natural size instead of being forced into an 800x600 override.
     */
    createTarget(): Promise<BrowserTargetAdapter>;
    onTargetCreated(handler: (target: BrowserTargetAdapter) => void): void;
    offTargetCreated(handler: (target: BrowserTargetAdapter) => void): void;
    onTargetChanged(handler: (target: BrowserTargetAdapter) => void): void;
    offTargetChanged(handler: (target: BrowserTargetAdapter) => void): void;
    onTargetDestroyed(handler: (target: BrowserTargetAdapter) => void): void;
    offTargetDestroyed(handler: (target: BrowserTargetAdapter) => void): void;
    isConnected(): boolean;
    disconnect(): Promise<void>;
}
export interface ConnectPuppeteerOptions {
    browserWSEndpoint: string;
    headers?: Record<string, string>;
}
export declare function connectPuppeteer(options: ConnectPuppeteerOptions): Promise<PuppeteerBrowserAdapter>;
export {};
