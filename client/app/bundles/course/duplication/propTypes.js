import PropTypes from 'prop-types';

export const courseShape = PropTypes.shape({
  id: PropTypes.number,
  host: PropTypes.string,
  path: PropTypes.string,
  title: PropTypes.string,
});

export const currentCourseShape = PropTypes.shape({
  title: PropTypes.string,
  start_at: PropTypes.string,
});

export const assessmentShape = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
  published: PropTypes.bool,
});

export const tabShape = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
  assessments: PropTypes.arrayOf(assessmentShape),
});

export const categoryShape = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
  tabs: PropTypes.arrayOf(tabShape),
});

export const surveyShape = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
  published: PropTypes.bool,
});

export const achievementShape = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
  published: PropTypes.bool,
  url: PropTypes.string,
});

export const materialShape = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
});

export const folderShape = PropTypes.shape({
  id: PropTypes.number,
  parent_id: PropTypes.number,
  name: PropTypes.string,
  materials: PropTypes.arrayOf(materialShape),
});
