export type InternalModule = { id: number; loaded: boolean; exports: object; };

export type RequireFunction = (<T = object>(id: string) => T) & {
  c: { [n: number]: InternalModule; };
  m: { [n: number]: InternalModule; };
};
