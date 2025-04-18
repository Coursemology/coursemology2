import { TimeData } from 'types/course/referenceTimelines';

import moment from 'lib/moment';

const SECONDS_IN_A_DAY = 86_400 as const;

export const DAY_WIDTH_PIXELS = 30 as const;

interface DraftTimeData {
  id?: TimeData['id'];
  startAt?: moment.Moment;
  bonusEndAt?: moment.Moment;
  endAt?: moment.Moment;
}

export type DraftableTimeData = TimeData | DraftTimeData;

export const getDaysFromSeconds = (seconds: number): number =>
  Math.floor(seconds / SECONDS_IN_A_DAY);

export const getSecondsFromDays = (days: number): number =>
  days * SECONDS_IN_A_DAY;

export const getDurationDays = (
  start: moment.Moment,
  end: moment.Moment,
): number => end.diff(start, 'days') + 1;

export const getDaysFromWidth = (width: number): number =>
  Math.floor(width / DAY_WIDTH_PIXELS);

export const isWeekend = (day: moment.Moment): boolean => {
  const dayOfWeek = day.day();
  return dayOfWeek === 6 || dayOfWeek === 0;
};

export const isToday = (day: moment.Moment): boolean =>
  day.isSame(moment(), 'day');
