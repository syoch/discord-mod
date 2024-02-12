export type DependencyGraph = {
  nodes: {
    [key: string]: Node
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