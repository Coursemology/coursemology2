import PropTypes from 'prop-types';

export const assessmentShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  startAt: PropTypes.string.isRequired,
  endAt: PropTypes.string,
});

export const submissionShape = PropTypes.shape({
  id: PropTypes.number.isRequired, // user id
  name: PropTypes.string.isRequired, // user name
  isPhantom: PropTypes.bool.isRequired, // user isPhantom
  submissions: PropTypes.arrayOf(
    PropTypes.shape({
      assessmentId: PropTypes.number.isRequired,
      submittedAt: PropTypes.string.isRequired,
    }),
  ),
});

export const studentShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  isPhantom: PropTypes.bool.isRequired,
  numSubmissions: PropTypes.number.isRequired,
  correctness: PropTypes.number,
  learningRate: PropTypes.number,
  achievementCount: PropTypes.number,
  level: PropTypes.number,
  experiencePoints: PropTypes.number,
  experiencePointsLink: PropTypes.string,
  videoSubmissionCount: PropTypes.number,
  videoSubmissionLink: PropTypes.string,
  videoPercentWatched: PropTypes.number,
});

export const courseIndexShape = {
  assessments: PropTypes.arrayOf(assessmentShape),
  submissions: PropTypes.arrayOf(submissionShape),
  students: PropTypes.arrayOf(studentShape),

  metadata: PropTypes.shape({
    hasPersonalizedTimeline: PropTypes.bool.isRequired,
    isCourseGamified: PropTypes.bool.isRequired,
    showVideo: PropTypes.bool.isRequired,
    courseVideoCount: PropTypes.number.isRequired,
    courseAchievementCount: PropTypes.number.isRequired,
    courseAssessmentCount: PropTypes.number.isRequired,
    maxLevel: PropTypes.number.isRequired,
    hasGroupManagers: PropTypes.bool.isRequired,
  }),

  isFetchingProgression: PropTypes.bool.isRequired,
  isErrorProgression: PropTypes.bool.isRequired,
  isFetchingPerformance: PropTypes.bool.isRequired,
  isErrorPerformance: PropTypes.bool.isRequired,
};
