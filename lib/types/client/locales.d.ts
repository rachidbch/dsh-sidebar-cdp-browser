/**
 * The zh/en copy tables. Language selection lives in i18n.ts (the DSH
 * locale service wiring); this module is pure data plus the key union.
 *
 * @module dsh-sidebar-cdp-browser/client/locales
 */
/** Dictionary namespace the plugin registers under the DSH locale service. */
export declare const NS = "dsh-sidebar-cdp-browser";
declare const zh: {
    title: string;
    reconnect: string;
    noTargets: string;
    selectTarget: string;
    loading: string;
    back: string;
    forward: string;
    reload: string;
    navigate: string;
    address: string;
    newTab: string;
    closeTab: string;
    keepLastTab: string;
    connected: string;
    opening: string;
    connecting: string;
    reconnecting: string;
    disconnected: string;
    hidden: string;
    retry: string;
    endpoint: string;
    endpointDesc: string;
    endpointFallback: string;
    interactive: string;
    interactiveDesc: string;
    remoteControl: string;
    remoteControlHint: string;
    remoteControlLocked: string;
    frameQuality: string;
    frameQualityDesc: string;
    frameEveryNth: string;
    frameEveryNthDesc: string;
    frameMaxSize: string;
    frameMaxSizeDesc: string;
    frameWidth: string;
    frameHeight: string;
    frameApplyHint: string;
    settingRangeHint: string;
    clickToType: string;
    closeEndpointChanged: string;
    closeFrameChanged: string;
    closeBackpressure: string;
    closedWithCode: string;
};
declare const en: {
    title: string;
    reconnect: string;
    noTargets: string;
    selectTarget: string;
    loading: string;
    back: string;
    forward: string;
    reload: string;
    navigate: string;
    address: string;
    newTab: string;
    closeTab: string;
    keepLastTab: string;
    connected: string;
    opening: string;
    connecting: string;
    reconnecting: string;
    disconnected: string;
    hidden: string;
    retry: string;
    endpoint: string;
    endpointDesc: string;
    endpointFallback: string;
    interactive: string;
    interactiveDesc: string;
    remoteControl: string;
    remoteControlHint: string;
    remoteControlLocked: string;
    frameQuality: string;
    frameQualityDesc: string;
    frameEveryNth: string;
    frameEveryNthDesc: string;
    frameMaxSize: string;
    frameMaxSizeDesc: string;
    frameWidth: string;
    frameHeight: string;
    frameApplyHint: string;
    settingRangeHint: string;
    clickToType: string;
    closeEndpointChanged: string;
    closeFrameChanged: string;
    closeBackpressure: string;
    closedWithCode: string;
};
export { zh, en };
/** Every copy key (the en table is the canonical key set). */
export type LocaleKey = keyof typeof en;
