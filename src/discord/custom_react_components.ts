import React from "react";
import DiscordPatcherCore from "./patcher_core";
import { Store } from "./type/store";
import logger from "../logger";

type ModalArgs = Record<string, never>;

const configStoreKeys = [
  'UseLegacyChatInput', 'UseRichChatInput', 'ExpressionSuggestionsEnabled', 'IncludeStickersInAutocomplete',
  'RenderSpoilers', 'UseThreadSidebar', 'QuietMode', 'EmojiPickerCollapsedSections',
  'StickerPickerCollapsedSections', 'SoundboardPickerCollapsedSections', 'ViewImageDescriptions', 'ShowCommandSuggestions',
  'AlwaysPreviewVideo', 'NotifyFriendsOnGoLive', 'NOTIFICATION_CENTER_ACKED_BEFORE_ID_UNSET', 'NotificationCenterAckedBeforeId',
  'InstallShortcutDesktop', 'InstallShortcutStartMenu', 'AllowActivityPartyPrivacyFriends', 'AllowActivityPartyPrivacyVoiceChannel',
  'MessageRequestRestrictedGuildIds', 'MessageRequestRestrictedDefault', 'NonSpamRetrainingOptIn', 'DefaultGuildsRestricted',
  'RestrictedGuildIds', 'FriendSourceFlagsSetting', 'RtcPanelShowVoiceStates', 'ConvertEmoticons',
  'MessageDisplayCompact', 'SoundboardSettings', 'DropsOptedOut', 'NativePhoneIntegrationEnabled',
  'AfkTimeout', 'ViewNsfwGuilds', 'ViewNsfwCommands', 'DisableGamesTab',
  'EnableTTSCommand', 'ExplicitContentFilter', 'DmSpamFilterV2', 'ShowCurrentGame',
  'StatusSetting', 'StatusExpiresAtSetting', 'CustomStatusSetting', 'BroadcastAllowFriends',
  'BroadcastAllowedGuildIds', 'BroadcastAllowedUserIds', 'BroadcastAutoBroadcast', 'ClipsAllowVoiceRecording',
  'InlineAttachmentMedia', 'InlineEmbedMedia', 'RenderEmbeds', 'RenderReactions',
  'TimezoneOffset', 'DeveloperMode', 'ClientThemeSettings', 'GifAutoPlay',
  'AnimateEmoji', 'AnimateStickers', 'ActivityRestrictedGuilds', 'ActivityJoiningRestrictedGuilds',
  'DefaultGuildsActivityRestricted', 'DisableHomeAutoNav', 'FamilyCenterEnabled', 'LegacyUsernameDisabled',
  'ExplicitContentSettings'
] as const;

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
    FormText: React.FC<{
      value: string,
      onChange: (e: string) => void,
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
    Select: React.FC<{
      select: string,
      options: string[],
    }>;
  };

  configStore: {
    [key: string]: {
      useSetting: () => boolean,
      getSetting: () => boolean,
      updateSetting: (e: boolean) => void,
    }
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
        Object.keys(this.configStore).map(key => {
          const store = this.configStore[key];
          if (!store || !store.getSetting || !store.useSetting || !store.updateSetting)
            return jsx(this.DiscordUI.FormSwitch, {
              value: false,
              onChange: () => { },
              note: "Keys: " + Object.keys(store).join(", "),
              children: "BAD:" + key,
            });
          const value = store.getSetting();

          if (typeof value === 'boolean')
            return jsx(this.DiscordUI.FormSwitch, {
              value: store.useSetting(),
              onChange: store.updateSetting,
              note: "Test Note",
              children: key,
            });
          else {
            const raw_value = store.useSetting();
            const str_value = raw_value?.toString() ?? 'Undefined';
            return jsx(this.DiscordUI.FormText, {
              value: str_value,
              onChange: (e: string) => { logger.info("AllSettingsElement-!b", e) },
              note: "Linked with dummy setting",
              children: key,
            });
          }
        }).filter(Boolean),
      ],
    });
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
          children: "タイトル",
        }),
      ],
    });
  }
}
