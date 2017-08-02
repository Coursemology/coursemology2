import React, { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

const translations = defineMessages({
  prompt: {
    id: 'course.assessment.submission.commentField.prompt',
    defaultMessage: 'Enter your comment here',
  },
  comment: {
    id: 'course.assessment.submission.commentField.comment',
    defaultMessage: 'Comment',
  },
});

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
          floatingLabelText={<h4><FormattedMessage {...translations.prompt} /></h4>}
          fullWidth
          multiLine
          rows={2}
          rowsMax={4}
          value={value}
          onChange={event => this.onChange(event)}
        />
        <RaisedButton
          primary
          label={<FormattedMessage {...translations.comment} />}
          onTouchTap={() => createComment(value)}
          disabled={value === ''}
        />
      </div>
    );
  }
}
