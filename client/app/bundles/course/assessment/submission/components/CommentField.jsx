import React, { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';

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
    isSubmitting: PropTypes.bool,

    createComment: PropTypes.func,
    handleChange: PropTypes.func,
  };

  onChange(event) {
    const { handleChange } = this.props;
    handleChange(event.target.value);
  }

  render() {
    const { value, createComment, isSubmitting } = this.props;
    return (
      <React.Fragment>
        <TextField
          floatingLabelText={<h4><FormattedMessage {...translations.prompt} /></h4>}
          fullWidth
          multiLine
          rows={2}
          rowsMax={4}
          value={value}
          disabled={isSubmitting}
          onChange={event => this.onChange(event)}
        />
        <RaisedButton
          primary
          label={<FormattedMessage {...translations.comment} />}
          onClick={() => createComment(value)}
          disabled={value === undefined || value === '' || isSubmitting}
          icon={isSubmitting ? <CircularProgress size={24} /> : null}
        />
      </React.Fragment>
    );
  }
}
