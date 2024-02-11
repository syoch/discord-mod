import { GuildExperiment } from "./guild_experiments";
import { UserExperiment } from "./userExperiment";

export interface ExperimentSerializedState {
  hasLoadedExperiments: boolean;
  loadedGuildExperiments: { [key: string]: GuildExperiment };
  loadedUserExperiments: { [key: string]: UserExperiment };
  guildExperimentOverrides: Record<string, never>;
  userExperimentOverrides: Record<string, never>;
  trackedExposureExperiments: {
    [key: string]: {
      time: number;
      hash: number;
    };
  };
}
