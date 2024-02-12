import { ActionHandlers } from "./action_handlers";
import { ActionLogger } from "./action_logger";

export type Dispatcher = {
  _interceptors: ((e: Event) => void)[];
  _subscriptions: {
    [key: string]: ((e: Event) => void)[];
  };
  // _waitQueue: (() => {})[];
  // _processingWaitQueue: boolean;
  _currentDispatchActionType: string;
  _actionHandlers: ActionHandlers;
  // _sentryUtils: {...};
  // functionCache: {...};
  // _defaultBand: number;
  actionLogger: ActionLogger;
}