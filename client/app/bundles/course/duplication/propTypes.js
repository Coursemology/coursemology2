import PropTypes from 'prop-types';

export const courseShape = PropTypes.shape({
  id: PropTypes.number,
  host: PropTypes.string,
  path: PropTypes.string,
  title: PropTypes.string,
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
