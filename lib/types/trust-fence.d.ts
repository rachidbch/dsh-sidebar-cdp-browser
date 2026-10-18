export interface TrustRequest {
    headers: Record<string, string | string[] | undefined>;
}
export declare function isLoopbackHostname(hostname: string): boolean;
export declare function isTrustedRequest(request: TrustRequest, trustedHosts?: readonly string[]): boolean;
export declare function assertTrustedRequest(request: TrustRequest, trustedHosts?: readonly string[]): void;
