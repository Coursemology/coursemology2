import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { postRequestingStatuses } from 'lib/constants/videoConstants';

import Editor from './Editor';
import { submitNewReplyToServer, updateReply } from '../../actions/discussion';

const translations = defineMessages({
  reply: {
    id: 'course.video.DiscussionElements.NewReplyContainer.reply',
    defaultMessage: 'Reply',
  },
});

const propTypes = {
  parentId: PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
  const pendingReplyPost = state.discussion.pendingReplyPosts.get(ownProps.parentId);

  return {
    content: pendingReplyPost.content,
    disabled: pendingReplyPost.status === postRequestingStatuses.LOADING,
    submitButtonText: (<FormattedMessage {...translations.reply} />),
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onSubmit: () => dispatch(submitNewReplyToServer(ownProps.parentId)),
    onCancel: () => dispatch(updateReply(ownProps.parentId, { editorVisible: false })),
    onContentUpdate: content => dispatch(updateReply(ownProps.parentId, { content })),
  };
}

const NewPostContainer = connect(mapStateToProps, mapDispatchToProps)(Editor);

NewPostContainer.propTypes = propTypes;

export default NewPostContainer;
