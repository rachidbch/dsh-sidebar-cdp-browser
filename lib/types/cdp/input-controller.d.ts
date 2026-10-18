import { TargetController } from './target-controller.js';
import type { KeyInput, MouseInput, NavigateInput, NavigationResult, TargetKey, TextInput } from './types.js';
export declare class InputController {
    readonly targets: TargetController;
    constructor(targets: TargetController);
    dispatchMouse(targetKey: TargetKey, input: MouseInput): Promise<void>;
    dispatchKey(targetKey: TargetKey, input: KeyInput): Promise<void>;
    insertText(targetKey: TargetKey, input: TextInput | string): Promise<void>;
    navigate(targetKey: TargetKey, input: NavigateInput | string): Promise<NavigationResult>;
    history(targetKey: TargetKey, action: 'back' | 'forward' | 'reload'): Promise<void>;
}
