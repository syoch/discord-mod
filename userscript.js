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

// @ts-check

const logger = {
  tag: "Discord Mod",

  header: function (/** @type {'error' | 'info' | 'warn'}*/ type,/** @type {string} */ category) {
    const tag_color = {
      "error": "#f88",
      "info": "#8cf",
      "warn": "#fc8"
    }[type];

    return [
      `%c[${this.tag}]%c::%c(${category})%c`,
      `color: ${tag_color}`,
      "",
      "color: #cfc",
      ""
    ]
  },

  info: function (/** @type {string} */ category,/** @type {any} */ ...args) {
    console.log(
      ...this.header("info", category),
      ...args
    );
  },
  warn: function (/** @type {string} */ category,/** @type {any} */ ...args) {
    console.warn(
      ...this.header("warn", category),
      ...args
    );
  },
  error: function (/** @type {string} */ category,/** @type {any} */ ...args) {
    console.error(
      ...this.header("error", category),
      ...args
    );
  },
}


//* +-----------------+
//* |                 |
//* |   Early patch   |
//* |                 |
//* +-----------------+

const js_patch = {
  patchNewobject: function () {
    /**
     * filter Descriptor
     * @param {PropertyDescriptor} desc
     * @returns {PropertyDescriptor}
     */
    function filterDescriptor(desc) {
      if (desc.writable === false) {
        desc.writable = true;
      }

      if (desc.configurable === false) {
        desc.configurable = true;
      }

      if (desc.enumerable === false) {
        desc.enumerable = true;
      }

      return desc;
    }


    // @ts-ignore
    unsafeWindow.filterDescriptor = filterDescriptor;

    Object.defineProperties = (orig => (obj, props) => {
      for (let prop in props) {
        props[prop] = filterDescriptor(props[prop]);

        const current_descriptor = Object.getOwnPropertyDescriptor(obj, prop);
        if (!current_descriptor) {
          props[prop].configurable = true;
        }
      }

      return orig(obj, props);
    })(Object.defineProperties);

    Object.defineProperty = (orig => (obj, prop, desc) => {
      const new_desc = filterDescriptor(desc);

      const current_descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      if (!current_descriptor) {
        new_desc.configurable = true;
      }

      return orig(obj, prop, desc);
    })(Object.defineProperty);
  },

  patchFreeze: function () {
    /** @type {(_: any) => any} */
    const protect = obj => obj;

    /** @type {(_: any) => boolean} */
    const isProtected = _ => false;

    Object.freeze = protect;
    Object.seal = protect;
    Object.preventExtensions = protect;
    Reflect.preventExtensions = obj => { protect(obj); return true; };
    Object.isFrozen = isProtected;
    Object.isSealed = isProtected;
    Object.isExtensible = obj => !isProtected(obj);
  },

  patchNetwork: function () {
    //@ts-ignore
    unsafeWindow.XMLHttpRequest.prototype.open = (orig => function (method, url, async, user, password) {
      logger.info("Patch|XHR", `Requested ${method} ${url}`);
      //@ts-ignore
      orig.apply(this, arguments);
      //@ts-ignore
    })(unsafeWindow.XMLHttpRequest.prototype.open);

    //@ts-ignore
    unsafeWindow.fetch = (/** @type {()=>any} */ orig => (x, opts) => {
      logger.info("Patch|Fetch", `Requested ${opts?.method} ${x}`);

      return orig(x, opts);
      //@ts-ignore
    })(unsafeWindow.fetch.bind(unsafeWindow));
  },

  patch: function () {
    this.patchNewobject();
    this.patchFreeze();
    // this.patchNetwork();
  }
}

js_patch.patch();

//* +-----------------+
//* |                 |
//* |   Mod Program   |
//* |                 |
//* +-----------------+

/**
* Sleep in milliseconds
* @param {number} ms A millisecond of wait
* @returns {Promise<void>}
*/
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
* Listup Object keys
* @param {Object} o the Object
* @returns {string[]}
*/
function object_keys(o) {
  try {
    return Object.keys(o);
  } catch {
    return [];
  }
}

/**
* @template T
* @param {() => T} func
* @param {number} timeout_ms
* @param {string} fail_message
* @return {Promise<T>}
*/
async function waitEnableFor(func, timeout_ms = 5000, fail_message = "") {
  let tried = 0;
  return await new Promise((resolve, reject) => {
    /** @type {number} */
    let interval;

    /** @type {number} */
    let timeout;

    interval = setInterval(() => {
      const val = func();
      if (!val) {
        tried++;
        return;
      }
      clearInterval(interval);
      if (timeout_ms !== -1) clearTimeout(timeout);
      resolve(val);
    }, 100);

    if (timeout_ms !== -1) {
      timeout = setTimeout(() => {
        logger.error("waitEnableFor", `timeout (tried ${tried} times, timeout_ms: ${timeout_ms})`);
        clearInterval(interval);
        reject(fail_message);
      }, timeout_ms);
    }
  })

}

/**
* @param {DiscordPatcher} patcher
*/
async function getDiscordModules(patcher) {
  const user = await waitEnableFor(() => patcher.findModule(x => x?.getUsers), 2000);
  const dev = await waitEnableFor(() => patcher.findModule(x => typeof x?.isDeveloper !== "undefined"), 2000);
  const dev_conf = await waitEnableFor(() => patcher.findModule(m => m?.ExperimentBuckets), 2000);
  return {
    user: await user,
    dev: await dev,
    dev_conf: await dev_conf
  }
}

/**
* @typedef {object} Message
* @property {string} content
* @property {string} colorString
*
* @typedef {object} MessageRenderingParameters
* @property {boolean} allowHeading
* @property {boolean} allowLinks
* @property {boolean} allowList
* @property {boolean} formatInline
* @property {boolean} hideSimpleEmbedContent
* @property {boolean} isInteracting
* @property {boolean} noStyleAndInteraction
* @property {boolean} previewLinkTarget
*
* @typedef {object} MessageRenderingArguments
* @property {Message} message
* @property {MessageRenderingParameters} params
* @typedef {(args: MessageRenderingArguments) => MessageRenderingArguments} MessageRenderingBeforeHook
* @typedef {MessageRenderingBeforeHook[]} MessageHooks
*/

class MessageCustomizer {


  /**
   * @param {DiscordPatcher} patcher
   */
  constructor(patcher) {
    this.patcher = patcher;

    /** @type {MessageHooks} */
    this.message_hooks = [];

    this.message_module = this.patcher.findModule(x => x?.default && x?.renderAutomodMessageMarkup, { usingRawModule: true });

    ((original) => {
      Object.defineProperty(this.message_module, "default", {
        value: (msg, params) => {
          let opts = { message: msg, params: params };
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

  /** @param {MessageRenderingBeforeHook} hook */
  addMessageHook(hook) {
    this.message_hooks.push(hook);
  }
}



class CustomReactComponents {

  constructor(/** @type {DiscordPatcher} */ patcher) {
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
          onChange: useCallback(e => {
            this.DiscordUI.openModal(t => jsx(this.DiscordUI.ConfirmModal, {
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
          onChange: useCallback(e => {
            if (!e) {
              this.testMode.reset()
            }
            this.DiscordUI.openModal(e => jsx(this.appTestModal.default, {
              ...e
            }));
          }, []),
          note: "Test Note",
          children: "アプリテストモード"
        }),
        this.icons.badgedItem && jsx(this.DiscordUI.FormSwitch, {
          value: !homeAutoNav,
          note: "Test Note",
          onChange: useCallback(e => {
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

/**
* @typedef {object} ReactNode
* @typedef {object} Store
* @typedef {{id: number, loaded: boolean, exports: object}} InternalModule
*/

class DiscordPatcher {

  /** @constructor */
  constructor() {
    /** @type {Function & {c: Object.<number, InternalModule>, m: Object.<number, InternalModule>}} */
    let req;

    // @ts-ignore
    webpackChunkdiscord_app.push([[Math.random()], {}, x => req = x]);

    // @ts-ignore
    this.req = req;

    this.stores = Object.values(this.req.c).
      filter(x => x?.exports?.default?._dispatcher).
      map(x => x.exports.default);

    /** @type {ReactNode[]} */
    this.nodes = Object.values(this.stores.find(x => x && x._dispatcher)._dispatcher._actionHandlers._dependencyGraph.nodes);

    this.message_customizer = new MessageCustomizer(this);
  }

  /**
   * @param {(module: object) => boolean} filter
   * @param {{cacheOnly?: boolean, usingRawModule?: boolean}} options
   * @returns {object | undefined}
   */
  findModule(filter, options = {}) {
    const { cacheOnly = false, usingRawModule = false } = options;

    const extractModule = (/** @type {any} */ x) => {
      if (!x) return x;
      if (!x.exports) return x;

      if (!x.exports.default || usingRawModule) return x.exports;
      return x.exports.default;
    }

    const checkModule = (/** @type {any} */ m) => {
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

  /**
   * @param {string} name Node name
   * @param {(node: ReactNode) => any} concept concept function
   * @returns {Promise<ReactNode>}
   */
  async getNode(name, concept = () => true) {
    return await waitEnableFor(() => {
      const val = this.nodes.find(x => x.name === name);
      if (!val) return false;

      if (!concept(val)) return false;

      return val;
    });
  }

  /**
   * @param {string} name store name
   * @param {(node: Store) => any} concept concept function
   * @returns {Promise<Store>}
   */
  async getStore(name, concept = () => true) {
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
  async patch(name, func) {
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
