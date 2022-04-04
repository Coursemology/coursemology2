import PropTypes from 'prop-types';

export const studentShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  nameLink: PropTypes.string.isRequired,
  isPhantom: PropTypes.bool.isRequired,
  groupManagers: PropTypes.string,
  level: PropTypes.number,
  experiencePoints: PropTypes.number,
  experiencePointsLink: PropTypes.string,
  videoSubmissionCount: PropTypes.number,
  videoSubmissionLink: PropTypes.string,
  videoPercentWatched: PropTypes.number,
});

export const studentsIndexShape = PropTypes.shape({
  isCourseGamified: PropTypes.bool.isRequired,
  showVideo: PropTypes.bool.isRequired,
  courseVideoCount: PropTypes.number.isRequired,
  hasGroupManagers: PropTypes.bool.isRequired,
  students: PropTypes.arrayOf(studentShape).isRequired,
  isFetching: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
});
