import moment from 'moment-timezone';

moment.updateLocale('en', {
  relativeTime: {
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

export const formatMiniDateTime: DateTimeFormatter = (input) => {
  const dateTime = moment(input);
  if (!dateTime.isValid()) return '';

  if (dateTime.year() === moment().year())
    return dateTime.format(MINI_DATE_TIME_YEARLESS_FORMAT);

  return dateTime.format(MINI_DATE_TIME_FORMAT);
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
