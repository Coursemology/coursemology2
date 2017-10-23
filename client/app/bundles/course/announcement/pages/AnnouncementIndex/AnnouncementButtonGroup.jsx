import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import DeleteAnnouncementButton from './DeleteAnnouncementButton';

const propTypes = {
  initialValues: PropTypes.shape({
    title: PropTypes.string,
    content: PropTypes.string,
    sticky: PropTypes.bool,
    start_at: PropTypes.string,
    end_at: PropTypes.string,
    id: PropTypes.number,
    canEdit: PropTypes.bool,
  }).isRequired,
  courseId: PropTypes.string,
};


class AnnouncementButtonGroup extends React.Component {
  renderEditButton() {
    const { initialValues, courseId } = this.props;
    const courses = '/courses/';
    const announcements = '/announcements/';
    const edit = '/edit';
    const editLink = courses + courseId + announcements + initialValues.id + edit;

    return (
      <a className="btn btn-default edit" title="Edit Announcement" href={editLink}>
        <i className="fa fa-edit" />
      </a>
    );
  }

  render() {
    const { initialValues } = this.props;
    return (
      <span className="pull-right">
        <div className="btn-group">
          { initialValues.canEdit ? this.renderEditButton() : null }
          <DeleteAnnouncementButton initialValues={{ ...initialValues }} />
        </div>
      </span>
    );
  }
}

AnnouncementButtonGroup.propTypes = propTypes;

export default connect(state => state.announcementsFlags)(injectIntl(AnnouncementButtonGroup));
