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
import logger from "./logger";
import waitEnableFor from "./utils/waitenablefor";

js_patch.patch();

let a_b = 0;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function object_keys(o: Object) {
  try {
    return Object.keys(o);
  } catch {
    return [];
  }
}

async function getDiscordModules(patcher: DiscordPatcher) {
  const user = await waitEnableFor(() => patcher.findModule((x: any) => x?.getUsers), 2000);
  const dev = await waitEnableFor(() => patcher.findModule((x: any) => typeof x?.isDeveloper !== "undefined"), 2000);
  const dev_conf = await waitEnableFor(() => patcher.findModule((m: any) => m?.ExperimentBuckets), 2000);
  return {
    user: await user,
    dev: await dev,
    dev_conf: await dev_conf
  }
}

interface Message {
  content: string;
  colorString: string;
};

interface MessageRenderingParameters {
  allowHeading: boolean;
  allowLinks: boolean;
  allowList: boolean;
  formatInline: boolean;
  hideSimpleEmbedContent: boolean;
  isInteracting: boolean;
  noStyleAndInteraction: boolean;
  previewLinkTarget: boolean;
};

interface MessageRenderingArguments {
  message: Message;
  params: MessageRenderingParameters;
};


class MessageCustomizer {
  patcher: DiscordPatcher;
  message_hooks: ((args: MessageRenderingArguments) => MessageRenderingArguments)[];
  message_module: any;

  constructor(patcher: DiscordPatcher) {
    this.patcher = patcher;
    this.message_hooks = [];

    this.message_module = this.patcher.findModule(x => x?.default && x?.renderAutomodMessageMarkup, { usingRawModule: true });

    ((original) => {
      Object.defineProperty(this.message_module, "default", {
        value: (msg: Message, params: MessageRenderingParameters) => {
          let opts = { message: msg, params: params } as MessageRenderingArguments;
          for (let hook of this.message_hooks) {
            let hooked = hook(opts);
            if (hooked?.message && hooked?.params) {
              opts = hooked;
            } else {
              logger.warn("MessageCustomizer", "Hook returned invalid value");
            }
          }
          let component = original(opts.message, opts.params);
          return component;
        },
        writable: true
      })
    })(this.message_module.default);
  }


  addMessageHook(hook: (args: MessageRenderingArguments) => MessageRenderingArguments) {
    this.message_hooks.push(hook);
  }
}



class CustomReactComponents {
  patcher: DiscordPatcher;
  React: any;
  ReactEv: any;
  DiscordReact: any;
  i: any;
  DiscordUI: any;
  testMode: any;
  libraryApplicationStore: any;
  testModeStore: any;
  c: any;
  S: any;
  discordURLs: any;
  platform: any;
  HWAccel: any;
  configStore: any;
  appTestModal: any;
  g: any;
  L10N: any;
  icons: any;


  constructor(patcher: DiscordPatcher) {
    this.patcher = patcher;

    patcher.req("222007");
    this.React = patcher.req("37983")
    this.ReactEv = patcher.req("884691")
    this.DiscordReact = patcher.req("446674")
    this.i = patcher.req("669491")
    this.DiscordUI = patcher.req("77078")
    this.testMode = patcher.req("70614")
    this.libraryApplicationStore = patcher.req("686470")
    this.testModeStore = patcher.req("167726")
    this.c = patcher.req("956089")
    this.S = patcher.req("306160")
    this.discordURLs = patcher.req("701909")
    this.platform = patcher.req("773336")
    this.HWAccel = patcher.req("50885")
    this.configStore = patcher.req("845579")
    this.appTestModal = patcher.req("271445")
    this.g = patcher.req("49111")
    this.L10N = patcher.req("782340")
    this.icons = patcher.req("393149");
  }

  primarySettingElement() {
    const jsx = this.React.jsx;
    const jsxs = this.React.jsxs;
    const useCallback = this.ReactEv.useCallback;
    const useState = this.ReactEv.useState;

    let [enableHardwareAcceleration] = useState(() => this.HWAccel.default.getEnableHardwareAcceleration())
      , developerMode = this.configStore.DeveloperMode.useSetting()
      , homeAutoNav = this.configStore.DisableHomeAutoNav.useSetting()
      , {
        testModeApplicationId
      } = this.DiscordReact.useStateFromStoresObject(
        [this.testModeStore.default],
        () => ({
          testModeApplicationId: this.testModeStore.default.testModeApplicationId
        })
      )

    return jsxs(this.DiscordUI.FormSection, {
      tag: this.DiscordUI.FormTitleTags.H1,
      title: "すごい設定",
      children: [
        jsx(this.DiscordUI.FormSwitch, {
          value: developerMode,
          onChange: this.configStore.DeveloperMode.updateSetting,
          note: "Test Note",
          children: "開発者モード"
        }),
        jsx(this.DiscordUI.FormSwitch, {
          value: enableHardwareAcceleration,
          onChange: useCallback((e: boolean) => {
            this.DiscordUI.openModal((t: any) => jsx(this.DiscordUI.ConfirmModal, {
              header: "モーダルのタイトル",
              confirmText: "OK",
              cancelText: "キャンセル",
              onConfirm: () => this.HWAccel.default.setEnableHardwareAcceleration(e),
              ...t,
              children: jsx(this.DiscordUI.Text, {
                variant: "text-sm/normal",
                children: "モーダルの本文"
              })
            }))
          }, []),
          note: "Test Note",
          children: "ハードウェア アクセラレーション"
        }),
        jsx(this.DiscordUI.FormSwitch, {
          value: null != testModeApplicationId,
          onChange: useCallback((e: boolean) => {
            if (!e) {
              this.testMode.reset()
            }
            this.DiscordUI.openModal((e: any) => jsx(this.appTestModal.default, {
              ...e
            }));
          }, []),
          note: "Test Note",
          children: "アプリテストモード"
        }),
        this.icons.badgedItem && jsx(this.DiscordUI.FormSwitch, {
          value: !homeAutoNav,
          note: "Test Note",
          onChange: useCallback((e: any) => {
            this.configStore.DisableHomeAutoNav.updateSetting(!e)
          }, []),
          children: jsxs("div", {
            className: this.icons.badgedItem,
            children: [
              "自動でホームに移動",
              jsx(this.c.TextBadge, {
                text: "ベータ",
                color: this.i.default.unsafe_rawColors.BRAND_500.css,
                className: this.icons.betaTag
              })]
          })
        })]
    })
  }

}

type ReactNode = any;

type Store = {
  getName: () => string;
  getSerializedState: () => object;
} & any;

type InternalModule = { id: number; loaded: boolean; exports: object; };

class DiscordPatcher {
  req: Function & { c: { [n: number]: InternalModule; }; m: { [n: number]: InternalModule; }; };
  stores: Store[];
  nodes: ReactNode[];
  message_customizer: MessageCustomizer;

  constructor() {
    let req: Function & { c: { [n: number]: InternalModule; }; m: { [n: number]: InternalModule; }; };

    // @ts-ignore
    webpackChunkdiscord_app.push([[Math.random()], {}, x => req = x]);

    // @ts-ignore
    this.req = req;

    this.stores = Object.values(this.req.c).
      filter((x: any) => x?.exports?.default?._dispatcher).
      map((x: any) => x.exports.default);

    this.nodes = Object.values(this.stores.find(x => x?._dispatcher)._dispatcher._actionHandlers._dependencyGraph.nodes);

    this.message_customizer = new MessageCustomizer(this);
  }

  findModule(filter: (module: any) => boolean, options: { cacheOnly?: boolean; usingRawModule?: boolean; } = {}): any | null {
    const { cacheOnly = false, usingRawModule = false } = options;

    const extractModule = (/** @type {any} */ x: any) => {
      if (!x) return x;
      if (!x.exports) return x;

      if (!x.exports.default || usingRawModule) return x.exports;
      return x.exports.default;
    }

    const checkModule = (/** @type {any} */ m: any) => {
      m = extractModule(m);
      if (!m) return undefined;

      return filter(m) ? m : undefined;
    }

    for (let raw_module of Object.values(this.req.c)) {
      let m = checkModule(raw_module);
      if (m) return m;
    }

    if (cacheOnly) {
      logger.warn('findModule#Patcher', `Cannot find loaded module in cache (cacheOnly, usingRawModule: ${usingRawModule})`);
      return null;
    }
    logger.warn('findModule#Patcher', 'Cannot find loaded module in cache. Loading all modules may have unexpected side effects');
    for (let i in this.req.m) {
      try {
        let m = this.req(i);
        m = checkModule(m);
        if (m) return m;
      }
      catch (e) {
      }
    }
    logger.warn('findModule#Patcher', `Cannot find module (usingRawModule: ${usingRawModule})`);
    return null;
  }

  async getNode(name: string, concept: (node: ReactNode) => any = () => true) {
    return await waitEnableFor(() => {
      const val = this.nodes.find(x => x?.name === name);
      if (!val) return false;

      if (!concept(val)) return false;

      return val;
    });
  }

  async getStore(name: string, concept: (node: Store) => any = () => true) {
    return await waitEnableFor(() => {
      const val = this.stores.find(x => x.getName() === name);
      if (!val) return false;

      if (!concept(val)) return false;

      return val;
    });
  }

  /**
   * @param {string} name Patch name
   * @param {(modules: DiscordPatcher) => Promise<boolean | void> | boolean | void} func a function to execute
   */
  async patch(name: string, func: (modules: DiscordPatcher) => Promise<boolean | void> | boolean | void) {
    try {
      const status = await func(this);

      if (status === false) {
        logger.error(name, `NG`);
      } else if (status === true) {
        logger.info(name, `OK`);
      } else {
        logger.info(name, `OK (implicit)`)
      }
    } catch (e) {
      logger.warn(name, `Failed to execute`);
      logger.error(name, e);
    }
  }

  // Bulk Patch
  async doPatch() {
    let modules = await getDiscordModules(this);
    await this.patch("User|UpdateFlag", async (patcher) => {
      let user = await waitEnableFor(() => modules.user.getCurrentUser(), 5000);
      user.flags |= 4604879;
    })
    await Promise.all([
      this.patch("Dev|ExperimentDescriptor", (patcher) => {
        modules.dev.getExperimentDescriptor = () => ({
          type: "developer",
          name: "discord_dev_testing",
          revision: 1,
          override: !0,
          bucket: modules.dev_conf.ExperimentBuckets.TREATMENT_1
        });
      }),
      this.patch("Dev|isDeveloper", (patcher) => {
        Object.defineProperty(modules.dev, "isDeveloper", { value: true })
      }),
      this.patch("Reload|ExperimentStore", async (patcher) => {
        const experiment_store = await patcher.getStore("ExperimentStore", (x) => x.getSerializedState);
        const experiment_node = await patcher.getNode("ExperimentStore");
        experiment_node.actionHandler["OVERLAY_INITIALIZE"]({
          serializedExperimentStore: experiment_store.getSerializedState(),
          user: await waitEnableFor(() => modules.user.getCurrentUser(), 5000, "CurrentUser not available")
        });
      }),
      this.patch("Reload|DeveloperExperimentStore", async (patcher) => {
        const store = await patcher.getNode("DeveloperExperimentStore");
        store.actionHandler["CONNECTION_OPEN"]();
      }),

      this.patch("Appearance|ShowAllItems", async (patcher) => {
        await waitEnableFor(() => patcher.req.c[800751]?.loaded, 5000);
        patcher.req("800751").default.prototype.getPredicateSections = function () {
          //@ts-ignore
          globalThis.sections = this.props.sections;
          return [
            ...this.props.sections,
            { section: 'My Account', label: 'hehe' }
          ]
        }
      })
    ]);
  }

}

window.addEventListener('load', async () => {
  let notify_interval = setInterval(() => {
    logger.info("GLOBAL_ENV", "running...");
  }, 100);
  let interval = setInterval(() => {
    //@ts-ignore
    if (unsafeWindow.GLOBAL_ENV) {
      logger.info("GLOBAL_ENV", "override RELEASE_CHANNEL: staging");
      //@ts-ignore
      unsafeWindow.GLOBAL_ENV.RELEASE_CHANNEL = 'staging';
      clearInterval(interval);
      clearInterval(notify_interval);
    }
  }, 1);


  const patcher = new DiscordPatcher();

  // @ts-ignore
  unsafeWindow.js_patch = js_patch;
  // @ts-ignore
  unsafeWindow.DiscordPatcher = DiscordPatcher;
  // @ts-ignore
  unsafeWindow.patcher = patcher;

  await patcher.doPatch();
  logger.info("Global", "Done all patches");
}, false);
