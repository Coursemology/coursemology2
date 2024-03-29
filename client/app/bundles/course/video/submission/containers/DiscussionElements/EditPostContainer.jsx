import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { postRequestingStatuses } from 'lib/constants/videoConstants';

import { updatePost, updatePostOnServer } from '../../actions/discussion';

import Editor from './Editor';

const translations = defineMessages({
  edit: {
    id: 'course.video.submission.DiscussionElements.EditPostContainer.edit',
    defaultMessage: 'Edit',
  },
});

const propTypes = {
  postId: PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
  const postObject = state.discussion.posts.get(ownProps.postId);
  return {
    content: postObject.editedContent || postObject.rawContent,
    disabled: postObject.status === postRequestingStatuses.LOADING,
    submitButtonText: <FormattedMessage {...translations.edit} />,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onSubmit: () => dispatch(updatePostOnServer(ownProps.postId)),
    onCancel: () => dispatch(updatePost(ownProps.postId, { editMode: false })),
    onContentUpdate: (editedContent) =>
      dispatch(updatePost(ownProps.postId, { editedContent })),
  };
}

const EditPostContainer = connect(mapStateToProps, mapDispatchToProps)(Editor);

EditPostContainer.propTypes = propTypes;

export default EditPostContainer;
