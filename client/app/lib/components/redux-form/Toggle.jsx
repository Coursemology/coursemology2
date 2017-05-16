import React from 'react';
import PropTypes from 'prop-types';
import MaterialToggle from 'material-ui/Toggle';
import { red500 } from 'material-ui/styles/colors';
import createComponent from './createComponent';
import mapError from './mapError';

const errorStyle = {
  color: red500,
};

// Toggle implementation with an error displayed at the bottom.
const Toggle = ({ errorText, ...props }) => (
  <div>
    <MaterialToggle {...props} />
    {
        errorText &&
        <div style={errorStyle}>{errorText}</div>
      }
  </div>
);

Toggle.propTypes = {
  errorText: PropTypes.string,
};

export default createComponent(
  Toggle,
  ({
    input: {
      onChange,
      value,
      ...inputProps
    },
    ...props
  }) => ({
    // Take out the required fields and send the rest of the props to mapError().
    ...mapError({ ...props, input: inputProps }),
    toggled: !!value,
    onToggle: onChange,
  })
);
