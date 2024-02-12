export type Node<Handlers> = {
  name: string;
  band: number;
  actionHandler: Handlers;
  // storeDidChange
};
