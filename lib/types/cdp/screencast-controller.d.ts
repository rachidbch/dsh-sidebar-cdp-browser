import { LatestFrameQueue } from './frame-queue.js';
import { TargetController } from './target-controller.js';
import type { ScreencastFrame, ScreencastOptions, TargetKey } from './types.js';
export declare class ScreencastController {
    #private;
    constructor(targets: TargetController);
    start(targetKey: TargetKey, options?: ScreencastOptions): Promise<LatestFrameQueue<ScreencastFrame>>;
    stop(targetKey: TargetKey): Promise<void>;
    close(): Promise<void>;
}
