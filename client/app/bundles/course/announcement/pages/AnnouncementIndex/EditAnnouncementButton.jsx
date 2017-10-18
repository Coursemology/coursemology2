import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { showAnnouncementForm, updateAnnouncement } from 'course/announcement/actions/announcements';
import EditButton from 'course/announcement/components/EditButton';


const translations = defineMessages({
  editAnnouncement: {
    id: 'course.announcements.EditAnnouncementButton.title',
    defaultMessage: 'Edit Announcement',
  },
  success: {
    id: 'course.announcements.EditAnnouncementButton.success',
    defaultMessage: 'Announcement "{title}" Updated.',
  },
  failure: {
    id: 'course.announcements.EditAnnouncementButton.failure',
    defaultMessage: 'Failed to update announcement.',
  },
});

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  initialValues: PropTypes.shape({
    title: PropTypes.string,
    content: PropTypes.string,
    sticky: PropTypes.bool,
    start_at: PropTypes.string,
    end_at: PropTypes.string,
    id: PropTypes.number,
    canEdit: PropTypes.bool,
  }).isRequired,
};


class EditAnnouncementButton extends React.Component {
  updateAnnouncementHandler = (data) => {
    const { dispatch, intl } = this.props;

    const successMessage = intl.formatMessage(translations.success, data);
    const failureMessage = intl.formatMessage(translations.failure);
    return dispatch(updateAnnouncement(data.id, data, successMessage, failureMessage));
  }

  showEditAnnouncementForm = () => {
    const { dispatch, intl, initialValues } = this.props;
    return dispatch(showAnnouncementForm({
      onSubmit: this.updateAnnouncementHandler,
      formTitle: intl.formatMessage(translations.editAnnouncement),
      initialValues: Object.assign(initialValues),
    }));
  }

  render() {
    const { initialValues } = this.props;

    return initialValues.canEdit ? <EditButton onClick={this.showEditAnnouncementForm} /> : <div />;
  }
}

EditAnnouncementButton.propTypes = propTypes;

export default connect(state => state.announcementsFlags)(injectIntl(EditAnnouncementButton));
