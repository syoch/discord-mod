import React from "react";
import { jsx } from "./jsx-runtime";

export const jsxDEV = <P extends React.Attributes, S>(
  type: React.FC,
  props: P,
  /* eslint-disable @typescript-eslint/no-unused-vars */
  _key: string,
  _flag: boolean,
  _source: string,
  _self: S,
  /* eslint-enable @typescript-eslint/no-unused-vars */
) => jsx(type, props);
