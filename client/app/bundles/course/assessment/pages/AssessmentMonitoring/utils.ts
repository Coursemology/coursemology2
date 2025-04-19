import moment from 'lib/moment';

export type Presence = 'alive' | 'late' | 'missing';

/**
 * Returns the `Presence` value between two timestamps. If `endTime` is omitted, it
 * returns the `Presence` value between `startTime` and now.
 */
export const getPresenceBetween = (
  maxIntervalMs: number,
  offsetMs: number,
  startTime: string | number,
  endTime?: string | number,
): Presence => {
  const start = moment(startTime);
  const end = endTime ? moment(endTime) : moment();

  if (!start.isValid()) throw new Error(`Encountered time value: ${startTime}`);
  if (!end.isValid()) throw new Error(`Encountered time value: ${endTime}`);

  const differenceMs = end.diff(start, 'milliseconds');

  if (differenceMs <= maxIntervalMs) return 'alive';
  if (differenceMs <= maxIntervalMs + offsetMs) return 'late';

  return 'missing';
};

export interface ChartPoint {
  timestamp: number | null;

  /**
   * A number from 0 to 1 that denotes how late a heartbeat is. Alive heartbeats
   * always have a liveness of 1. Missing heartbeats have a liveness of 0. The late
   * heartbeats' liveness is the ratio of the duration since last `maxIntervalMs` to
   * `offsetMs`. See `getPresenceBuckets` for more details.
   */
  liveness: number | null;
}

export type NonNullableChartPoint = {
  [Property in keyof ChartPoint]: NonNullable<ChartPoint[Property]>;
};

type ChartPointWithPresence = ChartPoint & { presence: Presence };

const nullPoint: ChartPoint = { timestamp: null, liveness: null };

const getBuckets = (points: ChartPointWithPresence[]): ChartPoint[][] => {
  const buckets: Record<Presence, ChartPoint[]> = {
    alive: [],
    late: [],
    missing: [],
  };

  points.forEach((point) => {
    buckets[point.presence].push({
      timestamp: point.timestamp,
      liveness: point.liveness,
    });

    (['alive', 'late', 'missing'] satisfies Presence[]).forEach((key) => {
      if (key === point.presence) return;

      buckets[key].push(nullPoint);
    });
  });

  return [buckets.alive, buckets.late, buckets.missing];
};

/**
 * Returns a function that creates and pushes a `ChartPoint` to the given `points`.
 * If `presence` is different from the `presence` of the last `ChartPoint`, it adds
 * another `ChartPoint` with the same `timestamp` but previous `presence` to
 * close the range of the previous `presence`, i.e., "terminating" it.
 */
const getTerminatingPusherFor =
  (points: ChartPointWithPresence[]) =>
  (presence: Presence, timestamp: number, liveness: number): void => {
    const lastPoint = points.at(-1);

    if (lastPoint && lastPoint.presence !== presence)
      points.push({
        presence,
        timestamp: lastPoint.timestamp,
        liveness: presence === 'missing' ? 0 : 1,
      });

    points.push({ presence, timestamp, liveness });
  };

/**
 * Returns points that show the time periods of all `Presence` values from the
 * given `heartbeats`. Points are returned as `ChartPoint`s and are bucketed into
 * arrays for each `Presence` value.
 *
 * @param heartbeats The list of heartbeat points, sorted in chronological order.
 * @returns A triplet of `ChartPoint[]` for alive, late, and missing time periods.
 */
export const getPresenceBuckets = (
  heartbeats: NonNullableChartPoint[],
  maxIntervalMs: number,
  offsetMs: number,
): ChartPoint[][] => {
  if (heartbeats.length === 0) return [[], [], []];

  const points: ChartPointWithPresence[] = [];
  const push = getTerminatingPusherFor(points);

  push('alive', heartbeats[0].timestamp, 1);

  for (let i = 1; i < heartbeats.length; i++) {
    const { timestamp: last } = heartbeats[i - 1];
    const { timestamp: current } = heartbeats[i];

    const presence = getPresenceBetween(maxIntervalMs, offsetMs, last, current);

    if (presence === 'missing' || presence === 'late') {
      const lateTime = moment(last).add(maxIntervalMs);
      push('alive', lateTime.valueOf(), 1);
    }

    if (presence === 'missing') {
      const missingTime = moment(last).add(maxIntervalMs + offsetMs);
      push('late', missingTime.valueOf(), 0);
    }

    let liveness = presence === 'alive' ? 1 : 0;

    if (presence === 'late') {
      const lateDurationMs = moment(current).diff(last) - maxIntervalMs;
      liveness = 1 - lateDurationMs / offsetMs;
    }

    push(presence, current, liveness);
  }

  return getBuckets(points);
};
