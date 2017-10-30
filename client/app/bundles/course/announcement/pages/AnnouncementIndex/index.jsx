import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import ReactPaginate from 'react-paginate';
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
    totalPageCount: PropTypes.number,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchAnnouncements());
  }

  handlePageClick = (data) => {
    const { dispatch } = this.props;
    dispatch(fetchAnnouncements(data.selected + 1));
  };

  renderBody() {
    const { announcements, isLoading, match: { params: { courseId } } } = this.props;
    if (isLoading) { return <LoadingIndicator />; }
    if (announcements.length < 1) {
      return <Subheader><FormattedMessage {...translations.noAnnouncements} /></Subheader>;
    }
    return <AnnouncementsTable {...{ courseId }} />;
  }

  render() {
    const { match: { params: { courseId } }, totalPageCount } = this.props;
    return (
      <div>
        <TitleBar
          style={styles.announcementsTitle}
          titleStyle={styles.announcementText}
          title={<FormattedMessage {...announcementTranslations.announcements} />}
          iconElementRight={<NewAnnouncementButton courseId={courseId} />}
        />
        { this.renderBody() }
        <ReactPaginate
          previousLabel={'previous'}
          nextLabel={'next'}
          breakLabel={<a href="">...</a>}
          breakClassName={'break-me'}
          pageCount={totalPageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={this.handlePageClick}
          containerClassName={'pagination'}
          subContainerClassName={'pages pagination'}
          activeClassName={'active'}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  announcements: state.announcements,
  totalPageCount: state.announcementsFlags.totalPageCount,
  isLoading: state.announcementsFlags.isLoadingAnnouncements,
});

export default connect(mapStateToProps)(AnnouncementIndex);
