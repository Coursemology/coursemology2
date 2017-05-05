/* eslint-disable react/no-danger */

import React, { Component, PropTypes } from 'react';
import Checkbox from 'material-ui/Checkbox';

export default class CheckboxFormGroup extends Component {

  render() {
    const { options, input } = this.props;
    return (
      <div>
        {options.map(option =>
          <Checkbox
            key={option.id}
            value={option.id}
            checked={input.value.indexOf(option.id) !== -1}
            onCheck={(event, isInputChecked) => {
              const newValue = [...input.value];
              if (isInputChecked) {
                newValue.push(option.id);
              } else {
                newValue.splice(newValue.indexOf(option.id), 1);
              }
              return input.onChange(newValue);
            }}
            label={(
              <div dangerouslySetInnerHTML={{ __html: option.option.trim() }} />
            )}
            labelStyle={{ verticalAlign: 'middle' }}
          />
        )}
      </div>
    );
  }
}

CheckboxFormGroup.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    option: PropTypes.string.isRequired,
  })).isRequired,
  input: PropTypes.shape({
    onChange: PropTypes.func,
  }).isRequired,
};
