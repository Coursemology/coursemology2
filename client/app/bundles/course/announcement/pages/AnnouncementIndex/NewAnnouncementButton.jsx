import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

const propTypes = {
  canCreate: PropTypes.bool.isRequired,
  courseId: PropTypes.string,
};


class NewAnnouncementButton extends React.Component {
  renderNewButton() {
    const { courseId } = this.props;
    const courses = '/courses/';
    const newAnnouncement = '/announcements/new';
    const newLink = courses + courseId + newAnnouncement;
    return (
      <a className="btn btn-primary new" title="New Announcement" href={newLink}>
        <i className="fa fa-file" />
      </a>
    );
  }

  render() {
    const { canCreate } = this.props;
    return canCreate ? this.renderNewButton() : <div />;
  }
}

NewAnnouncementButton.propTypes = propTypes;

export default connect(state => state.announcementsFlags)(injectIntl(NewAnnouncementButton));
