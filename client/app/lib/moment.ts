import moment from 'moment-timezone';

import { timeZone } from 'lib/helpers/server-context';

const LONG_DATE_FORMAT = 'DD MMM YYYY' as const;
const LONG_TIME_FORMAT = 'h:mma' as const;
const LONG_DATE_TIME_FORMAT =
  `${LONG_DATE_FORMAT}, ${LONG_TIME_FORMAT}` as const;

const SHORT_DATE_FORMAT = 'DD-MM-YYYY' as const;
const PRECISE_TIME_FORMAT = 'HH:mm:ss.SS' as const;
const PRECISE_DATE_TIME_FORMAT = `DD-MM-YY ${PRECISE_TIME_FORMAT}` as const;

// TODO: Do not export these and remove all of their imports
export const SHORT_TIME_FORMAT = 'HH:mm' as const;
export const SHORT_DATE_TIME_FORMAT =
  `${SHORT_DATE_FORMAT} ${SHORT_TIME_FORMAT}` as const;

const FULL_DATE_TIME_FORMAT = 'dddd, MMMM D YYYY, HH:mm' as const;
const MINI_DATE_TIME_FORMAT = 'D MMM YYYY HH:mm' as const;
const MINI_DATE_TIME_YEARLESS_FORMAT = 'D MMM HH:mm' as const;

moment.tz.setDefault(timeZone ?? undefined);

// TODO: Do not export moment and create the helpers here
export default moment;

type DateTimeFormatter = (input?: string | Date | null | number) => string;

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
export const formatPreciseTime = formatterWith(PRECISE_TIME_FORMAT);
export const formatPreciseDateTime = formatterWith(PRECISE_DATE_TIME_FORMAT);

export const formatMiniDateTime: DateTimeFormatter = (input) => {
  const dateTime = moment(input);
  if (!dateTime.isValid()) return '';

  if (dateTime.year() === moment().year())
    return dateTime.format(MINI_DATE_TIME_YEARLESS_FORMAT);

  return dateTime.format(MINI_DATE_TIME_FORMAT);
};
