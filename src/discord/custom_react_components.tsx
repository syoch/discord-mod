import {
  JSXRuntimeModule,
  initJSXRuntimeModule
} from "wrapped-react/jsx-runtime";

import { ReactModule, initReactModule, useRef } from "wrapped-react/react";
import DiscordPatcherCore from "./patcher_core";

import DiscordUI, {
  DiscordUIModule,
  initDiscordUIModule
} from "./modules/discord_ui";

import ConfigStore, {
  DiscordConfigStoreModule,
  initDiscordConfigStore,
  DiscordConfig
} from "./modules/config_store";
import {
  EcosystemModule,
  initDiscordEcosystemModule
} from "./modules/ecosystem";

export default class CustomReactComponents {
  patcher: DiscordPatcherCore;

  constructor(patcher: DiscordPatcherCore) {
    this.patcher = patcher;

    patcher.req("222007");
    initDiscordEcosystemModule(patcher.req<EcosystemModule>("446674"));
    initReactModule(patcher.req<ReactModule>("884691"));
    initDiscordConfigStore(patcher.req<DiscordConfigStoreModule>("845579"));
    initDiscordUIModule(patcher.req<DiscordUIModule>("77078"));
    initJSXRuntimeModule(patcher.req<JSXRuntimeModule>("37983"));
  }

  AllSettingsElement() {
    if (0) this.patcher.req("0");
    const settings = Object.keys(ConfigStore).map((key) => {
      const store = ConfigStore[key];
      if (
        !store ||
        !store.getSetting ||
        !store.useSetting ||
        !store.updateSetting
      ) {
        return (
          <DiscordUI.FormSwitch
            value={false}
            onChange={() => {}}
            note={`Keys: ${Object.keys(store).join(", ")}`}
          >{`BAD:${key}`}</DiscordUI.FormSwitch>
        );
      }

      const value = store.getSetting();
      if (typeof value === "boolean") {
        const typedStore = store as DiscordConfig<boolean>;
        return (
          <DiscordUI.FormSwitch
            value={typedStore.useSetting()}
            onChange={typedStore.updateSetting}
            note="Boolean"
          >
            {key}
          </DiscordUI.FormSwitch>
        );
      }

      const rawValue = store.useSetting();
      const strValue = rawValue?.toString() ?? "Undefined";
      const ref =
        useRef<HTMLInputElement>() as React.RefObject<HTMLInputElement>;

      const i = setInterval(() => {
        if (ref.current) {
          ref.current.value = strValue;
          clearInterval(i);
        }
      }, 200);

      return (
        <DiscordUI.FormItem title={`${key} (${typeof value})`}>
          <DiscordUI.TextInput inputRef={ref} />
        </DiscordUI.FormItem>
      );
    });

    return (
      <DiscordUI.FormSection
        tag={DiscordUI.FormTitleTags.H1}
        title="パッチ設定"
      >
        {settings}
      </DiscordUI.FormSection>
    );
  }

  primarySettingElement() {
    if (0) this.patcher.req("0");

    const developerModeConfig =
      ConfigStore.DeveloperMode as DiscordConfig<boolean>;
    const developerMode = developerModeConfig.useSetting();

    return (
      <DiscordUI.FormSection
        tag={DiscordUI.FormTitleTags.H1}
        title="すごい設定"
      >
        <DiscordUI.FormSwitch
          value={developerMode}
          onChange={developerModeConfig.updateSetting}
          note="Test Note"
        >
          タイトル
        </DiscordUI.FormSwitch>
      </DiscordUI.FormSection>
    );
  }
}
