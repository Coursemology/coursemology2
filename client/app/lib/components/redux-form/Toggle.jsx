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
class Toggle extends React.Component {
  static propTypes = {
    errorText: PropTypes.string,
  }

  render() {
    const { errorText, ...props } = this.props;
    return (
      <div>
        <MaterialToggle {...props} />
        {
            errorText &&
            <div style={errorStyle}>{errorText}</div>
          }
      </div>
    );
  }
}

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
