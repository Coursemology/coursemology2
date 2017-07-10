import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { PostProp, TopicProp } from '../propTypes';
import CommentCard from '../components/CommentCard';
import CommentField from '../components/CommentField';
import * as commentActions from '../actions/comments';

class VisibleComments extends Component {
  render() {
    const {
      commentForms, posts, topic,
      handleCreateChange, handleUpdateChange,
      createComment, updateComment, deleteComment,
    } = this.props;

    return (
      <div>
        <h3>Comments</h3>
        {posts.map(post =>
          <CommentCard
            key={post.id}
            id={post.id}
            name={post.creator.name}
            avatar={post.creator.avatar}
            date={post.createdAt}
            content={post.text}
            editValue={commentForms.posts[post.id]}
            updateComment={value => updateComment(post.id, value)}
            deleteComment={() => deleteComment(post.id)}
            handleChange={value => handleUpdateChange(post.id, value)}
          />
        )}
        <CommentField
          value={commentForms.topics[topic.id]}
          createComment={createComment}
          handleChange={handleCreateChange}
        />
      </div>
    );
  }
}

VisibleComments.propTypes = {
  commentForms: PropTypes.shape({
    topics: PropTypes.objectOf(PropTypes.string),
    posts: PropTypes.objectOf(PropTypes.string),
  }),
  posts: PropTypes.arrayOf(PostProp),
  topic: TopicProp,

  handleCreateChange: PropTypes.func.isRequired,
  handleUpdateChange: PropTypes.func.isRequired,
  createComment: PropTypes.func.isRequired,
  updateComment: PropTypes.func.isRequired,
  deleteComment: PropTypes.func.isRequired,
};

function mapStateToProps(state, ownProps) {
  const { topic } = ownProps;
  return {
    commentForms: state.commentForms,
    posts: state.topics[topic.id].postIds.map(postId => state.posts[postId]),
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const { topic } = ownProps;

  return {
    handleCreateChange: comment => dispatch(commentActions.onCreateChange(topic.id, comment)),
    handleUpdateChange: (postId, comment) => dispatch(commentActions.onUpdateChange(postId, comment)),
    createComment: comment => dispatch(commentActions.create(topic.submissionQuestionId, comment)),
    updateComment: (postId, comment) => dispatch(commentActions.update(topic.id, postId, comment)),
    deleteComment: postId => dispatch(commentActions.destroy(topic.id, postId)),
  };
}

const Comments = connect(
  mapStateToProps,
  mapDispatchToProps
)(VisibleComments);
export default Comments;
