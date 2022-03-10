import PropTypes from 'prop-types';
import { red } from '@mui/material/colors';

/**
 * Standardises the way errors are shown in redux forms.
 */
const ErrorText = ({ errors }) => {
  if (!errors) {
    return null;
  }
  if (errors.constructor === String) {
    return <div style={{ color: red[500] }}>{errors}</div>;
  }
  if (errors.constructor === Array) {
    return (
      <>
        {errors.map((error) => (
          <ErrorText key={error} errors={error} />
        ))}
      </>
    );
  }
  return null;
};

export const errorProps = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.arrayOf(PropTypes.string),
]);

ErrorText.propTypes = {
  errors: errorProps,
};

export default ErrorText;
