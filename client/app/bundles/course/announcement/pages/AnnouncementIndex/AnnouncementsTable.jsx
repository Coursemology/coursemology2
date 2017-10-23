import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { announcementShape } from 'course/announcement/propTypes';
import AnnouncementButtonGroup from './AnnouncementButtonGroup';

const styles = {
  announcementsContainer: {
    marginTop: '20px',
  },
  icon: {
    marginRight: '4px',
  },
};


class AnnouncementsTable extends React.Component {
  static propTypes = {
    announcements: PropTypes.arrayOf(announcementShape),
    courseId: PropTypes.string.isRequired,
  };

  static renderUnreadIcon() {
    return (
      <span style={styles.icon}>
        <i className="fa fa-envelope" />
      </span>
    );
  }

  static renderStickyIcon() {
    return (
      <span style={styles.icon} title="sticky">
        <i className="fa fa-thumb-tack" />
      </span>
    );
  }

  static renderActiveIcon(message) {
    return (
      <span style={styles.icon} title={message}>
        <i className="fa fa-calendar" />
      </span>
    );
  }

  renderAnnouncementRow(announcement) {
    const { courseId } = this.props;
    let announcementClasses = 'announcement ';
    const whiteSpace = ' ';

    announcement.timePeriodClasses.map(timePeriodClass => (
        announcementClasses += timePeriodClass + whiteSpace
      ));
    announcement.unreadClasses.map(unreadClass => (
        announcementClasses += unreadClass + whiteSpace
      ));
    return (
      <div key={announcement.id} id={announcement.id} className={announcementClasses}>
        <h2 className="announcement-title">
          {announcement.unread ? AnnouncementsTable.renderUnreadIcon() : null }
          {announcement.sticky ? AnnouncementsTable.renderStickyIcon() : null }
          {announcement.currentlyActive ? null : AnnouncementsTable.renderActiveIcon(announcement.timePeriodMessage) }
          {announcement.title}
          <AnnouncementButtonGroup initialValues={{ ...announcement }} courseId={courseId} />
        </h2>
        <i className="timestamp">
          {announcement.formatedDateTime}
          {' by '}
          <a href={announcement.linkToUser}>{announcement.creator}</a>
        </i>
        <div className="content" dangerouslySetInnerHTML={{ __html: announcement.content }} />
        <hr />
      </div>
    );
  }

  render() {
    const { announcements } = this.props;
    return (
      <div style={styles.announcementsContainer}>
        {
          announcements.map(announcement => this.renderAnnouncementRow(announcement))
        }
      </div>
    );
  }
}

export default connect(state => state)(AnnouncementsTable);
