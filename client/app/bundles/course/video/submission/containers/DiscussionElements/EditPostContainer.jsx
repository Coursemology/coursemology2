import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { postRequestingStatuses } from 'lib/constants/videoConstants';

import Editor from './Editor';
import { updatePost, updatePostOnServer } from '../../actions/discussion';

const translations = defineMessages({
  edit: {
    id: 'course.video.DiscussionElements.EditPostContainer.edit',
    defaultMessage: 'Edit',
  },
});

const propTypes = {
  postId: PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
  const postObject = state.discussion.posts.get(ownProps.postId);
  return {
    content: postObject.editedContent || postObject.content,
    disabled: postObject.status === postRequestingStatuses.LOADING,
    submitButtonText: (<FormattedMessage {...translations.edit} />),
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onSubmit: () => dispatch(updatePostOnServer(ownProps.postId)),
    onCancel: () => dispatch(updatePost(ownProps.postId, { editMode: false })),
    onContentUpdate: editedContent => dispatch(updatePost(ownProps.postId, { editedContent })),
  };
}

const EditPostContainer = connect(mapStateToProps, mapDispatchToProps)(Editor);

EditPostContainer.propTypes = propTypes;

export default EditPostContainer;
