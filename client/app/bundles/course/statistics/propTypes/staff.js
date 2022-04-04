import PropTypes from 'prop-types';

export const staffShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  numGraded: PropTypes.number.isRequired,
  numStudents: PropTypes.number.isRequired,
  averageMarkingTime: PropTypes.string.isRequired,
  stddev: PropTypes.string.isRequired,
});

export const staffIndexShape = PropTypes.shape({
  staff: PropTypes.arrayOf(staffShape).isRequired,
  isFetching: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
});
