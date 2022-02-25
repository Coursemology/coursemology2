import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { Button, CircularProgress } from '@material-ui/core';
import MaterialSummernote from 'lib/components/MaterialSummernote';
import ReactTooltip from 'react-tooltip';

const translations = defineMessages({
  prompt: {
    id: 'course.assessment.submission.commentField.prompt',
    defaultMessage: 'Enter your comment here',
  },
  comment: {
    id: 'course.assessment.submission.commentField.comment',
    defaultMessage: 'Comment',
  },
  commentDelayed: {
    id: 'course.assessment.submission.commentField.commentDelayed',
    defaultMessage: 'Delayed Comment',
  },
  commentDelayedDescription: {
    id: 'course.assessment.submission.commentField.commentDelayedDescription',
    defaultMessage:
      'This comment will only be visible to students after the grades for this submission are published.',
  },
});

export default class CommentField extends Component {
  onChange(nextValue) {
    const { handleChange } = this.props;
    handleChange(nextValue);
  }

  onKeyDown(e) {
    const { createComment, isSubmittingNormalComment, value } = this.props;
    if (e.ctrlKey && e.keyCode === 13 && !isSubmittingNormalComment) {
      e.preventDefault();
      createComment(value);
    }
  }

  render() {
    const {
      createComment,
      inputId,
      isSubmittingNormalComment,
      isSubmittingDelayedComment,
      isUpdatingComment,
      value,
      airMode,
      airModeColor,
      renderDelayedCommentButton,
    } = this.props;
    const disableCommentButton =
      value === undefined ||
      value === '' ||
      value === '<br>' ||
      isSubmittingNormalComment ||
      isSubmittingDelayedComment ||
      isUpdatingComment;
    return (
      <>
        <MaterialSummernote
          airMode={airMode}
          airModeColor={airModeColor}
          disabled={isSubmittingNormalComment || isSubmittingDelayedComment}
          inputId={inputId}
          label={
            <h4>
              <FormattedMessage {...translations.prompt} />
            </h4>
          }
          onChange={(nextValue) => this.onChange(nextValue)}
          onKeyDown={(e) => this.onKeyDown(e)}
          value={value}
        />
        <Button
          variant="contained"
          color="primary"
          disabled={disableCommentButton}
          onClick={() => createComment(value)}
          startIcon={
            isSubmittingNormalComment ? <CircularProgress size={24} /> : null
          }
          style={{ marginRight: 10, marginBotton: 10 }}
        >
          <FormattedMessage {...translations.comment} />
        </Button>
        {renderDelayedCommentButton && (
          <span data-tip data-for={`delayed-comment-button-${inputId}`}>
            <Button
              variant="contained"
              color="primary"
              disabled={disableCommentButton}
              onClick={() => createComment(value, true)}
              startIcon={
                isSubmittingNormalComment ? (
                  <CircularProgress size={24} />
                ) : null
              }
              style={{ marginRight: 10, marginBotton: 10 }}
            >
              <FormattedMessage {...translations.commentDelayed} />
            </Button>
            <ReactTooltip id={`delayed-comment-button-${inputId}`}>
              <FormattedMessage {...translations.commentDelayedDescription} />
            </ReactTooltip>
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
  airMode: PropTypes.bool,
  airModeColor: PropTypes.bool,
  renderDelayedCommentButton: PropTypes.bool,

  createComment: PropTypes.func,
  handleChange: PropTypes.func,
};

CommentField.defaultProps = {
  airMode: true,
};
