import { Dispatcher } from "../ecosystem/dispatcher";
import { Store } from "../ecosystem/store";

export type EcosystemModule = {
  // BatchedStoreListener
  // default: ...
  Dispatcher: new () => Dispatcher;
  // statesWillNeverBeEqual: ...
  Store: new () => Store;
  useStateFromStores: <T>(store: Store[], cb: () => T) => T;
  // useStateFromStoresArray: ...
  // useStateFromStoresObject: ...
};

const Ecosystem = {} as EcosystemModule;

export default Ecosystem;

export function initDiscordEcosystemModule(m: EcosystemModule) {
  Object.assign(Ecosystem, m);
}
