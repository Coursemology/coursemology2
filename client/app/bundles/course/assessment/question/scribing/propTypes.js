import PropTypes from 'prop-types';

export const skillIdShape = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
});

export const skillShape = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
});

export const attachmentReferenceShape = PropTypes.shape({
  name: PropTypes.string,
  path: PropTypes.string,
  updater_name: PropTypes.string,
});

export const errorShape = PropTypes.shape({
  title: PropTypes.string,
  skills_id: PropTypes.string,
  maximum_grade: PropTypes.number,
});

export const questionShape = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
  description: PropTypes.string,
  staff_only_comments: PropTypes.string,
  maximum_grade: PropTypes.number,
  weight: PropTypes.number,
  skill_ids: PropTypes.arrayOf(skillIdShape),
  skills: PropTypes.arrayOf(skillShape),
  attachment_reference: attachmentReferenceShape,
  error: errorShape,
  published_assessment: PropTypes.bool,
});

export const dataShape = PropTypes.shape({
  question: questionShape,
  is_loading: PropTypes.bool,
  is_submitting: PropTypes.bool,
  save_errors: PropTypes.arrayOf(PropTypes.string),
});
