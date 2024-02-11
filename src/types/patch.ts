import DiscordPatcher from "../discord/patcher";
import DiscordPatcherCore from "../discord/patcher_core";
import JSPatch from "../js_patch";

declare global {
  interface Window {
    JSPatch: new () => JSPatch;
    patcherCore: DiscordPatcherCore;
    patcher: DiscordPatcher;
  }
}
