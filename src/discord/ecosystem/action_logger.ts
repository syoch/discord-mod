export interface ActionLog {
  startTime: number;
  totalTime: number;
  traces: [];
  id: number;
  action: object;
  createdAt: Date;
}

export interface ActionLogger {
  logs: ActionLog[];
  persist: boolean;
}