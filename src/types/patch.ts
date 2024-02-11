import DiscordPatcher from "../discord/patcher";
import DiscordPatcherCore from "../discord/patcher_core";

declare global {
  interface Window {
    patcherCore: DiscordPatcherCore;
    patcher: DiscordPatcher;
  }
}
