import { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Tooltip } from 'react-tooltip';
import { Send } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';

import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';

const translations = defineMessages({
  prompt: {
    id: 'course.assessment.submission.comment.CommentField.prompt',
    defaultMessage: 'Add a new comment here...',
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

class CommentField extends Component {
  onChange(nextValue) {
    const { handleChange } = this.props;
    handleChange(nextValue);
  }

  render() {
    const {
      intl,
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
          onChange={(nextValue) => this.onChange(nextValue)}
          placeholder={intl.formatMessage(translations.prompt)}
          value={value}
        />

        <div>
          <LoadingButton
            color="primary"
            disabled={disableCommentButton}
            endIcon={<Send />}
            loading={isSubmittingNormalComment}
            onClick={() => createComment(value)}
            style={{ marginRight: 10, marginBottom: 10 }}
            variant="contained"
          >
            {intl.formatMessage(translations.comment)}
          </LoadingButton>

          {renderDelayedCommentButton && (
            <span data-tooltip-id={`delayed-comment-button-${inputId}`}>
              <LoadingButton
                color="warning"
                disabled={disableCommentButton}
                loading={isSubmittingDelayedComment}
                onClick={() => createComment(value, true)}
                style={{ marginRight: 10, marginBottom: 10 }}
                variant="contained"
              >
                {intl.formatMessage(translations.commentDelayed)}
              </LoadingButton>

              <Tooltip id={`delayed-comment-button-${inputId}`}>
                <Typography variant="subtitle2">
                  {intl.formatMessage(translations.commentDelayedDescription)}
                </Typography>
              </Tooltip>
            </span>
          )}
        </div>
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

  intl: PropTypes.object.isRequired,
};

export default injectIntl(CommentField);
