import { DiscordNode } from "./node";

export type Store<StoreHandlers = Record<string, never>> = {
  _dispatcher: {
    _actionHandlers: {
      _dependencyGraph: {
        nodes: DiscordNode<StoreHandlers>[];
      };
    };
  }
  getName: () => string;
};
