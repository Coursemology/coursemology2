import PropTypes from 'prop-types';

export const assessmentShape = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
  startAt: PropTypes.object.isRequired,
  endAt: PropTypes.object,
  maximumGrade: PropTypes.number,
  url: PropTypes.string,
});

export const ancestorShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  title: PropTypes.string.isRequired,
  courseTitle: PropTypes.string.isRequired,
});

// Used in the courseUsers array
export const courseUserShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  role: PropTypes.oneOf([
    'owner',
    'manager',
    'student',
    'teaching_assistant',
    'observer',
  ]).isRequired,
  isPhantom: PropTypes.bool.isRequired,
});

export const submissionRecordsShape = PropTypes.shape({
  courseUser: courseUserShape,
  submittedAt: PropTypes.object,
  endAt: PropTypes.string,
  grade: PropTypes.number,
  dayDifference: PropTypes.number,
});
