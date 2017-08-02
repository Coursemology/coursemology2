// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import moment from 'lib/moment';

export function arrayToObjectById(array) {
  return array.reduce((obj, item) => (
    { ...obj, [item.id]: item }
  ), {});
}

export function formatDateTime(dateTime) {
  return dateTime ? moment(dateTime).format('DD MMM YYYY, h:mma') : null;
}

export function capitaliseFirstLetter(word) {
  if (word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  return '';
}
