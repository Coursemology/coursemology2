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
    airMode: PropTypes.bool,

    createComment: PropTypes.func,
    handleChange: PropTypes.func,
  };

  static defaultProps = {
    airMode: true,
  };

  onChange(nextValue) {
    const { handleChange } = this.props;
    handleChange(nextValue);
  }

  render() {
    const { createComment, inputId, isSubmitting, value, airMode } = this.props;
    return (
      <>
        <MaterialSummernote
          airMode={airMode}
          disabled={isSubmitting}
          inputId={inputId}
          label={<h4><FormattedMessage {...translations.prompt} /></h4>}
          onChange={nextValue => this.onChange(nextValue)}
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
