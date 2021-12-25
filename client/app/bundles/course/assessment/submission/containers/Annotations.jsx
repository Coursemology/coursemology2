import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Card, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import PropTypes from 'prop-types';

import * as annotationActions from '../actions/annotations';
import CommentCard from '../components/CommentCard';
import CommentField from '../components/CommentField';
import { workflowStates } from '../constants';
import { annotationShape, postShape } from '../propTypes';

const translations = defineMessages({
  comment: {
    id: 'course.assessment.submission.commentField.comment',
    defaultMessage: 'Add Comment',
  },
});

const styles = {
  card: {
    minWidth: 250,
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
      airMode,
      graderView,
      renderDelayedCommentButton,
    } = this.props;

    return (
      <Card style={styles.card}>
        <CardText style={{ textAlign: 'left' }}>
          {posts.map(
            (post) =>
              (graderView || !post.isDelayed) && (
                <CommentCard
                  key={post.id}
                  airMode={airMode}
                  deleteComment={() => deleteComment(post.id)}
                  editValue={commentForms.posts[post.id]}
                  handleChange={(value) => handleUpdateChange(post.id, value)}
                  post={post}
                  updateComment={(value) => updateComment(post.id, value)}
                />
              ),
          )}
          {posts.length === 0 || fieldVisible ? (
            <CommentField
              airMode={airMode}
              createComment={createComment}
              handleChange={handleCreateChange}
              isSubmittingDelayedComment={
                commentForms.isSubmittingDelayedComment
              }
              isSubmittingNormalComment={commentForms.isSubmittingNormalComment}
              isUpdatingComment={commentForms.isUpdatingComment}
              renderDelayedCommentButton={renderDelayedCommentButton}
              value={commentForms.annotations[fileId][lineNumber]}
            />
          ) : (
            <RaisedButton
              label={<FormattedMessage {...translations.comment} />}
              onClick={() => this.setState({ fieldVisible: true })}
              primary={true}
            />
          )}
        </CardText>
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
    annotations: {},
  }),
  fileId: PropTypes.number.isRequired,
  lineNumber: PropTypes.number.isRequired,
  airMode: PropTypes.bool,
  posts: PropTypes.arrayOf(postShape),
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
};

VisibleAnnotations.defaultProps = {
  airMode: true,
};

function mapStateToProps(state, ownProps) {
  const { annotation } = ownProps;
  const renderDelayedCommentButton =
    state.submission.graderView &&
    !state.assessment.autograded &&
    (state.submission.workflowState === workflowStates.Submitted ||
      state.submission.workflowState === workflowStates.Graded);
  if (!annotation) {
    return {
      commentForms: state.commentForms,
      posts: [],
      graderView: state.submission.graderView,
      renderDelayedCommentButton,
    };
  }
  return {
    commentForms: state.commentForms,
    posts: annotation.postIds.map((postId) => state.posts[postId]),
    graderView: state.submission.graderView,
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
        ),
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
      ),
    updateComment: (postId, comment) =>
      dispatch(annotationActions.update(annotation.id, postId, comment)),
    deleteComment: (postId) =>
      dispatch(annotationActions.destroy(fileId, annotation.id, postId)),
  };
}

const Annotations = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(VisibleAnnotations),
);
export default Annotations;
