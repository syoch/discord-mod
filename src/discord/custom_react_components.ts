import React from "react";
import DiscordPatcherCore from "./patcher_core";
import { Store } from "./type/store";

export default class CustomReactComponents {
  patcher: DiscordPatcherCore;

  React: {
    jsx: typeof React.createElement;
    jsxs: typeof React.createElement;
  };

  ReactEv: {
    useCallback: typeof React.useCallback;
    useState: typeof React.useState;
    useRef: typeof React.useRef;
  };

  DiscordReact: {
    useStateFromStoresObject: <T>(store: Store[], cb: () => T) => T;
  };

  DiscordUI: {
    FormSection: React.FC<{
      tag: React.FC;
      title: string;
      children: React.ReactNode;
    }>;
    FormTitleTags: {
      H1: React.FC;
    };
    FormSwitch: React.FC<{
      value: boolean;
      onChange: (e: boolean) => void;
      note: string;
      children: React.ReactNode;
    }>;
    TextInput: React.FC<{
      className?: string;
      inputClassName?: string;
      inputPrefix?: string;
      disabled?: boolean;
      size?: number;
      editable?: boolean;
      prefixElement?: React.ReactElement;
      focusProps?: Record<string, string>;
      inputRef: React.RefObject<HTMLInputElement>;
    }>;
    Switch: React.FC<{
      onChange: (e: boolean) => void;
      checked: boolean;
      disabled?: boolean;
      className?: string;
    }>;
    FormItem: React.FC<{
      children: React.ReactNode;
      disabled?: boolean;
      className?: string;
      titleClassName?: string;
      tag?: string;
      required?: boolean;
      style?: Record<string, string>;
      title: string;
      error?: boolean;
    }>;
    openModal: React.FC;
    ConfirmModal: React.FC<{
      header: string;
      confirmText: string;
      cancelText: string;
      onConfirm: () => void;
      children: React.ReactNode;
    }>;
    Text: React.FC<{
      variant: string;
      children: React.ReactNode;
    }>;
    Select: React.FC<{
      select: string;
      options: string[];
    }>;
  };

  configStore: {
    [key: string]: {
      useSetting: () => boolean;
      getSetting: () => boolean;
      updateSetting: (e: boolean) => void;
    };
  };

  constructor(patcher: DiscordPatcherCore) {
    this.patcher = patcher;

    patcher.req("222007");
    this.React = patcher.req<typeof this.React>("37983");
    this.ReactEv = patcher.req<typeof this.ReactEv>("884691");
    this.DiscordReact = patcher.req<typeof this.DiscordReact>("446674");
    this.DiscordUI = patcher.req<typeof this.DiscordUI>("77078");
    this.configStore = patcher.req<typeof this.configStore>("845579");
  }

  AllSettingsElement() {
    const { jsx } = this.React;
    const { jsxs } = this.React;

    return jsxs(this.DiscordUI.FormSection, {
      tag: this.DiscordUI.FormTitleTags.H1,
      title: "すごい設定",
      children: [
        Object.keys(this.configStore).map((key) => {
          const store = this.configStore[key];
          if (
            !store ||
            !store.getSetting ||
            !store.useSetting ||
            !store.updateSetting
          ) {
            return jsx(this.DiscordUI.FormSwitch, {
              value: false,
              onChange: () => {},
              note: `Keys: ${Object.keys(store).join(", ")}`,
              children: `BAD:${key}`,
            });
          }

          const value = store.getSetting();
          if (typeof value === "boolean") {
            return jsx(this.DiscordUI.FormSwitch, {
              value: store.useSetting(),
              onChange: store.updateSetting,
              note: "Boolean",
              children: key,
            });
          }

          const rawValue = store.useSetting();
          const strValue = rawValue?.toString() ?? "Undefined";
          const ref = this.ReactEv.useRef<HTMLInputElement>(null);

          const i = setInterval(() => {
            if (ref.current) {
              ref.current.value = strValue;
              clearInterval(i);
            }
          }, 200);

          return jsx(this.DiscordUI.FormItem, {
            title: `${key} (${typeof value})`,
            children: jsx(this.DiscordUI.TextInput, {
              inputRef: ref,
            }),
          });
        }),
      ],
    });
  }

  primarySettingElement() {
    const { jsx } = this.React;
    const { jsxs } = this.React;
    // const { useCallback } = this.ReactEv;
    // const { useState } = this.ReactEv;

    // const [enableHardwareAcceleration] = useState(
    //   () => this.HWAccel.default.getEnableHardwareAcceleration()
    // );
    const developerMode = this.configStore.DeveloperMode.useSetting();

    return jsxs(this.DiscordUI.FormSection, {
      tag: this.DiscordUI.FormTitleTags.H1,
      title: "すごい設定",
      children: [
        jsx(this.DiscordUI.FormSwitch, {
          value: developerMode,
          onChange: this.configStore.DeveloperMode.updateSetting,
          note: "Test Note",
          children: "タイトル",
        }),
      ],
    });
  }
}
