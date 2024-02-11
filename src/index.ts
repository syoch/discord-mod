// ==UserScript==
// @name         Discord Mod
// @version      1.0
// @description  Discord Mod
// @author       syoch
// @match        https://discord.com/*
// @match        https://discord.com*
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

import js_patch from "./js_patch";
import DiscordPatcher from "./discord/patcher";
import DiscordPatcherCore from "./discord/patcher_core";
import logger from "./logger";
import "./types/discord";
import "./types/patch";

async function main() {
  const notifyInterval = setInterval(() => {
    logger.info("GLOBAL_ENV", "running...");
  }, 100);
  const interval = setInterval(() => {
    if (unsafeWindow.GLOBAL_ENV) {
      logger.info("GLOBAL_ENV", "override RELEASE_CHANNEL: staging");
      unsafeWindow.GLOBAL_ENV.RELEASE_CHANNEL = "staging";
      clearInterval(interval);
      clearInterval(notifyInterval);
    }
  }, 1);
  js_patch.patch();

  const patcherCore = new DiscordPatcherCore();
  const patcher = new DiscordPatcher(patcherCore);

  unsafeWindow.patcherCore = patcherCore;
  unsafeWindow.patcher = patcher;

  await patcher.doPatch();
  logger.info("Global", "Done all patches");

  return true;
}

window.addEventListener("load", () => {
  main()
    .then(() => {
      logger.info("Global", "Loaded");
    });
}, false);
