import PropTypes from 'prop-types';

export const groupManagerShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  nameLink: PropTypes.string.isRequired,
});

export const studentShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  nameLink: PropTypes.string.isRequired,
  studentType: PropTypes.oneOf(['Phantom', 'Normal']).isRequired,
  groupManagers: PropTypes.arrayOf(groupManagerShape),
  level: PropTypes.number,
  experiencePoints: PropTypes.number,
  isMyStudent: PropTypes.bool,
  experiencePointsLink: PropTypes.string,
  videoSubmissionCount: PropTypes.number,
  videoSubmissionLink: PropTypes.string,
  videoPercentWatched: PropTypes.number,
});

export const studentsStatisticsTableShape = {
  students: PropTypes.arrayOf(studentShape).isRequired,
  metadata: PropTypes.shape({
    isCourseGamified: PropTypes.bool.isRequired,
    showVideo: PropTypes.bool.isRequired,
    courseVideoCount: PropTypes.number.isRequired,
    hasGroupManagers: PropTypes.bool.isRequired,
  }),
};
