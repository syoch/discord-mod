import { RequireFunction } from "../discord/type/webpack_system";

type PushArguments = [
  number[],
  Record<string, never>,
  (req: RequireFunction) => void,
];
type Push = (args: PushArguments) => void;

declare global {
  interface Window {
    GLOBAL_ENV: {
      RELEASE_CHANNEL: string;
      // ...
    };
    webpackChunkdiscord_app: {
      push: Push;
    };
  }
}
