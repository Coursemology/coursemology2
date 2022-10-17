import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { red } from '@mui/material/colors';

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
  // When an error with the 'base' attribute is returned by RoR, show it.
  if (errors.constructor === Object && errors.base) {
    return <ErrorText key={errors.base} errors={errors.base.message} />;
  }
  return (
    <div style={{ color: red[500] }}>
      <FormattedMessage
        id="lib.component.error"
        defaultMessage="Failed submitting this form. Please try again."
      />
    </div>
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
