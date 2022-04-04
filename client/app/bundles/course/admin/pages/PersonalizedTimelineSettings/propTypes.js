import PropTypes from 'prop-types';

// eslint-disable-next-line import/prefer-default-export
export const learningRateRecordShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  records: PropTypes.arrayOf(
    PropTypes.shape({
      createdAt: PropTypes.object.isRequired,
      learningRate: PropTypes.number.isRequired,
    }),
  ),
});
