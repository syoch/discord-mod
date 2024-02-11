import logger from "../logger";
import waitEnableFor from "../utils/waitenablefor";
import { InternalModule, RequireFunction } from "./type/webpack_system";
import { Store } from "./type/store";
import { DiscordNode } from "./type/node";

import "../types/discord";

export default class DiscordPatcherCore {
  req: RequireFunction;

  stores: Store[];

  nodes: DiscordNode<object>[];

  constructor() {
    type ModuledStore = { exports: { default: Store } };

    let req: RequireFunction;

    unsafeWindow.webpackChunkdiscord_app.push([
      [Math.random()],
      {},
      (x: RequireFunction) => {
        req = x;
      },
    ]);

    // @ts-expect-error: Discord depends code
    this.req = req;

    this.stores = Object.values(this.req.c)
      /* eslint-disable */
      .filter((x: object) => (x as ModuledStore)?.exports?.default?._dispatcher)
      /* eslint-disable */
      .map((x: object) => (x as ModuledStore).exports.default);

    const primaryStore = this.stores.find((x) =>
      Object.hasOwn(x, "_dispatcher"),
    );
    if (!primaryStore) throw new Error("Primary store not found");
    this.nodes = Object.values(
      /* eslint-disable */
      primaryStore._dispatcher._actionHandlers._dependencyGraph.nodes,
      /* eslint-disable */
    );
  }

  findModule<Module>(
    filter: (module: object) => boolean,
    options: {
      cacheOnly?: boolean;
      usingRawModule?: boolean;
    } = {},
  ) {
    const { cacheOnly = false, usingRawModule = false } = options;

    const extractModule = (x: InternalModule) => {
      if (!x) return x;
      if (!x.exports) return x;

      if (!Object.hasOwn(x.exports, "default") || usingRawModule)
        return x.exports;
      return (x.exports as { default: object }).default;
    };

    const checkModule = (m: InternalModule) => {
      const mod = extractModule(m);
      if (!mod) return undefined;

      return filter(mod) ? (mod as Module) : undefined;
    };

    const cached_mod = Object.values(this.req.c).find((m) => checkModule(m));
    if (cached_mod) return checkModule(cached_mod);

    if (cacheOnly) {
      logger.warn("findModule#Patcher", "Cannot find loaded module in cache");
      logger.info(
        "findModule#Patch",
        `(cacheOnly, usingRawModule: ${usingRawModule})`,
      );
      return null;
    }
    logger.warn("findModule#Patcher", "Cannot find loaded module in cache.");
    logger.info(
      "findModule#Patcher",
      "Trying to find module in raw module. (this may cause side effects)",
    );
    Object.keys(this.req.m).forEach((i) => {
      try {
        const m = checkModule(this.req(i));
        if (m) return m;
      } catch (e) {
        logger.warn("findModule#Patcher", `Failed to load module (id: ${i})`);
      }
    });
    logger.warn(
      "findModule#Patcher",
      `Cannot find module (usingRawModule: ${usingRawModule})`,
    );
    return null;
  }

  async getModule<Module>(
    filter: (module: object) => boolean,
    options: {
      cacheOnly?: boolean;
      usingRawModule?: boolean;
      waitMs?: number;
    } = {},
  ) {
    const { waitMs = 2000 } = options;

    return waitEnableFor(
      () => this.findModule<Module>(filter, options),
      waitMs,
    );
  }

  async getNode<Handlers>(
    name: string,
    concept: (node: DiscordNode<Handlers>) => boolean = () => true,
  ) {
    return waitEnableFor(() => {
      const val = this.nodes.find(
        (x) => x?.name === name,
      ) as DiscordNode<Handlers>;
      if (!val) return false;

      if (!concept(val)) return false;

      return val;
    });
  }

  async getStore(name: string, concept: (node: Store) => boolean = () => true) {
    return waitEnableFor(() => {
      const val = this.stores.find((x) => x.getName() === name);
      if (!val) return false;

      if (!concept(val)) return false;

      return val;
    });
  }

  async patch(
    name: string,
    func: (patcher: DiscordPatcherCore) => Promise<boolean>,
  ) {
    try {
      const status = await func(this);

      if (status === false) {
        logger.error(name, "NG");
      } else if (status === true) {
        logger.info(name, "OK");
      } else {
        logger.info(name, "OK (implicit)");
      }
    } catch (e) {
      logger.warn(name, "Failed to execute");
      logger.error(name, e?.toString ? e.toString() : JSON.stringify(e));
    }
  }

  syncedPatch(name: string, func: (patcher: DiscordPatcherCore) => boolean) {
    try {
      const status = func(this);

      if (status === false) {
        logger.error(name, "NG");
      } else if (status === true) {
        logger.info(name, "OK");
      } else {
        logger.info(name, "OK (implicit)");
      }
    } catch (e) {
      logger.warn(name, "Failed to execute");
      logger.error(name, e?.toString ? e.toString() : JSON.stringify(e));
    }
  }
}
