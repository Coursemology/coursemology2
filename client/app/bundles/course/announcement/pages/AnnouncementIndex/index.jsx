import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import TitleBar from 'lib/components/TitleBar';
import { fetchAnnouncements } from 'course/announcement/actions/announcements';
import announcementTranslations from 'course/announcement/translations';
import { announcementShape } from 'course/announcement/propTypes';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import AnnouncementsTable from './AnnouncementsTable';
import NewAnnouncementButton from './NewAnnouncementButton';

const styles = {
  announcementsTitle: {
    backgroundColor: '#ffffff',
    boxShadow: 'none',
    borderBottom: '1px solid #eeeeee',
    paddingLeft: '0px',
  },
  announcementText: {
    color: '#000000',
    fontSize: '36px',
    fontWeight: 'bold',
  },

};

const translations = defineMessages({
  noAnnouncements: {
    id: 'course.announcements.AnnouncementIndex.noAnnouncements',
    defaultMessage: 'No announcements have been created.',
  },
});

class AnnouncementIndex extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    announcements: PropTypes.arrayOf(announcementShape),
    isLoading: PropTypes.bool.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        courseId: PropTypes.string.isRequired,
      }),
    }),
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchAnnouncements());
  }

  renderBody() {
    const { announcements, isLoading, match: { params: { courseId } } } = this.props;
    if (isLoading) { return <LoadingIndicator />; }
    if (announcements.length < 1) {
      return <Subheader><FormattedMessage {...translations.noAnnouncements} /></Subheader>;
    }
    return <AnnouncementsTable {...{ courseId }} />;
  }

  render() {
    return (
      <div>
        <TitleBar
          style={styles.announcementsTitle}
          titleStyle={styles.announcementText}
          title={<FormattedMessage {...announcementTranslations.announcements} />}
          iconElementRight={<NewAnnouncementButton />}
        />
        { this.renderBody() }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  announcements: state.announcements,
  isLoading: state.announcementsFlags.isLoadingAnnouncements,
});

export default connect(mapStateToProps)(AnnouncementIndex);
