export interface GuildExperiment {
  aaMode: boolean;
  hashKey: string | null;
  holdoutBucket: null; // it may be a string
  holdoutName: null;
  overrides: {
    [guildId: string]: boolean
  };
  overridesFormatted: [],
  populations: {
    buckets: {
      bucket: number,
      positions: {
        start: number,
        end: number
      }[]
    }[],
    filters: [], // it may contain a filter object
    rawFilterData: [number, [number, number][]][]
  }[]
}
