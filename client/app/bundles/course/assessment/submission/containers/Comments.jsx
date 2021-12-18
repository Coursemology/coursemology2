import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { grey600 } from 'material-ui/styles/colors';

import { postShape, topicShape } from '../propTypes';
import CommentCard from '../components/CommentCard';
import CommentField from '../components/CommentField';
import * as commentActions from '../actions/comments';
import translations from '../translations';
import { workflowStates } from '../constants';

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
        <h4 style={{ color: grey600 }}>
          <FormattedMessage {...translations.comments} />
        </h4>
        {posts.map(
          (post) =>
            (graderView || !post.isDelayed) && (
              <CommentCard
                key={post.id}
                post={post}
                editValue={commentForms.posts[post.id]}
                updateComment={(value) => updateComment(post.id, value)}
                deleteComment={() => deleteComment(post.id)}
                handleChange={(value) => handleUpdateChange(post.id, value)}
              />
            ),
        )}
        <CommentField
          createComment={createComment}
          handleChange={handleCreateChange}
          inputId={VisibleComments.newCommentIdentifier(topic.id)}
          isSubmittingNormalComment={commentForms.isSubmittingNormalComment}
          isSubmittingDelayedComment={commentForms.isSubmittingDelayedComment}
          isUpdatingComment={commentForms.isUpdatingComment}
          value={commentForms.topics[topic.id]}
          airModeColor={false}
          renderDelayedCommentButton={renderDelayedCommentButton}
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

function mapStateToProps(state, ownProps) {
  const { topic } = ownProps;
  const renderDelayedCommentButton =
    state.submission.graderView &&
    !state.assessment.autograded &&
    (state.submission.workflowState === workflowStates.Submitted ||
      state.submission.workflowState === workflowStates.Graded);
  return {
    commentForms: state.commentForms,
    posts: state.topics[topic.id].postIds.map((postId) => state.posts[postId]),
    graderView: state.submission.graderView,
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
      ),
    updateComment: (postId, comment) =>
      dispatch(commentActions.update(topic.id, postId, comment)),
    deleteComment: (postId) =>
      dispatch(commentActions.destroy(topic.id, postId)),
  };
}

const Comments = connect(mapStateToProps, mapDispatchToProps)(VisibleComments);
export default Comments;
