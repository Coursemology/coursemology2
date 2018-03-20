import React from 'react';
import PropTypes from 'prop-types';
import { red500 } from 'material-ui/styles/colors';

/**
 * Standardises the way errors are shown in redux forms.
 */
const ErrorText = ({ errors }) => {
  if (!errors) { return null; }
  if (errors.constructor === String) {
    return <div style={{ color: red500 }}>{ errors }</div>;
  }
  if (errors.constructor === Array) {
    return (
      <React.Fragment>
        { errors.map(error => <ErrorText key={error} errors={error} />) }
      </React.Fragment>
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
