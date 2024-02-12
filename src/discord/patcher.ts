import React from "react";
import waitEnableFor from "../utils/waitenablefor";
import MessageCustomizer from "./message_customizer";
import DiscordPatcherCore from "./patcher_core";
import { ExperimentSerializedState } from "./type/experiment/serialized_state";
import { Store } from "./ecosystem/store";
import { User } from "./type/user";
import CustomReactComponents from "./custom_react_components";

export default class DiscordPatcher {
  patcher_core: DiscordPatcherCore;

  message_customizer: MessageCustomizer;

  constructor(patcher: DiscordPatcherCore) {
    this.patcher_core = patcher;

    this.message_customizer = new MessageCustomizer(patcher);
  }

  async getDiscordModules() {
    type UserModule = {
      getUsers: () => { [key: number]: User };
      getCurrentUser: () => User;
    };
    const isUserModule = (module: object) =>
      Boolean(
        (module as UserModule)?.getUsers &&
        (module as UserModule)?.getCurrentUser,
      );

    type DeveloperMod = {
      isDeveloper: boolean;
      getExperimentDescriptor: () => {
        type: string;
        name: string;
        revision: number;
        override: boolean;
        bucket: number;
      };
    };
    const isDeveloperModule = (module: object) =>
      typeof (module as DeveloperMod)?.isDeveloper === "boolean";

    type DeveloperLiterals = {
      ExperimentBuckets: {
        TREATMENT_1: number;
      };
    };
    const isDeveloperLiteralsModule = (module: object) =>
      Boolean((module as DeveloperLiterals)?.ExperimentBuckets?.TREATMENT_1);

    const user = await this.patcher_core.getModule<UserModule>(isUserModule);
    if (!user) throw new Error("User module not found");

    const dev =
      await this.patcher_core.getModule<DeveloperMod>(isDeveloperModule);
    if (!dev) throw new Error("Developer module not found");

    const devConf = await this.patcher_core.getModule<DeveloperLiterals>(
      isDeveloperLiteralsModule,
    );
    if (!devConf) throw new Error("Developer literals module not found");

    return {
      user,
      dev,
      dev_conf: devConf,
    };
  }

  async doPatch() {
    this.message_customizer.patch();

    const modules = await this.getDiscordModules();
    await this.patcher_core.patch("User|UpdateFlag", async () => {
      const user = await waitEnableFor(
        () => modules.user.getCurrentUser(),
        5000,
      );
      /* eslint-disable no-bitwise */
      user.flags |= 4604879;
      /* eslint-enable no-bitwise */

      return true;
    });
    await Promise.all([
      this.patcher_core.syncedPatch("Dev|ExperimentDescriptor", () => {
        modules.dev.getExperimentDescriptor = () => ({
          type: "developer",
          name: "discord_dev_testing",
          revision: 1,
          override: !0,
          bucket: modules.dev_conf.ExperimentBuckets.TREATMENT_1,
        });

        return true;
      }),
      this.patcher_core.syncedPatch("Dev|isDeveloper", () => {
        Object.defineProperty(modules.dev, "isDeveloper", { value: true });

        return true;
      }),
      this.patcher_core.patch("Reload|ExperimentStore", async (patcher) => {
        type ExperimentStore = Store & {
          getSerializedState: () => ExperimentSerializedState;
        };

        type NodeHandlers = {
          OVERLAY_INITIALIZE: (data: {
            serializedExperimentStore: ExperimentSerializedState;
            user: User;
          }) => void;
        };

        const store = await patcher.getStore<ExperimentStore>("ExperimentStore", (x) =>
          Boolean(x?.getSerializedState),
        );

        const node = await patcher.getNode<NodeHandlers>("ExperimentStore");

        if (!store || !node) return false;

        const state = store.getSerializedState();
        node.actionHandler.OVERLAY_INITIALIZE({
          serializedExperimentStore: state,
          user: await waitEnableFor(
            () => modules.user.getCurrentUser(),
            5000,
            "CurrentUser not available",
          ),
        });

        return true;
      }),
      this.patcher_core.patch(
        "Reload|DeveloperExperimentStore",
        async (patcher) => {
          type NodeHandlers = {
            CONNECTION_OPEN: () => void;
          };

          const store = await patcher.getNode<NodeHandlers>("DeveloperExperimentStore");
          if (!store) return false;

          store.actionHandler.CONNECTION_OPEN();

          return true;
        },
      ),

      this.patcher_core.patch("Appearance|ShowAllItems", async (patcher) => {
        await waitEnableFor(() => patcher.req.c[800751]?.loaded, 5000);

        type SettingUIModule = {
          default: {
            prototype: {
              props: { sections: [] }; // dummy
              getPredicateSections: () => {
                section?: string;
                label?: string;
                element?: React.FC;
              }[];
            };
          };
        };

        const SettingUI = await patcher.getModule<SettingUIModule>(
          (x) =>
            Boolean(
              (x as SettingUIModule)?.default?.prototype?.getPredicateSections,
            ),
          { usingRawModule: true },
        );

        if (!SettingUI) return false;

        const customComponents = new CustomReactComponents(patcher);

        const newOption1 = {
          section: "Mod-Options",
          label: "uo-",
          element:
            customComponents.primarySettingElement.bind(customComponents),
        };
        const newOption2 = {
          section: "All-Options",
          label: "All Options",
          element: customComponents.AllSettingsElement.bind(customComponents),
        };
        SettingUI.default.prototype.getPredicateSections =
          function overrided() {
            // @ts-expect-error: Export to global
            globalThis.sections = this.props.sections;
            return [...this.props.sections, newOption1, newOption2];
          };

        return true;
      }),
    ]);
  }
}
