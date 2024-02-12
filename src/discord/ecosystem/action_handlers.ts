import { Node } from "./node";

export type DependencyGraph = {
  nodes: {
    [key: string]: Node<object>
  };
  outgoingEdges: {
    [key: string]: string[]
  };
  incomingEdges: {
    [key: string]: string[]
  };
  circular: boolean;
};

export type ActionHandlers = {
  _dependencyGraph: DependencyGraph;
};