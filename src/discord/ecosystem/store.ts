import { Dispatcher } from "./dispatcher";

export type Store = {
  _dispatcher: Dispatcher;
  getName: () => string;
};
