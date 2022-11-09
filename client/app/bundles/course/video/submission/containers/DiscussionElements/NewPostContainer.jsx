import { connect } from 'react-redux';

import { postRequestingStatuses } from 'lib/constants/videoConstants';

import { submitNewPostToServer, updateNewPost } from '../../actions/discussion';

import Editor from './Editor';

function mapStateToProps(state, ownProps) {
  const newTopicPost = state.discussion.newTopicPost;
  return {
    content: newTopicPost.content,
    disabled: newTopicPost.status === postRequestingStatuses.LOADING,
    showCancel: false,
    children: ownProps.children,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onSubmit: () => dispatch(submitNewPostToServer()),
    onContentUpdate: (content) => dispatch(updateNewPost({ content })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
