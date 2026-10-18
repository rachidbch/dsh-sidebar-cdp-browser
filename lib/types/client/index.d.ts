import type { Context } from 'dsh-better-sidebar';
/** Services required before mounting: the sidebar registry (tab + settings
 *  panel) and the DSH locale service (zh/en copy follows the host-backed
 *  language preference instead of the raw browser language). */
export declare const inject: string[];
export declare function apply(ctx: Context): void;
