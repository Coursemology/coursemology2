import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import Moment from 'lib/moment';
import { showAnnouncementForm, createAnnouncement } from 'course/announcement/actions/announcements';
import AddButton from 'course/announcement/components/AddButton';

const translations = defineMessages({
  newAnnouncement: {
    id: 'course.announcements.NewAnnouncementButton.title',
    defaultMessage: 'New Announcement',
  },
  success: {
    id: 'course.announcements.NewAnnouncementButton.success',
    defaultMessage: 'Announcement "{title}" created.',
  },
  failure: {
    id: 'course.announcements.NewAnnouncementButton.failure',
    defaultMessage: 'Failed to create announcement.',
  },
});

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  canCreate: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};


class NewAnnouncementButton extends React.Component {
  createAnnouncementHandler = (data) => {
    const { dispatch, intl } = this.props;

    const successMessage = intl.formatMessage(translations.success, data);
    const failureMessage = intl.formatMessage(translations.failure);
    return dispatch(createAnnouncement(data, successMessage, failureMessage));
  }

  showNewAnnouncementForm = () => {
    const { dispatch, intl } = this.props;

    const initialValues = {
      published: false,
      sticky: false,
      start_at: new Moment().format(),
      end_at: new Moment().add(7, 'days').format(),
    };

    return dispatch(showAnnouncementForm({
      onSubmit: this.createAnnouncementHandler,
      formTitle: intl.formatMessage(translations.newAnnouncement),
      initialValues: Object.assign(initialValues),
    }));
  }

  render() {
    const { canCreate } = this.props;
    return canCreate ? <AddButton onTouchTap={this.showNewAnnouncementForm} /> : <div />;
  }
}

NewAnnouncementButton.propTypes = propTypes;

export default connect(state => state.announcementsFlags)(injectIntl(NewAnnouncementButton));
