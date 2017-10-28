import React from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import Toggle from 'material-ui/Toggle';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';
import { Tabs, Tab } from 'material-ui/Tabs';
import GroupIcon from 'material-ui/svg-icons/social/group';
import PersonIcon from 'material-ui/svg-icons/social/person';
import PersonOutlineIcon from 'material-ui/svg-icons/social/person-outline';
import { red100, yellow100, grey100, green100, blue100, blue500 } from 'material-ui/styles/colors';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import NotificationBar, { notificationShape } from 'lib/components/NotificationBar';
import { fetchSubmissions, publishSubmissions,
  downloadSubmissions, downloadStatistics } from '../../actions/submissions';
import SubmissionsTable from './SubmissionsTable';
import { assessmentShape } from '../../propTypes';
import { workflowStates } from '../../constants';
import translations from '../../translations';
import submissionsTranslations from './translations';

const styles = {
  histogram: {
    borderRadius: 10,
    display: 'flex',
    overflow: 'hidden',
    textAlign: 'center',
  },
  histogramCells: {
    common: { transition: 'flex .5s, min-width .5s' },
    unstarted: { backgroundColor: red100 },
    attempting: { backgroundColor: yellow100 },
    submitted: { backgroundColor: grey100 },
    graded: { backgroundColor: blue100 },
    published: { backgroundColor: green100 },
  },
};

class VisibleSubmissionsIndex extends React.Component {

  state = {
    publishConfirmation: false,
    includePhantoms: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchSubmissions());
  }

  canPublish() {
    const { submissions } = this.props;
    return submissions.some(s => s.workflowState === workflowStates.Graded);
  }

  renderHistogram() {
    const { submissions } = this.props;
    const { includePhantoms } = this.state;
    const workflowStatesArray = Object.values(workflowStates);

    const initialCounts = workflowStatesArray.reduce((counts, w) => ({ ...counts, [w]: 0 }), {});

    const submissionStateCounts = submissions.reduce((counts, submission) => {
      if (includePhantoms || !submission.courseStudent.phantom) {
        return {
          ...counts,
          [submission.workflowState]: counts[submission.workflowState] + 1,
        };
      }
      return counts;
    }, initialCounts);

    return (
      <div style={styles.histogram}>
        {workflowStatesArray.map((w) => {
          const count = submissionStateCounts[w];
          const cellStyle = {
            ...styles.histogramCells.common,
            ...styles.histogramCells[w],
            flex: count,
            minWidth: count > 0 ? 50 : 0,
          };

          return (
            <div key={w} style={cellStyle} data-tip data-for={w}>
              {count > 0 ? count : null}
              <ReactTooltip id={w} effect="solid">
                <FormattedMessage {...translations[w]} />
              </ReactTooltip>
            </div>
          );
        })}
      </div>
    );
  }

  renderHeader() {
    const { assessment: { title }, isPublishing } = this.props;
    const { includePhantoms } = this.state;
    return (
      <Card style={{ marginBottom: 20 }}>
        <CardHeader title={<h3>{title}</h3>} subtitle="Submissions" />
        <CardText>{this.renderHistogram()}</CardText>
        <CardActions>
          <Toggle
            label={<FormattedMessage {...submissionsTranslations.includePhantoms} />}
            labelPosition="right"
            toggled={includePhantoms}
            onToggle={() => this.setState({ includePhantoms: !includePhantoms })}
          />
          <FlatButton
            disabled={isPublishing || !this.canPublish()}
            secondary
            label={<FormattedMessage {...submissionsTranslations.publishGrades} />}
            labelPosition="before"
            icon={isPublishing ? <CircularProgress size={24} /> : null}
            onClick={() => this.setState({ publishConfirmation: true })}
          />
        </CardActions>
      </Card>
    );
  }

  renderTabs() {
    const { courseId, assessmentId } = this.props.match.params;
    const { dispatch, submissions, assessment, isDownloading, isStatisticsDownloading } = this.props;
    const myStudentSubmissions = submissions.filter(s => s.courseStudent.myStudent);
    const studentSubmissions = submissions.filter(s => !s.courseStudent.phantom);
    const otherSubmissions = submissions.filter(s => s.courseStudent.phantom);

    const props = { courseId, assessmentId, assessment, isDownloading, isStatisticsDownloading };

    return (
      <Tabs
        inkBarStyle={{ backgroundColor: blue500, height: 5, marginTop: -5 }}
        tabItemContainerStyle={{ backgroundColor: grey100 }}
      >
        {myStudentSubmissions.length > 0 ?
          <Tab
            id="my-students-tab"
            buttonStyle={{ color: blue500 }}
            icon={<GroupIcon style={{ color: blue500 }} />}
            label={<FormattedMessage {...submissionsTranslations.myStudents} />}
          >
            <SubmissionsTable
              submissions={myStudentSubmissions}
              handleDownload={() => dispatch(downloadSubmissions('my'))}
              handleDownloadStatistics={() => dispatch(downloadStatistics('my'))}
              {...props}
            />
          </Tab>
        : null}
        <Tab
          id="students-tab"
          buttonStyle={{ color: blue500 }}
          icon={<PersonIcon style={{ color: blue500 }} />}
          label={<FormattedMessage {...submissionsTranslations.students} />}
        >
          <SubmissionsTable
            submissions={studentSubmissions}
            handleDownload={() => dispatch(downloadSubmissions())}
            handleDownloadStatistics={() => dispatch(downloadStatistics())}
            {...props}
          />
        </Tab>
        <Tab
          id="others-tab"
          buttonStyle={{ color: blue500 }}
          icon={<PersonOutlineIcon style={{ color: blue500 }} />}
          label={<FormattedMessage {...submissionsTranslations.others} />}
        >
          <SubmissionsTable
            submissions={otherSubmissions}
            handleDownload={() => dispatch(downloadSubmissions('phantom'))}
            handleDownloadStatistics={() => dispatch(downloadStatistics('phantom'))}
            {...props}
          />
        </Tab>
      </Tabs>
    );
  }

  renderPublishConfirmation() {
    const { dispatch } = this.props;
    const { publishConfirmation } = this.state;
    return (
      <ConfirmationDialog
        open={publishConfirmation}
        onCancel={() => this.setState({ publishConfirmation: false })}
        onConfirm={() => {
          dispatch(publishSubmissions());
          this.setState({ publishConfirmation: false });
        }}
        message={<FormattedMessage {...translations.publishConfirmation} />}
      />
    );
  }

  render() {
    const { isLoading, notification } = this.props;

    if (isLoading) {
      return <LoadingIndicator />;
    }

    return (
      <div>
        {this.renderHeader()}
        {this.renderTabs()}
        {this.renderPublishConfirmation()}
        <NotificationBar notification={notification} />
      </div>
    );
  }
}

VisibleSubmissionsIndex.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string,
      assessmentId: PropTypes.string,
      submissionId: PropTypes.string,
    }),
  }),
  assessment: assessmentShape.isRequired,
  submissions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      workflowState: PropTypes.string,
      grade: PropTypes.number,
      pointsAwarded: PropTypes.number,
    })
  ),
  notification: notificationShape,
  isLoading: PropTypes.bool.isRequired,
  isDownloading: PropTypes.bool.isRequired,
  isStatisticsDownloading: PropTypes.bool.isRequired,
  isPublishing: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    assessment: state.assessment,
    notification: state.notification,
    submissions: state.submissions,
    isLoading: state.submissionFlags.isLoading,
    isDownloading: state.submissionFlags.isDownloading,
    isStatisticsDownloading: state.submissionFlags.isStatisticsDownloading,
    isPublishing: state.submissionFlags.isPublishing,
  };
}

const SubmissionsIndex = connect(mapStateToProps)(VisibleSubmissionsIndex);
export default SubmissionsIndex;
