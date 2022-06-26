const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * This function is meant to abstract the combination of both date and time
 * and format it nicely
 * @param dateTime a raw datetime
 * @return Format: Day, Month Date Year Time
 *         Example: Thursday, June 05 2022 15:13
 */
// eslint-disable-next-line import/prefer-default-export
export const getFullDateTime = (dateTime: string): string => {
  const dateObj = new Date(dateTime);
  const dayName = days[dateObj.getDay()];
  const monthName = months[dateObj.getMonth()];
  return `${dayName}, ${dateObj.getDate()} ${monthName} ${dateObj.getFullYear()} 
          ${dateObj.toTimeString().slice(0, 5)}`;
};
