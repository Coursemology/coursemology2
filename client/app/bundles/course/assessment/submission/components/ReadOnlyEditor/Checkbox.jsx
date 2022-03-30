import { Component } from 'react';
import PropTypes from 'prop-types';

export default class Checkbox extends Component {
  render() {
    const { disabled, style, checked, indeterminate, onChange } = this.props;
    return (
      <input
        type="checkbox"
        style={style}
        ref={(input) => {
          if (input) {
            input.checked = checked; // eslint-disable-line no-param-reassign
            input.indeterminate = indeterminate; // eslint-disable-line no-param-reassign
          }
        }}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }
}

Checkbox.propTypes = {
  style: PropTypes.object,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  indeterminate: PropTypes.bool,
  onChange: PropTypes.func,
};

Checkbox.defaultProps = {
  style: {},
  indeterminate: false,
  onChange: () => {},
};
