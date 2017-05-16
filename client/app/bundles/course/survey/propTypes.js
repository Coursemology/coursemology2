import PropTypes from 'prop-types';

export const sectionShape = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
  description: PropTypes.string,
  weight: PropTypes.number,
});

export const optionShape = PropTypes.shape({
  id: PropTypes.number,
  weight: PropTypes.number,
  option: PropTypes.string,
  image_url: PropTypes.string,
  image_name: PropTypes.string,
});

export const questionShape = PropTypes.shape({
  id: PropTypes.number,
  description: PropTypes.string,
  weight: PropTypes.number,
  question_type: PropTypes.string,
  required: PropTypes.bool,
  max_options: PropTypes.number,
  min_options: PropTypes.number,
  options: PropTypes.arrayOf(optionShape),
});

export const surveyShape = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
  description: PropTypes.string,
  start_at: PropTypes.string,
  end_at: PropTypes.string,
  base_exp: PropTypes.number,
  published: PropTypes.bool,
});

export const answerOptionShape = PropTypes.shape({
  id: PropTypes.number,
  question_option_id: PropTypes.number,
  selected: PropTypes.bool,
});

export const answerShape = PropTypes.shape({
  id: PropTypes.number,
  question_id: PropTypes.number,
  text_response: PropTypes.string,
  options: PropTypes.arrayOf(answerOptionShape),
});

export const responseShape = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  submitted_at: PropTypes.string,
  sections: PropTypes.arrayOf(sectionShape),
});
