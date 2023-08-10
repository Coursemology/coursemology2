import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { grey } from '@mui/material/colors';
import PropTypes from 'prop-types';

import toast from 'lib/hooks/toast';

import * as commentActions from '../actions/comments';
import CommentCard from '../components/comment/CommentCard';
import CommentField from '../components/comment/CommentField';
import { workflowStates } from '../constants';
import { postShape, topicShape } from '../propTypes';
import translations from '../translations';

class VisibleComments extends Component {
  static newCommentIdentifier(field) {
    return `topic_${field}`;
  }

  render() {
    const {
      commentForms,
      posts,
      topic,
      handleCreateChange,
      handleUpdateChange,
      createComment,
      updateComment,
      deleteComment,
      graderView,
      renderDelayedCommentButton,
    } = this.props;

    return (
      <div>
        <h4 style={{ color: grey['600'] }}>
          <FormattedMessage {...translations.comments} />
        </h4>
        {posts.map(
          (post) =>
            (graderView || !post.isDelayed) && (
              <CommentCard
                key={post.id}
                deleteComment={() => deleteComment(post.id)}
                editValue={commentForms.posts[post.id]}
                handleChange={(value) => handleUpdateChange(post.id, value)}
                post={post}
                updateComment={(value) => updateComment(post.id, value)}
              />
            ),
        )}
        <CommentField
          createComment={createComment}
          handleChange={handleCreateChange}
          inputId={VisibleComments.newCommentIdentifier(topic.id)}
          isSubmittingDelayedComment={commentForms.isSubmittingDelayedComment}
          isSubmittingNormalComment={commentForms.isSubmittingNormalComment}
          isUpdatingComment={commentForms.isUpdatingComment}
          renderDelayedCommentButton={renderDelayedCommentButton}
          value={commentForms.topics[topic.id]}
        />
      </div>
    );
  }
}

VisibleComments.propTypes = {
  commentForms: PropTypes.shape({
    topics: PropTypes.objectOf(PropTypes.string),
    posts: PropTypes.objectOf(PropTypes.string),
    isSubmittingNormalComment: PropTypes.bool,
    isSubmittingDelayedComment: PropTypes.bool,
    isUpdatingComment: PropTypes.bool,
  }),
  posts: PropTypes.arrayOf(postShape),
  topic: topicShape,
  graderView: PropTypes.bool.isRequired,
  renderDelayedCommentButton: PropTypes.bool,

  handleCreateChange: PropTypes.func.isRequired,
  handleUpdateChange: PropTypes.func.isRequired,
  createComment: PropTypes.func.isRequired,
  updateComment: PropTypes.func.isRequired,
  deleteComment: PropTypes.func.isRequired,
};

function mapStateToProps({ assessments: { submission } }, ownProps) {
  const { topic } = ownProps;
  const renderDelayedCommentButton =
    submission.submission.graderView &&
    !submission.assessment.autograded &&
    (submission.submission.workflowState === workflowStates.Submitted ||
      submission.submission.workflowState === workflowStates.Graded);
  return {
    commentForms: submission.commentForms,
    posts: submission.topics[topic.id].postIds.map(
      (postId) => submission.posts[postId],
    ),
    graderView: submission.submission.graderView,
    renderDelayedCommentButton,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const { topic } = ownProps;

  return {
    handleCreateChange: (comment) =>
      dispatch(commentActions.onCreateChange(topic.id, comment)),
    handleUpdateChange: (postId, comment) =>
      dispatch(commentActions.onUpdateChange(postId, comment)),
    createComment: (comment, isDelayedComment = false) =>
      dispatch(
        commentActions.create(
          topic.submissionQuestionId,
          comment,
          isDelayedComment,
        ),
      )
        .then(() => toast.success('Successfully created comment.'))
        .catch(() => toast.error('Failed to create comment.')),
    updateComment: (postId, comment) =>
      dispatch(commentActions.update(topic.id, postId, comment)),
    deleteComment: (postId) =>
      dispatch(commentActions.destroy(topic.id, postId)),
  };
}

const Comments = connect(mapStateToProps, mapDispatchToProps)(VisibleComments);
export default Comments;
