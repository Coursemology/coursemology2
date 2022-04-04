import PropTypes from 'prop-types';

// eslint-disable-next-line import/prefer-default-export
export const learningRateRecordShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  learningRate: PropTypes.number.isRequired,
  createdAt: PropTypes.object.isRequired,
});
