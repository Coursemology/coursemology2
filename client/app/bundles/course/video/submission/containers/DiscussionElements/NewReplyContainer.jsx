import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { postRequestingStatuses } from 'lib/constants/videoConstants';

import { submitNewReplyToServer, updateReply } from '../../actions/discussion';

import Editor from './Editor';

const translations = defineMessages({
  reply: {
    id: 'course.video.submission.DiscussionElements.NewReplyContainer.reply',
    defaultMessage: 'Reply',
  },
});

const propTypes = {
  topicId: PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
  const pendingReplyPost = state.discussion.pendingReplyPosts.get(
    ownProps.topicId,
  );

  return {
    content: pendingReplyPost.content,
    disabled: pendingReplyPost.status === postRequestingStatuses.LOADING,
    submitButtonText: <FormattedMessage {...translations.reply} />,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onSubmit: () => dispatch(submitNewReplyToServer(ownProps.topicId)),
    onCancel: () =>
      dispatch(updateReply(ownProps.topicId, { editorVisible: false })),
    onContentUpdate: (content) =>
      dispatch(updateReply(ownProps.topicId, { content })),
  };
}

const NewPostContainer = connect(mapStateToProps, mapDispatchToProps)(Editor);

NewPostContainer.propTypes = propTypes;

export default NewPostContainer;
