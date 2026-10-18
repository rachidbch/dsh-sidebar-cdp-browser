import { z } from 'zod';
export declare const PROTOCOL_VERSION: 1;
export declare const screencastOptionsSchema: z.ZodObject<{
    format: z.ZodOptional<z.ZodEnum<["jpeg", "png"]>>;
    quality: z.ZodOptional<z.ZodNumber>;
    maxWidth: z.ZodOptional<z.ZodNumber>;
    maxHeight: z.ZodOptional<z.ZodNumber>;
    everyNthFrame: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    format?: "jpeg" | "png" | undefined;
    quality?: number | undefined;
    maxWidth?: number | undefined;
    maxHeight?: number | undefined;
    everyNthFrame?: number | undefined;
}, {
    format?: "jpeg" | "png" | undefined;
    quality?: number | undefined;
    maxWidth?: number | undefined;
    maxHeight?: number | undefined;
    everyNthFrame?: number | undefined;
}>;
export declare const clientRequestSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"targets.list">;
    requestId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: "targets.list";
    v: 1;
    requestId: string;
}, {
    type: "targets.list";
    v: 1;
    requestId: string;
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"targets.create">;
    requestId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: "targets.create";
    v: 1;
    requestId: string;
}, {
    type: "targets.create";
    v: 1;
    requestId: string;
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"target.select">;
    requestId: z.ZodString;
    targetKey: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: "target.select";
    v: 1;
    requestId: string;
    targetKey: string;
}, {
    type: "target.select";
    v: 1;
    requestId: string;
    targetKey: string;
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"target.detach">;
    requestId: z.ZodString;
    targetKey: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: "target.detach";
    v: 1;
    requestId: string;
    targetKey: string;
}, {
    type: "target.detach";
    v: 1;
    requestId: string;
    targetKey: string;
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"target.close">;
    requestId: z.ZodString;
    targetKey: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: "target.close";
    v: 1;
    requestId: string;
    targetKey: string;
}, {
    type: "target.close";
    v: 1;
    requestId: string;
    targetKey: string;
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"visibility">;
    requestId: z.ZodString;
    targetKey: z.ZodOptional<z.ZodString>;
    visible: z.ZodBoolean;
}, "strict", z.ZodTypeAny, {
    type: "visibility";
    v: 1;
    requestId: string;
    visible: boolean;
    targetKey?: string | undefined;
}, {
    type: "visibility";
    v: 1;
    requestId: string;
    visible: boolean;
    targetKey?: string | undefined;
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"screencast.start">;
    requestId: z.ZodString;
    targetKey: z.ZodString;
    options: z.ZodOptional<z.ZodObject<{
        format: z.ZodOptional<z.ZodEnum<["jpeg", "png"]>>;
        quality: z.ZodOptional<z.ZodNumber>;
        maxWidth: z.ZodOptional<z.ZodNumber>;
        maxHeight: z.ZodOptional<z.ZodNumber>;
        everyNthFrame: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        format?: "jpeg" | "png" | undefined;
        quality?: number | undefined;
        maxWidth?: number | undefined;
        maxHeight?: number | undefined;
        everyNthFrame?: number | undefined;
    }, {
        format?: "jpeg" | "png" | undefined;
        quality?: number | undefined;
        maxWidth?: number | undefined;
        maxHeight?: number | undefined;
        everyNthFrame?: number | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    type: "screencast.start";
    v: 1;
    requestId: string;
    targetKey: string;
    options?: {
        format?: "jpeg" | "png" | undefined;
        quality?: number | undefined;
        maxWidth?: number | undefined;
        maxHeight?: number | undefined;
        everyNthFrame?: number | undefined;
    } | undefined;
}, {
    type: "screencast.start";
    v: 1;
    requestId: string;
    targetKey: string;
    options?: {
        format?: "jpeg" | "png" | undefined;
        quality?: number | undefined;
        maxWidth?: number | undefined;
        maxHeight?: number | undefined;
        everyNthFrame?: number | undefined;
    } | undefined;
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"screencast.stop">;
    requestId: z.ZodString;
    targetKey: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: "screencast.stop";
    v: 1;
    requestId: string;
    targetKey: string;
}, {
    type: "screencast.stop";
    v: 1;
    requestId: string;
    targetKey: string;
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"input.mouse">;
    requestId: z.ZodString;
    targetKey: z.ZodString;
    frameId: z.ZodOptional<z.ZodNumber>;
    event: z.ZodObject<{
        type: z.ZodEnum<["mousePressed", "mouseReleased", "mouseMoved", "mouseWheel"]>;
        x: z.ZodNumber;
        y: z.ZodNumber;
        button: z.ZodOptional<z.ZodEnum<["none", "left", "middle", "right", "back", "forward"]>>;
        buttons: z.ZodOptional<z.ZodNumber>;
        clickCount: z.ZodOptional<z.ZodNumber>;
        deltaX: z.ZodOptional<z.ZodNumber>;
        deltaY: z.ZodOptional<z.ZodNumber>;
        modifiers: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        type: "mousePressed" | "mouseReleased" | "mouseMoved" | "mouseWheel";
        x: number;
        y: number;
        button?: "none" | "left" | "middle" | "right" | "back" | "forward" | undefined;
        buttons?: number | undefined;
        clickCount?: number | undefined;
        deltaX?: number | undefined;
        deltaY?: number | undefined;
        modifiers?: number | undefined;
    }, {
        type: "mousePressed" | "mouseReleased" | "mouseMoved" | "mouseWheel";
        x: number;
        y: number;
        button?: "none" | "left" | "middle" | "right" | "back" | "forward" | undefined;
        buttons?: number | undefined;
        clickCount?: number | undefined;
        deltaX?: number | undefined;
        deltaY?: number | undefined;
        modifiers?: number | undefined;
    }>;
}, "strict", z.ZodTypeAny, {
    type: "input.mouse";
    v: 1;
    requestId: string;
    targetKey: string;
    event: {
        type: "mousePressed" | "mouseReleased" | "mouseMoved" | "mouseWheel";
        x: number;
        y: number;
        button?: "none" | "left" | "middle" | "right" | "back" | "forward" | undefined;
        buttons?: number | undefined;
        clickCount?: number | undefined;
        deltaX?: number | undefined;
        deltaY?: number | undefined;
        modifiers?: number | undefined;
    };
    frameId?: number | undefined;
}, {
    type: "input.mouse";
    v: 1;
    requestId: string;
    targetKey: string;
    event: {
        type: "mousePressed" | "mouseReleased" | "mouseMoved" | "mouseWheel";
        x: number;
        y: number;
        button?: "none" | "left" | "middle" | "right" | "back" | "forward" | undefined;
        buttons?: number | undefined;
        clickCount?: number | undefined;
        deltaX?: number | undefined;
        deltaY?: number | undefined;
        modifiers?: number | undefined;
    };
    frameId?: number | undefined;
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"input.key">;
    requestId: z.ZodString;
    targetKey: z.ZodString;
    event: z.ZodObject<{
        type: z.ZodEnum<["keyDown", "keyUp", "rawKeyDown", "char"]>;
        key: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
        text: z.ZodOptional<z.ZodString>;
        unmodifiedText: z.ZodOptional<z.ZodString>;
        windowsVirtualKeyCode: z.ZodOptional<z.ZodNumber>;
        nativeVirtualKeyCode: z.ZodOptional<z.ZodNumber>;
        modifiers: z.ZodOptional<z.ZodNumber>;
        autoRepeat: z.ZodOptional<z.ZodBoolean>;
        isKeypad: z.ZodOptional<z.ZodBoolean>;
        isSystemKey: z.ZodOptional<z.ZodBoolean>;
        location: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        type: "keyDown" | "keyUp" | "rawKeyDown" | "char";
        code?: string | undefined;
        modifiers?: number | undefined;
        key?: string | undefined;
        text?: string | undefined;
        unmodifiedText?: string | undefined;
        windowsVirtualKeyCode?: number | undefined;
        nativeVirtualKeyCode?: number | undefined;
        autoRepeat?: boolean | undefined;
        isKeypad?: boolean | undefined;
        isSystemKey?: boolean | undefined;
        location?: number | undefined;
    }, {
        type: "keyDown" | "keyUp" | "rawKeyDown" | "char";
        code?: string | undefined;
        modifiers?: number | undefined;
        key?: string | undefined;
        text?: string | undefined;
        unmodifiedText?: string | undefined;
        windowsVirtualKeyCode?: number | undefined;
        nativeVirtualKeyCode?: number | undefined;
        autoRepeat?: boolean | undefined;
        isKeypad?: boolean | undefined;
        isSystemKey?: boolean | undefined;
        location?: number | undefined;
    }>;
}, "strict", z.ZodTypeAny, {
    type: "input.key";
    v: 1;
    requestId: string;
    targetKey: string;
    event: {
        type: "keyDown" | "keyUp" | "rawKeyDown" | "char";
        code?: string | undefined;
        modifiers?: number | undefined;
        key?: string | undefined;
        text?: string | undefined;
        unmodifiedText?: string | undefined;
        windowsVirtualKeyCode?: number | undefined;
        nativeVirtualKeyCode?: number | undefined;
        autoRepeat?: boolean | undefined;
        isKeypad?: boolean | undefined;
        isSystemKey?: boolean | undefined;
        location?: number | undefined;
    };
}, {
    type: "input.key";
    v: 1;
    requestId: string;
    targetKey: string;
    event: {
        type: "keyDown" | "keyUp" | "rawKeyDown" | "char";
        code?: string | undefined;
        modifiers?: number | undefined;
        key?: string | undefined;
        text?: string | undefined;
        unmodifiedText?: string | undefined;
        windowsVirtualKeyCode?: number | undefined;
        nativeVirtualKeyCode?: number | undefined;
        autoRepeat?: boolean | undefined;
        isKeypad?: boolean | undefined;
        isSystemKey?: boolean | undefined;
        location?: number | undefined;
    };
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"input.text">;
    requestId: z.ZodString;
    targetKey: z.ZodString;
    text: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: "input.text";
    v: 1;
    requestId: string;
    targetKey: string;
    text: string;
}, {
    type: "input.text";
    v: 1;
    requestId: string;
    targetKey: string;
    text: string;
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"navigate">;
    requestId: z.ZodString;
    targetKey: z.ZodString;
    url: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: "navigate";
    v: 1;
    requestId: string;
    targetKey: string;
    url: string;
}, {
    type: "navigate";
    v: 1;
    requestId: string;
    targetKey: string;
    url: string;
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"history">;
    requestId: z.ZodString;
    targetKey: z.ZodString;
    action: z.ZodEnum<["back", "forward", "reload"]>;
}, "strict", z.ZodTypeAny, {
    type: "history";
    v: 1;
    requestId: string;
    targetKey: string;
    action: "back" | "forward" | "reload";
}, {
    type: "history";
    v: 1;
    requestId: string;
    targetKey: string;
    action: "back" | "forward" | "reload";
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"ping">;
    requestId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    type: "ping";
    v: 1;
    requestId: string;
}, {
    type: "ping";
    v: 1;
    requestId: string;
}>]>;
export declare const serverMessageSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"ready">;
    generation: z.ZodString;
    mode: z.ZodEnum<["observe", "interactive"]>;
    targets: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        type: z.ZodString;
        title: z.ZodString;
        url: z.ZodString;
        lifecycle: z.ZodEnum<["available", "attached", "closed"]>;
        attached: z.ZodBoolean;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        type: string;
        key: string;
        url: string;
        title: string;
        lifecycle: "available" | "attached" | "closed";
        attached: boolean;
        createdAt: number;
        updatedAt: number;
    }, {
        type: string;
        key: string;
        url: string;
        title: string;
        lifecycle: "available" | "attached" | "closed";
        attached: boolean;
        createdAt: number;
        updatedAt: number;
    }>, "many">;
}, "strict", z.ZodTypeAny, {
    type: "ready";
    mode: "observe" | "interactive";
    v: 1;
    generation: string;
    targets: {
        type: string;
        key: string;
        url: string;
        title: string;
        lifecycle: "available" | "attached" | "closed";
        attached: boolean;
        createdAt: number;
        updatedAt: number;
    }[];
}, {
    type: "ready";
    mode: "observe" | "interactive";
    v: 1;
    generation: string;
    targets: {
        type: string;
        key: string;
        url: string;
        title: string;
        lifecycle: "available" | "attached" | "closed";
        attached: boolean;
        createdAt: number;
        updatedAt: number;
    }[];
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"response">;
    requestId: z.ZodString;
    ok: z.ZodBoolean;
    result: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        code: string;
        message: string;
    }, {
        code: string;
        message: string;
    }>>;
}, "strict", z.ZodTypeAny, {
    type: "response";
    v: 1;
    requestId: string;
    ok: boolean;
    result?: unknown;
    error?: {
        code: string;
        message: string;
    } | undefined;
}, {
    type: "response";
    v: 1;
    requestId: string;
    ok: boolean;
    result?: unknown;
    error?: {
        code: string;
        message: string;
    } | undefined;
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"targets.changed">;
    targets: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        type: z.ZodString;
        title: z.ZodString;
        url: z.ZodString;
        lifecycle: z.ZodEnum<["available", "attached", "closed"]>;
        attached: z.ZodBoolean;
        createdAt: z.ZodNumber;
        updatedAt: z.ZodNumber;
    }, "strict", z.ZodTypeAny, {
        type: string;
        key: string;
        url: string;
        title: string;
        lifecycle: "available" | "attached" | "closed";
        attached: boolean;
        createdAt: number;
        updatedAt: number;
    }, {
        type: string;
        key: string;
        url: string;
        title: string;
        lifecycle: "available" | "attached" | "closed";
        attached: boolean;
        createdAt: number;
        updatedAt: number;
    }>, "many">;
}, "strict", z.ZodTypeAny, {
    type: "targets.changed";
    v: 1;
    targets: {
        type: string;
        key: string;
        url: string;
        title: string;
        lifecycle: "available" | "attached" | "closed";
        attached: boolean;
        createdAt: number;
        updatedAt: number;
    }[];
}, {
    type: "targets.changed";
    v: 1;
    targets: {
        type: string;
        key: string;
        url: string;
        title: string;
        lifecycle: "available" | "attached" | "closed";
        attached: boolean;
        createdAt: number;
        updatedAt: number;
    }[];
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"target.closed">;
    targetKey: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    type: "target.closed";
    v: 1;
    targetKey: string;
    reason?: string | undefined;
}, {
    type: "target.closed";
    v: 1;
    targetKey: string;
    reason?: string | undefined;
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"screencast.frameMeta">;
    targetKey: z.ZodString;
    sequence: z.ZodNumber;
    metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    mimeType: z.ZodEnum<["image/jpeg", "image/png"]>;
    byteLength: z.ZodNumber;
    receivedAt: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    type: "screencast.frameMeta";
    v: 1;
    targetKey: string;
    sequence: number;
    metadata: Record<string, unknown>;
    mimeType: "image/jpeg" | "image/png";
    byteLength: number;
    receivedAt: number;
}, {
    type: "screencast.frameMeta";
    v: 1;
    targetKey: string;
    sequence: number;
    metadata: Record<string, unknown>;
    mimeType: "image/jpeg" | "image/png";
    byteLength: number;
    receivedAt: number;
}>, z.ZodObject<{
    v: z.ZodLiteral<1>;
    type: z.ZodLiteral<"error">;
    code: z.ZodString;
    message: z.ZodString;
    recoverable: z.ZodBoolean;
}, "strict", z.ZodTypeAny, {
    code: string;
    message: string;
    type: "error";
    v: 1;
    recoverable: boolean;
}, {
    code: string;
    message: string;
    type: "error";
    v: 1;
    recoverable: boolean;
}>]>;
export type ClientRequest = z.infer<typeof clientRequestSchema>;
export type ServerMessage = z.infer<typeof serverMessageSchema>;
export declare function parseClientRequest(value: unknown): ClientRequest;
export declare function parseJsonClientRequest(input: string | Buffer): ClientRequest;
export declare function encodeServerMessage(message: ServerMessage): string;
