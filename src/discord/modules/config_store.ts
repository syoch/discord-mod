export type DiscordConfig<T> = {
  useSetting: () => T;
  getSetting: () => T;
  updateSetting: (e: T) => void;
};

export type DiscordConfigStoreModule = {
  [key: string]: DiscordConfig<boolean>
  | DiscordConfig<string>
  | DiscordConfig<object>
  | DiscordConfig<undefined>
  | DiscordConfig<number>
};

const ConfigStore = {} as DiscordConfigStoreModule;

export default ConfigStore;

export function initDiscordConfigStore(m: DiscordConfigStoreModule) {
  Object.assign(ConfigStore, m);
}