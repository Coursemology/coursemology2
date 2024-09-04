import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Card, CardContent } from '@mui/material';
import PropTypes from 'prop-types';

import withRouter from 'lib/components/navigation/withRouter';
import toast from 'lib/hooks/toast';

import * as annotationActions from '../actions/annotations';
import CodaveriCommentCard from '../components/comment/CodaveriCommentCard';
import CommentCard from '../components/comment/CommentCard';
import CommentField from '../components/comment/CommentField';
import { workflowStates } from '../constants';
import { annotationShape, postShape } from '../propTypes';

const translations = defineMessages({
  comment: {
    id: 'course.assessment.submission.Annotations.comment',
    defaultMessage: 'Add Comment',
  },
});

const styles = {
  card: {
    minWidth: 250,
    border: '0.2px solid #e3e3e3',
  },
};

class VisibleAnnotations extends Component {
  constructor(props) {
    super(props);
    this.state = { fieldVisible: false };
  }

  render() {
    const { fieldVisible } = this.state;
    const {
      fileId,
      lineNumber,
      commentForms,
      posts,
      createComment,
      updateComment,
      deleteComment,
      handleCreateChange,
      handleUpdateChange,
      graderView,
      renderDelayedCommentButton,
      updateCodaveriFeedback,
      isUpdatingAnnotationAllowed,
    } = this.props;

    const shouldRenderCommentButton =
      !posts[posts.length - 1]?.codaveriFeedback;

    const renderCommentField = () => {
      if (posts.length === 0 || fieldVisible)
        return (
          <CommentField
            createComment={createComment}
            handleChange={handleCreateChange}
            isSubmittingDelayedComment={commentForms.isSubmittingDelayedComment}
            isSubmittingNormalComment={commentForms.isSubmittingNormalComment}
            isUpdatingComment={commentForms.isUpdatingComment}
            renderDelayedCommentButton={renderDelayedCommentButton}
            value={commentForms.annotations[fileId][lineNumber]}
          />
        );
      return (
        <Button
          color="primary"
          onClick={() => this.setState({ fieldVisible: true })}
          variant="contained"
        >
          <FormattedMessage {...translations.comment} />
        </Button>
      );
    };
    return (
      <Card style={styles.card}>
        <CardContent style={{ textAlign: 'left' }}>
          {posts.map((post) => {
            if (
              post.codaveriFeedback &&
              post.codaveriFeedback.status === 'pending_review'
            ) {
              return (
                <CodaveriCommentCard
                  key={post.id}
                  deleteComment={(rating) => deleteComment(post.id, rating)}
                  editValue={commentForms.posts[post.id]}
                  handleChange={(value) => handleUpdateChange(post.id, value)}
                  post={post}
                  updateComment={updateCodaveriFeedback}
                />
              );
            }
            if (graderView || !post.isDelayed) {
              return (
                <CommentCard
                  key={post.id}
                  deleteComment={() => deleteComment(post.id)}
                  editValue={commentForms.posts[post.id]}
                  handleChange={(value) => handleUpdateChange(post.id, value)}
                  isUpdatingAnnotationAllowed={isUpdatingAnnotationAllowed}
                  post={post}
                  updateComment={(value) => updateComment(post.id, value)}
                />
              );
            }
            return null;
          })}
          {shouldRenderCommentButton &&
            isUpdatingAnnotationAllowed &&
            renderCommentField()}
        </CardContent>
      </Card>
    );
  }
}

VisibleAnnotations.propTypes = {
  commentForms: PropTypes.shape({
    topics: PropTypes.objectOf(PropTypes.string),
    posts: PropTypes.objectOf(PropTypes.string),
    isSubmittingNormalComment: PropTypes.bool,
    isSubmittingDelayedComment: PropTypes.bool,
    isUpdatingComment: PropTypes.bool,
    annotations: PropTypes.object,
  }),
  fileId: PropTypes.number.isRequired,
  lineNumber: PropTypes.number.isRequired,
  posts: PropTypes.arrayOf(postShape),
  isUpdatingAnnotationAllowed: PropTypes.bool,

  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string,
      assessmentId: PropTypes.string,
      submissionId: PropTypes.string,
    }),
  }),
  annotation: annotationShape,
  answerId: PropTypes.number.isRequired,
  graderView: PropTypes.bool.isRequired,
  renderDelayedCommentButton: PropTypes.bool,

  handleCreateChange: PropTypes.func.isRequired,
  handleUpdateChange: PropTypes.func.isRequired,
  createComment: PropTypes.func.isRequired,
  updateComment: PropTypes.func.isRequired,
  deleteComment: PropTypes.func.isRequired,
  updateCodaveriFeedback: PropTypes.func.isRequired,
};

function mapStateToProps({ assessments: { submission } }, ownProps) {
  const { annotation } = ownProps;
  const renderDelayedCommentButton =
    submission.submission.graderView &&
    !submission.assessment.autograded &&
    (submission.submission.workflowState === workflowStates.Submitted ||
      submission.submission.workflowState === workflowStates.Graded);
  if (!annotation) {
    return {
      commentForms: submission.commentForms,
      posts: [],
      graderView: submission.submission.graderView,
      renderDelayedCommentButton,
    };
  }
  return {
    commentForms: submission.commentForms,
    posts: annotation.postIds.map((postId) => submission.posts[postId]),
    graderView: submission.submission.graderView,
    renderDelayedCommentButton,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const {
    match: {
      params: { submissionId },
    },
    answerId,
    fileId,
    lineNumber,
    annotation,
  } = ownProps;

  if (!annotation) {
    return {
      handleCreateChange: (comment) =>
        dispatch(annotationActions.onCreateChange(fileId, lineNumber, comment)),
      handleUpdateChange: (postId, comment) =>
        dispatch(annotationActions.onUpdateChange(postId, comment)),
      createComment: (comment, isDelayedComment = false) =>
        dispatch(
          annotationActions.create(
            submissionId,
            answerId,
            fileId,
            lineNumber,
            comment,
            isDelayedComment,
          ),
        )
          .then(() => toast.success('Successfully created comment.'))
          .catch(() => toast.error('Failed to create comment.')),
      updateComment: () => {},
      deleteComment: () => {},
    };
  }
  return {
    handleCreateChange: (comment) =>
      dispatch(annotationActions.onCreateChange(fileId, lineNumber, comment)),
    handleUpdateChange: (postId, comment) =>
      dispatch(annotationActions.onUpdateChange(postId, comment)),
    createComment: (comment, isDelayedComment = false) =>
      dispatch(
        annotationActions.create(
          submissionId,
          answerId,
          fileId,
          lineNumber,
          comment,
          isDelayedComment,
        ),
      )
        .then(() => toast.success('Successfully created comment.'))
        .catch(() => toast.error('Failed to create comment.')),
    updateComment: (postId, comment) =>
      dispatch(annotationActions.update(annotation.id, postId, comment)),
    deleteComment: (postId, codaveriRating) =>
      dispatch(
        annotationActions.destroy(
          fileId,
          annotation.id,
          postId,
          codaveriRating,
        ),
      ),
    updateCodaveriFeedback: (postId, codaveriId, comment, rating, status) =>
      dispatch(
        annotationActions.updateCodaveri(
          fileId,
          annotation.id,
          postId,
          codaveriId,
          comment,
          rating,
          status,
        ),
      ),
  };
}

const Annotations = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(VisibleAnnotations),
);
export default Annotations;
