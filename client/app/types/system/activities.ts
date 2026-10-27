export type ActivityGranularity = 'month' | 'year';

export interface ActivityStatisticsParams {
  granularity: ActivityGranularity;
  /** Monthly view only; the yearly view always runs from `firstYear` to the current year. */
  year?: number;
  /**
   * The signed-in user's id. Not read by the server: it keys the browser's HTTP cache per user,
   * so another account in the same browser cannot be served this user's cached response.
   */
  viewer_id: number;
}

export interface InstanceActivityCounts {
  id: number;
  name: string;
  host: string;
  /**
   * Unique active students per bucket, aligned with `buckets`; null for buckets that have not
   * started yet. Not summable across buckets.
   */
  counts: (number | null)[];
  /** The same months one year earlier; null outside the monthly view and for the first year. */
  previousCounts: (number | null)[] | null;
}

export interface ActivityStatisticsData {
  granularity: ActivityGranularity;
  /**
   * The year of the earliest activity mark (the current year if there are none). The yearly view starts here and
   * the monthly view cannot step back past it.
   */
  firstYear: number;
  /** 'YYYY-MM' for monthly buckets, 'YYYY' for yearly buckets. */
  buckets: string[];
  lastCompleteBucket: string | null;
  /** Unique active students across all instances, so not the sum of `instances`. */
  overall: (number | null)[];
  /** See `InstanceActivityCounts.previousCounts`. */
  previousOverall: (number | null)[] | null;
  instances: InstanceActivityCounts[];
}
