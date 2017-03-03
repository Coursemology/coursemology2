import moment from 'lib/moment';

export const shortDateFormat = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
};

export const standardDateFormat = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
};

export const shortTimeFormat = {
  hour12: false,
};

export const aWeekStartingTomorrow = () => {
  const startAt = moment().add(1, 'd').startOf('day');
  const endAt = moment(startAt).add(6, 'd').endOf('day').startOf('minute');

  return {
    start_at: startAt.toDate(),
    end_at: endAt.toDate(),
  };
};

export const formatDateTime = dateTime => (
  dateTime ? moment(dateTime).format('DD-MM-YYYY HH:mm') : ''
);
