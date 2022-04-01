import { memo } from 'react';
import PropTypes from 'prop-types';
import { red } from '@mui/material/colors';

/**
 * Standardises the way errors are shown in redux/react-hook forms.
 */
const ErrorText = ({ errors }) => {
  if (!errors) {
    return null;
  }
  if (errors.constructor === String) {
    return <div style={{ color: red[500] }}>{`- ${errors}`}</div>;
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
  // When an error with the 'base' attribute is returned by RoR, show it.
  if (errors.constructor === Object && errors.base) {
    return <ErrorText key={errors.base} errors={errors.base.message} />;
  }
  return null;
};

export const errorProps = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.arrayOf(PropTypes.string),
  PropTypes.object,
]);

ErrorText.propTypes = {
  errors: errorProps,
};

export default memo(ErrorText);
