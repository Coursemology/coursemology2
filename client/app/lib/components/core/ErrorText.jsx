import { FormattedMessage } from 'react-intl';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Standardises the way errors are shown in redux/react-hook forms.
 */
const ErrorText = ({ errors }) => {
  if (
    !errors ||
    (errors.constructor === Object && Object.keys(errors).length === 0) ||
    (errors.constructor === Array && errors.length === 0)
  ) {
    return null;
  }
  if (errors.constructor === String) {
    return (
      <Typography color="error" variant="body2">
        {errors}
      </Typography>
    );
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
  return (
    <Typography color="error" variant="body2">
      <FormattedMessage
        defaultMessage="Failed submitting this form. Please try again."
        id="lib.components.core.ErrorText.error"
      />
    </Typography>
  );
};

export const errorProps = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.arrayOf(PropTypes.string),
  PropTypes.object,
]);

ErrorText.propTypes = {
  errors: errorProps,
};

export default ErrorText;
