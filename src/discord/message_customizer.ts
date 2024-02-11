import logger from "../logger";
import DiscordPatcherCore from "./patcher_core";

export interface Message {
  content: string;
  colorString: string;
}

export interface RenderingParams {
  allowHeading: boolean;
  allowLinks: boolean;
  allowList: boolean;
  formatInline: boolean;
  hideSimpleEmbedContent: boolean;
  isInteracting: boolean;
  noStyleAndInteraction: boolean;
  previewLinkTarget: boolean;
}

export interface RenderingArgs {
  message: Message;
  params: RenderingParams;
}

export interface RenderedMessage {
  // ...
}

type MessageModule = {
  default: (msg: Message, params: RenderingParams) => RenderedMessage;

  // its dummy
  renderAutomodMessageMarkup: (
    msg: Message,
    params: RenderingParams,
  ) => RenderedMessage;
};

export default class MessageCustomizer {
  patcher: DiscordPatcherCore;

  message_hooks: ((args: RenderingArgs) => RenderingArgs)[];

  message_module: MessageModule;

  constructor(patcher: DiscordPatcherCore) {
    this.patcher = patcher;
    this.message_hooks = [];

    const module = this.patcher.findModule<MessageModule>(
      (x) =>
        Boolean(
          (x as MessageModule)?.default &&
            (x as MessageModule)?.renderAutomodMessageMarkup,
        ),
      { usingRawModule: true },
    );

    if (!module) throw new Error("Message module not found");
    this.message_module = module;
  }

  patch() {
    ((original) => {
      Object.defineProperty(this.message_module, "default", {
        value: (msg: Message, params: RenderingParams) => {
          const opts = { message: msg, params } as RenderingArgs;
          const hookedOpts = this.message_hooks.reduce((acc, hook) => {
            const hookOut = hook(acc);
            if (hookOut?.message && hookOut?.params) {
              return hookOut;
            }
            logger.warn("MessageCustomizer", "Hook returned invalid value");
            return acc;
          }, opts);
          const component = original(hookedOpts.message, hookedOpts.params);
          return component;
        },
        writable: true,
      });
    })(this.message_module.default);
  }

  addMessageHook(hook: (args: RenderingArgs) => RenderingArgs) {
    this.message_hooks.push(hook);
  }
}
