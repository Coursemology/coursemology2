import moment from 'moment-timezone';
import { timeZone } from 'lib/helpers/server-context';

export const longDate = 'DD MMM YYYY';
export const longTime = 'h:mma';
export const longDateTime = `${longDate}, ${longTime}`;
export const shortDate = 'DD-MM-YYYY';
export const shortTime = 'HH:mm';
export const shortDateTime = `${shortDate} ${shortTime}`;

moment.tz.setDefault(timeZone);
export default moment;

/*
 * Be default, moment#format returns "Invalid date" if date is invalid or absent.
 * This method returns a blank string or some user specified string instead.
 */
const formatDateTime = format => (dateTimeInput, defaultString = '') => {
  const dateTime = moment(dateTimeInput);
  return dateTime.isValid() ? dateTime.format(format) : defaultString;
};

export const formatLongDateTime = formatDateTime(longDateTime);
export const formatShortDateTime = formatDateTime(shortDateTime);
