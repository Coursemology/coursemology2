import PropTypes from 'prop-types';

export const skillShape = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
});

export const attachmentReferenceShape = PropTypes.shape({
  name: PropTypes.string,
  path: PropTypes.string,
  updater_name: PropTypes.string,
  image_url: PropTypes.string,
});

export const questionShape = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
  description: PropTypes.string,
  staff_only_comments: PropTypes.string,
  maximum_grade: PropTypes.string,
  weight: PropTypes.number,
  skill_ids: PropTypes.arrayOf(PropTypes.number),
  skills: PropTypes.arrayOf(skillShape),
  attachment_reference: attachmentReferenceShape,
  published_assessment: PropTypes.bool,
});

export const dataShape = PropTypes.shape({
  question: questionShape,
  isLoading: PropTypes.bool,
  isSubmitting: PropTypes.bool,
});
