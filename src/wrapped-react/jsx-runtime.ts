import { Attributes, FC, createElement } from "react";

export type JSXRuntimeModule = {
  jsx: typeof createElement;
  jsxs: typeof createElement;
};

const JSXRuntime: JSXRuntimeModule = {} as JSXRuntimeModule;

export const jsx = (type: FC, props: Attributes) => JSXRuntime.jsx(type, props);
export const jsxs = (type: FC, props: Attributes) =>
  JSXRuntime.jsxs(type, props);

export function initJSXRuntimeModule(module: JSXRuntimeModule) {
  Object.assign(JSXRuntime, module);
  return JSXRuntime;
}

export default JSXRuntime;
