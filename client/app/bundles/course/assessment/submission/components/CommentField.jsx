import React, { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import MaterialSummernote from 'lib/components/MaterialSummernote';

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
    inputId: PropTypes.string,
    isSubmitting: PropTypes.bool,
    value: PropTypes.string,

    createComment: PropTypes.func,
    handleChange: PropTypes.func,
  };

  onChange(nextValue) {
    const { handleChange } = this.props;
    handleChange(nextValue);
  }

  onKeyDown(e) {
    const { createComment, isSubmitting, value } = this.props;
    if (e.ctrlKey && e.keyCode === 13 && !isSubmitting) {
      e.preventDefault();
      createComment(value);
    }
  }

  render() {
    const { createComment, inputId, isSubmitting, value } = this.props;
    return (
      <>
        <MaterialSummernote
          airMode
          disabled={isSubmitting}
          inputId={inputId}
          label={<h4><FormattedMessage {...translations.prompt} /></h4>}
          onChange={nextValue => this.onChange(nextValue)}
          onKeyDown={e => this.onKeyDown(e)}
          value={value}
        />
        <RaisedButton
          primary
          label={<FormattedMessage {...translations.comment} />}
          onClick={() => createComment(value)}
          disabled={value === undefined || value === '' || isSubmitting}
          icon={isSubmitting ? <CircularProgress size={24} /> : null}
        />
      </>
    );
  }
}
