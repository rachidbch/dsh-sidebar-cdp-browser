export interface LatestFrameQueueOptions<T> {
    onDrop?: (frame: T) => void | Promise<void>;
}
/**
 * A single-slot asynchronous queue. A producer never waits; a newer frame
 * replaces the queued frame, which bounds latency and memory under backpressure.
 */
export declare class LatestFrameQueue<T> implements AsyncIterable<T> {
    #private;
    constructor(options?: LatestFrameQueueOptions<T>);
    get closed(): boolean;
    get hasFrame(): boolean;
    push(frame: T): boolean;
    take(): Promise<IteratorResult<T>>;
    close(): void;
    [Symbol.asyncIterator](): AsyncIterator<T>;
}
