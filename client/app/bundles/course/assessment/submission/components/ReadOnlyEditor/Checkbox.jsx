import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Checkbox extends Component {
  static propTypes = {
    style: PropTypes.object,        // eslint-disable-line react/forbid-prop-types
    checked: PropTypes.bool.isRequired,
    indeterminate: PropTypes.bool,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    style: {},
    indeterminate: false,
    onChange: () => {},
  };

  render() {
    const { style, checked, indeterminate, onChange } = this.props;
    return (
      <input
        type="checkbox"
        style={style}
        ref={(input) => {
          if (input) {
            input.checked = checked;              // eslint-disable-line no-param-reassign
            input.indeterminate = indeterminate;  // eslint-disable-line no-param-reassign
          }
        }}
        onChange={onChange}
      />
    );
  }
}
