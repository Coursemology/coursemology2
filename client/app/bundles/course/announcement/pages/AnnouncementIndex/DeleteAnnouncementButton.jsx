import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { deleteAnnouncement } from 'course/announcement/actions/announcements';
import DeleteButton from 'course/announcement/components/DeleteButton';
import { showDeleteConfirmation } from 'course/announcement/actions/index';


const translations = defineMessages({
  deleteAnnouncement: {
    id: 'course.announcements.DeleteAnnouncementButton.title',
    defaultMessage: 'Delete Announcement',
  },
  success: {
    id: 'course.announcements.DeleteAnnouncementButton.success',
    defaultMessage: 'Announcement "{title}" Deleted.',
  },
  failure: {
    id: 'course.announcements.DeleteAnnouncementButton.failure',
    defaultMessage: 'Failed to delete announcement.',
  },
});

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  initialValues: PropTypes.shape({
    id: PropTypes.number,
    canDelete: PropTypes.bool,
  }).isRequired,
};


class DeleteAnnouncementButton extends React.Component {
  deleteAnnouncementHandler = () => {
    const { initialValues, dispatch, intl } = this.props;

    const successMessage = intl.formatMessage(translations.success, initialValues);
    const failureMessage = intl.formatMessage(translations.failure);
    const handleDelete = () => (
      dispatch(deleteAnnouncement(initialValues.id, successMessage, failureMessage))
    );
    return dispatch(showDeleteConfirmation(handleDelete));
  }

  render() {
    const { initialValues } = this.props;

    return initialValues.canDelete ? <DeleteButton onClick={this.deleteAnnouncementHandler} /> : <div />;
  }
}

DeleteAnnouncementButton.propTypes = propTypes;

export default connect(state => state.announcementsFlags)(injectIntl(DeleteAnnouncementButton));
