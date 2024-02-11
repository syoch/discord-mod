import React from "react";
import DiscordPatcherCore from "./discord/patcher_core";
import { Store } from "./discord/type/store";

type ModalArgs = Record<string, never>;

export default class CustomReactComponents {
  patcher: DiscordPatcherCore;

  React: {
    jsx: typeof React.createElement;
    jsxs: typeof React.createElement;
  };

  ReactEv: {
    useCallback: typeof React.useCallback;
    useState: typeof React.useState;
  };

  DiscordReact: {
    useStateFromStoresObject: <T>(store: Store[], cb: () => T) => T;
  };

  DiscordUI: {
    FormSection: React.FC<{
      tag: React.FC,
      title: string,
      children: React.ReactNode
    }>;
    FormTitleTags: {
      H1: React.FC
    };
    FormSwitch: React.FC<{
      value: boolean,
      onChange: (e: boolean) => void,
      note: string,
      children: React.ReactNode,
    }>;
    openModal: React.FC;
    ConfirmModal: React.FC<{
      header: string,
      confirmText: string,
      cancelText: string,
      onConfirm: () => void,
      children: React.ReactNode,
    }>;
    Text: React.FC<{
      variant: string,
      children: React.ReactNode
    }>;
  };

  configStore: {
    DeveloperMode: {
      useSetting: () => boolean,
      updateSetting: (e: boolean) => void
    }
  };

  appTestModal: {
    default: React.FC
  };

  constructor(patcher: DiscordPatcherCore) {
    this.patcher = patcher;

    patcher.req("222007");
    this.React = patcher.req<typeof this.React>("37983");
    this.ReactEv = patcher.req<typeof this.ReactEv>("884691");
    this.DiscordReact = patcher.req<typeof this.DiscordReact>("446674");
    this.DiscordUI = patcher.req<typeof this.DiscordUI>("77078");
    this.configStore = patcher.req<typeof this.configStore>("845579");
    this.appTestModal = patcher.req<typeof this.appTestModal>("271445");
  }

  primarySettingElement() {
    const { jsx } = this.React;
    const { jsxs } = this.React;
    const { useCallback } = this.ReactEv;
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
          children: "開発者モード",
        }),
        jsx(this.DiscordUI.FormSwitch, {
          value: false,
          onChange: useCallback((e: boolean) => {
            this.DiscordUI.openModal((t: ModalArgs) => jsx(this.DiscordUI.ConfirmModal, {
              header: `モーダルのタイトル ${e}`,
              confirmText: "OK",
              cancelText: "キャンセル",
              onConfirm: () => { },
              ...t,
              children: jsx(this.DiscordUI.Text, {
                variant: "text-sm/normal",
                children: "モーダルの本文",
              }),
            }));
          }, []),
          note: "Test Note",
          children: "ハードウェア アクセラレーション",
        }),
        jsx(this.DiscordUI.FormSwitch, {
          value: false,
          onChange: useCallback((sw: boolean) => {
            console.log(sw);
            this.DiscordUI.openModal(
              (e: ModalArgs) => jsx(this.appTestModal.default, {
                ...e,
              }),
            );
          }, []),
          note: "Test Note",
          children: "アプリテストモード",
        }),
      ],
    });
  }
}
