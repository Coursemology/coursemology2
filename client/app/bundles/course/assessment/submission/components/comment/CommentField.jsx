import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Tooltip } from 'react-tooltip';
import { Button, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';

const translations = defineMessages({
  prompt: {
    id: 'course.assessment.submission.comment.CommentField.prompt',
    defaultMessage: 'Enter your comment here',
  },
  comment: {
    id: 'course.assessment.submission.comment.CommentField.comment',
    defaultMessage: 'Comment',
  },
  commentDelayed: {
    id: 'course.assessment.submission.comment.CommentField.commentDelayed',
    defaultMessage: 'Delayed Comment',
  },
  commentDelayedDescription: {
    id: 'course.assessment.submission.comment.CommentField.commentDelayedDescription',
    defaultMessage:
      'This comment will only be visible to students after the grades for this submission are published.',
  },
});

export default class CommentField extends Component {
  onChange(nextValue) {
    const { handleChange } = this.props;
    handleChange(nextValue);
  }

  render() {
    const {
      createComment,
      inputId,
      isSubmittingNormalComment,
      isSubmittingDelayedComment,
      isUpdatingComment,
      value,
      renderDelayedCommentButton,
    } = this.props;
    const disableCommentButton =
      value === undefined ||
      value === '' ||
      value === '<br>' ||
      value === '<p></p>\n' ||
      isSubmittingNormalComment ||
      isSubmittingDelayedComment ||
      isUpdatingComment;
    return (
      <>
        <CKEditorRichText
          disabled={isSubmittingNormalComment || isSubmittingDelayedComment}
          inputId={inputId}
          label={
            <h4>
              <FormattedMessage {...translations.prompt} />
            </h4>
          }
          onChange={(nextValue) => this.onChange(nextValue)}
          value={value}
        />
        <Button
          color="primary"
          disabled={disableCommentButton}
          onClick={() => createComment(value)}
          startIcon={
            isSubmittingNormalComment ? <CircularProgress size={24} /> : null
          }
          style={{ marginRight: 10, marginBottom: 10 }}
          variant="contained"
        >
          <FormattedMessage {...translations.comment} />
        </Button>
        {renderDelayedCommentButton && (
          <span data-tooltip-id={`delayed-comment-button-${inputId}`}>
            <Button
              color="warning"
              disabled={disableCommentButton}
              onClick={() => createComment(value, true)}
              startIcon={
                isSubmittingNormalComment ? (
                  <CircularProgress size={24} />
                ) : null
              }
              style={{ marginRight: 10, marginBottom: 10 }}
              variant="contained"
            >
              <FormattedMessage {...translations.commentDelayed} />
            </Button>

            <Tooltip id={`delayed-comment-button-${inputId}`}>
              <FormattedMessage {...translations.commentDelayedDescription} />
            </Tooltip>
          </span>
        )}
      </>
    );
  }
}

CommentField.propTypes = {
  inputId: PropTypes.string,
  isSubmittingNormalComment: PropTypes.bool,
  isSubmittingDelayedComment: PropTypes.bool,
  isUpdatingComment: PropTypes.bool,
  value: PropTypes.string,
  renderDelayedCommentButton: PropTypes.bool,

  createComment: PropTypes.func,
  handleChange: PropTypes.func,
};
