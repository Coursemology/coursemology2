import { IntlShape } from 'react-intl';
import moment from 'moment-timezone';

// English's plural unit names, for formatHumanizedDuration. Moment's own `dd`/`hh`/`mm`/`ss`
// patterns are bare `%d days`-style strings, which read as "1 seconds" at a count of one. The
// singular `m`/`h`/`d` keys below cover the other units at a count of one, since humanize() always
// picks those. Locales without plural forms (ko, zh) need no such help and are left to moment.
const pluralise =
  (one: string, many: string) =>
  (count: number): string =>
    `${count} ${count === 1 ? one : many}`;

moment.updateLocale('en', {
  relativeTime: {
    dd: pluralise('day', 'days'),
    hh: pluralise('hour', 'hours'),
    mm: pluralise('minute', 'minutes'),
    ss: pluralise('second', 'seconds'),
    m: '1 minute',
    h: '1 hour',
    d: '1 day',
    w: '1 week',
    M: '1 month',
    y: '1 year',
  },
});

const LONG_DATE_FORMAT = 'DD MMM YYYY' as const;
const LONG_TIME_FORMAT = 'h:mma' as const;
const LONG_DATE_TIME_FORMAT =
  `${LONG_DATE_FORMAT}, ${LONG_TIME_FORMAT}` as const;

const SHORT_DATE_FORMAT = 'DD-MM-YYYY' as const;
const PRECISE_SECONDS_TIME_FORMAT = 'HH:mm:ss' as const;
const PRECISE_TIME_FORMAT = 'HH:mm:ss.SS' as const;
const PRECISE_DATE_TIME_FORMAT = `DD-MM-YY ${PRECISE_TIME_FORMAT}` as const;

const SHORT_TIME_FORMAT = 'HH:mm' as const;
const SHORT_DATE_TIME_FORMAT =
  `${SHORT_DATE_FORMAT} ${SHORT_TIME_FORMAT}` as const;

const FULL_DATE_TIME_FORMAT = 'dddd, MMMM D YYYY, HH:mm' as const;
const MINI_DATE_TIME_FORMAT = 'D MMM YYYY HH:mm' as const;
const MINI_DATE_TIME_YEARLESS_FORMAT = 'D MMM HH:mm' as const;

const SECONDS_IN_A_DAY = 86400 as const;

// TODO: Do not export moment and create the helpers here
export default moment;

type DateTimeFormatter = (input?: string | Date | null | number) => string;
type DurationFormatter = (input?: string | null | number) => string;

const formatterWith =
  (format: string): DateTimeFormatter =>
  (input) => {
    const dateTime = moment(input);
    if (!dateTime.isValid()) return '';

    return dateTime.format(format);
  };

export const formatLongDate = formatterWith(LONG_DATE_FORMAT);
export const formatLongDateTime = formatterWith(LONG_DATE_TIME_FORMAT);
export const formatShortDateTime = formatterWith(SHORT_DATE_TIME_FORMAT);
export const formatFullDateTime = formatterWith(FULL_DATE_TIME_FORMAT);
export const formatShortTime = formatterWith(SHORT_TIME_FORMAT);
export const formatPreciseTime = formatterWith(PRECISE_TIME_FORMAT);
export const formatPreciseDateTime = formatterWith(PRECISE_DATE_TIME_FORMAT);

export const formatRawDate: DateTimeFormatter = (input) => {
  const dateTime = moment.utc(input);
  if (!dateTime.isValid()) return '';

  return dateTime.format(SHORT_DATE_FORMAT);
};

export const formatMiniDateTime: DateTimeFormatter = (input) => {
  const dateTime = moment(input);
  if (!dateTime.isValid()) return '';

  if (dateTime.year() === moment().year())
    return dateTime.format(MINI_DATE_TIME_YEARLESS_FORMAT);

  return dateTime.format(MINI_DATE_TIME_FORMAT);
};

// Each component is humanized on its own, so every threshold has to be pushed out of the way to
// stop humanize() promoting it to the next unit up: without these, 50 minutes becomes "an hour",
// 23 hours "a day", and 40 days "a month". `ss: -1` stops a seconds count collapsing into the
// vaguer "a few seconds". Same idea as formatSecondsDuration overriding the day threshold.
const HUMANIZED_DURATION_THRESHOLDS = {
  ss: -1,
  s: 60,
  m: 60,
  h: 24,
  d: Number.MAX_SAFE_INTEGER,
} as const;

// Largest unit first. Days is the largest unit named: weeks and months are too coarse to be useful
// about a deadline.
const HUMANIZED_DURATION_UNITS = [
  // asDays() rather than days(): moment normalises days into months, so days() alone reports 9 for
  // a 40-day duration.
  ['d', (duration: moment.Duration): number => Math.floor(duration.asDays())],
  ['h', (duration: moment.Duration): number => duration.hours()],
  ['m', (duration: moment.Duration): number => duration.minutes()],
  ['s', (duration: moment.Duration): number => duration.seconds()],
] as const;

/**
 * Formats a duration in milliseconds to second precision, reading naturally in the active locale:
 * "3 days, 2 hours, 10 minutes, and 5 seconds".
 *
 * Each unit is humanized by moment, so the unit names follow whatever locale `moment.locale()` is
 * set to (see I18nProvider) without unit strings being maintained per locale here. The parts are
 * then joined by `Intl.ListFormat` through react-intl, so the separators and final conjunction
 * follow the locale too rather than being hardcoded to English's ", and ".
 *
 * Units that are zero are omitted, so a deadline less than a day away does not read "0 days,
 * 0 hours, 1 minute, and 5 seconds". A duration with nothing left to name — under one second —
 * formats as the empty string; callers that would display it should switch messages at that point
 * rather than render a countdown they cannot express.
 */
export const formatHumanizedDuration = (
  intl: IntlShape,
  milliseconds: number,
): string => {
  const duration = moment.duration(Math.max(milliseconds, 0));

  const parts = HUMANIZED_DURATION_UNITS.map(
    ([unit, valueOf]) => [unit, valueOf(duration)] as const,
  )
    .filter(([, value]) => value > 0)
    .map(([unit, value]) =>
      moment
        .duration(value, unit)
        .humanize(false, HUMANIZED_DURATION_THRESHOLDS),
    );

  return intl.formatList(parts, { type: 'conjunction' });
};

export const formatSecondsDuration: DurationFormatter = (input) => {
  if (!input) return '--:--:--';
  if (typeof input === 'string') {
    input = parseInt(input, 10);
  }

  const durationDays =
    input >= SECONDS_IN_A_DAY
      ? // Always display days for greater precision, otherwise "40 days" gets rounded to "a month"
        moment
          .duration(Math.floor(input / SECONDS_IN_A_DAY), 'd')
          .humanize(false, { d: 1_000_000_000 })
      : '';

  const durationTime = moment
    .utc((input % SECONDS_IN_A_DAY) * 1000)
    .format(PRECISE_SECONDS_TIME_FORMAT);
  return [durationDays, durationTime].join('  ').trim();
};
