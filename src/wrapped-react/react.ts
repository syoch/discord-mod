import React from "react";

export type ReactModule = {
  useCallback: typeof React.useCallback;
  useState: typeof React.useState;
  useRef: typeof React.useRef;
};

const WrappedReact: ReactModule = {} as ReactModule;

export function initReactModule(module: ReactModule) {
  Object.assign(WrappedReact, module);
  return WrappedReact;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const useCallback = <T extends Function>(
  ...args: Parameters<typeof WrappedReact.useCallback<T>>
) => WrappedReact.useCallback<T>(...args);

export const useState = <T>(
  ...args: Parameters<typeof WrappedReact.useState<T>>
) => WrappedReact.useState<T>(...args);

export const useRef = <T>(...args: Parameters<typeof WrappedReact.useRef<T>>) =>
  WrappedReact.useRef<T>(...args);
