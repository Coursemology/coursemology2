import { PropTypes } from 'react';

export const optionShape = PropTypes.shape({
  id: PropTypes.number,
  weight: PropTypes.number,
  option: PropTypes.string,
  image: PropTypes.string,
});

export const questionShape = PropTypes.shape({
  id: PropTypes.number,
  description: PropTypes.string,
  weight: PropTypes.number,
  question_type: PropTypes.number,
  options: PropTypes.arrayOf(optionShape),
});

export const surveyShape = PropTypes.shape({
  title: PropTypes.string,
  description: PropTypes.string,
  start_at: PropTypes.string,
  end_at: PropTypes.string,
  base_exp: PropTypes.number,
  published: PropTypes.bool,
  questions: PropTypes.arrayOf(questionShape),
});
