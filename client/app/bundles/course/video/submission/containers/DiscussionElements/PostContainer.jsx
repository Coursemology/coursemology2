import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import PostPresentation from './PostPresentation';

const propTypes = {
  postId: PropTypes.string.isRequired,
  isRoot: PropTypes.bool,
};

const defaultProps = {
  isRoot: false,
};

function mapStateToProps(state, ownProps) {
  const postsStore = state.discussion.posts;
  const post = postsStore.get(ownProps.postId);
  const children = post.childrenIds.filter(postId => postsStore.has(postId));

  return {
    postId: ownProps.postId,
    userPicElement: post.userPicElement,
    userLink: post.userLink,
    createdAt: post.createdAt,
    content: post.content,
    childrenIds: children,
    editMode: post.editMode,
    isRoot: ownProps.isRoot,
  };
}

const PostContainer = connect(mapStateToProps)(PostPresentation);

PostContainer.propTypes = propTypes;
PostContainer.defaultProps = defaultProps;

export default PostContainer;
