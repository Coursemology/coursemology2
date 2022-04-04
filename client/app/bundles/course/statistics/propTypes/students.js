import PropTypes from 'prop-types';

export const studentShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  isPhantom: PropTypes.bool.isRequired,
  groupManagers: PropTypes.string,
  level: PropTypes.number,
  experiencePoints: PropTypes.number,
  experiencePointsLink: PropTypes.string,
  // And the remaining properties are [assessment_id, correctness] pairs
});

export const assessmentShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  startAt: PropTypes.object.isRequired,
});

export const studentsIndexShape = PropTypes.shape({
  students: PropTypes.arrayOf(studentShape).isRequired,
  assessments: PropTypes.arrayOf(assessmentShape).isRequired,
  isCourseGamified: PropTypes.bool.isRequired,
  hasGroupManagers: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
});
