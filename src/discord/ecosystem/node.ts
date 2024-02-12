export type Node = {
  name: string,
  band: number,
  actionHandler: {
    [key: string]: (o: object) => void;
  }
  // storeDidChange
};