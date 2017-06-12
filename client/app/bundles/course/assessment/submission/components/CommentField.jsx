import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

export default class CommentField extends Component {
  static propTypes = {
    value: PropTypes.string,

    createComment: PropTypes.func,
    handleChange: PropTypes.func,
  };

  onChange(event) {
    const { handleChange } = this.props;
    handleChange(event.target.value);
  }

  render() {
    const { value, createComment } = this.props;
    return (
      <div>
        <TextField
          floatingLabelText={<h4>Comments</h4>}
          fullWidth
          multiLine
          rows={2}
          rowsMax={4}
          value={value}
          onChange={event => this.onChange(event)}
        />
        <RaisedButton
          primary
          label="Comment"
          onTouchTap={() => createComment(value)}
          disabled={value === ''}
        />
      </div>
    );
  }
}
