import { Component } from 'react';
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
import {
  red100,
  yellow100,
  grey100,
  green100,
  blue100,
  blue500,
} from 'material-ui/styles/colors';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';
import {
  fetchSubmissions,
  publishSubmissions,
  downloadSubmissions,
  downloadStatistics,
  unsubmitAllSubmissions,
  deleteAllSubmissions,
} from '../../actions/submissions';
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

class VisibleSubmissionsIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publishConfirmation: false,
      includePhantoms: false,
      tab: 'my-students-tab',
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchSubmissions());
  }

  componentDidUpdate(_prevProps, prevState) {
    if (
      prevState.tab === 'my-students-tab' &&
      this.props.submissions.every((s) => !s.courseUser.myStudent)
    ) {
      // This is safe since there will not be infinite re-renderings caused.
      // Follows the guidelines as recommended on React's website.
      // https://reactjs.org/docs/react-component.html#componentdidupdate
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ tab: 'students-tab' });
    }
  }

  canPublish() {
    const { submissions } = this.props;
    return submissions.some((s) => s.workflowState === workflowStates.Graded);
  }

  renderHeader() {
    const {
      assessment: { title },
      isPublishing,
    } = this.props;
    const { includePhantoms } = this.state;
    return (
      <Card style={{ marginBottom: 20 }}>
        <CardHeader title={<h3>{title}</h3>} subtitle="Submissions" />
        <CardText style={{ paddingTop: 0 }}>{this.renderHistogram()}</CardText>
        <CardActions>
          <Toggle
            className="toggle-phantom"
            label={
              <FormattedMessage {...submissionsTranslations.includePhantoms} />
            }
            labelPosition="right"
            toggled={includePhantoms}
            onToggle={() =>
              this.setState({ includePhantoms: !includePhantoms })
            }
          />
          <FlatButton
            disabled={isPublishing || !this.canPublish()}
            secondary
            label={
              <FormattedMessage {...submissionsTranslations.publishGrades} />
            }
            labelPosition="before"
            icon={isPublishing ? <CircularProgress size={24} /> : null}
            onClick={() => this.setState({ publishConfirmation: true })}
          />
        </CardActions>
      </Card>
    );
  }

  renderHistogram() {
    const { submissions } = this.props;
    const { includePhantoms, tab } = this.state;
    const workflowStatesArray = Object.values(workflowStates);
    const myStudentSubmissions = submissions.filter(
      (s) => s.courseUser.isStudent && s.courseUser.myStudent,
    );
    const studentSubmissions = submissions.filter(
      (s) => s.courseUser.isStudent,
    );
    const staffSubmissions = submissions.filter((s) => !s.courseUser.isStudent);
    let submissionHistogram;
    switch (tab) {
      case 'staff-tab':
        submissionHistogram = staffSubmissions;
        break;
      case 'my-students-tab':
        submissionHistogram = myStudentSubmissions;
        break;
      case 'students-tab':
      default:
        submissionHistogram = studentSubmissions;
    }
    const initialCounts = workflowStatesArray.reduce(
      (counts, w) => ({ ...counts, [w]: 0 }),
      {},
    );
    const submissionStateCounts = submissionHistogram.reduce(
      (counts, submission) => {
        if (includePhantoms || !submission.courseUser.phantom) {
          return {
            ...counts,
            [submission.workflowState]: counts[submission.workflowState] + 1,
          };
        }
        return counts;
      },
      initialCounts,
    );

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

  renderTabs() {
    const { courseId, assessmentId } = this.props.match.params;
    const {
      dispatch,
      submissions,
      assessment,
      isDownloading,
      isStatisticsDownloading,
      isUnsubmitting,
      isDeleting,
    } = this.props;
    const { includePhantoms } = this.state;
    const myStudentSubmissions = includePhantoms
      ? submissions.filter(
          (s) => s.courseUser.isStudent && s.courseUser.myStudent,
        )
      : submissions.filter(
          (s) =>
            s.courseUser.isStudent &&
            s.courseUser.myStudent &&
            !s.courseUser.phantom,
        );
    const studentSubmissions = includePhantoms
      ? submissions.filter((s) => s.courseUser.isStudent)
      : submissions.filter(
          (s) => s.courseUser.isStudent && !s.courseUser.phantom,
        );
    const staffSubmissions = includePhantoms
      ? submissions.filter((s) => !s.courseUser.isStudent)
      : submissions.filter(
          (s) => !s.courseUser.isStudent && !s.courseUser.phantom,
        );

    const handleMyStudentsParams = includePhantoms
      ? 'my_students_w_phantom'
      : 'my_students';
    const handleStudentsParams = includePhantoms
      ? 'students_w_phantom'
      : 'students';
    const handleStaffsParams = includePhantoms ? 'staff_w_phantom' : 'staff';

    const props = {
      dispatch,
      courseId,
      assessmentId,
      assessment,
      isDownloading,
      isStatisticsDownloading,
      isUnsubmitting,
      isDeleting,
    };
    return (
      <Tabs
        inkBarStyle={{ backgroundColor: blue500, height: 5, marginTop: -5 }}
        tabItemContainerStyle={{ backgroundColor: grey100 }}
      >
        {myStudentSubmissions.length > 0 ? (
          <Tab
            id="my-students-tab"
            buttonStyle={{ color: blue500 }}
            icon={<GroupIcon style={{ color: blue500 }} />}
            label={<FormattedMessage {...submissionsTranslations.myStudents} />}
            onActive={() => this.setState({ tab: 'my-students-tab' })}
          >
            <SubmissionsTable
              submissions={myStudentSubmissions}
              handleDownload={() =>
                dispatch(downloadSubmissions(handleMyStudentsParams))
              }
              handleDownloadStatistics={() =>
                dispatch(downloadStatistics(handleMyStudentsParams))
              }
              handleUnsubmitAll={() =>
                dispatch(unsubmitAllSubmissions(handleMyStudentsParams))
              }
              handleDeleteAll={() =>
                dispatch(deleteAllSubmissions(handleMyStudentsParams))
              }
              confirmDialogValue="your students"
              {...props}
            />
          </Tab>
        ) : null}
        <Tab
          id="students-tab"
          buttonStyle={{ color: blue500 }}
          icon={<PersonIcon style={{ color: blue500 }} />}
          label={<FormattedMessage {...submissionsTranslations.students} />}
          onActive={() => this.setState({ tab: 'students-tab' })}
        >
          <SubmissionsTable
            submissions={studentSubmissions}
            handleDownload={() =>
              dispatch(downloadSubmissions(handleStudentsParams))
            }
            handleDownloadStatistics={() =>
              dispatch(downloadStatistics(handleStudentsParams))
            }
            handleUnsubmitAll={() =>
              dispatch(unsubmitAllSubmissions(handleStudentsParams))
            }
            handleDeleteAll={() =>
              dispatch(deleteAllSubmissions(handleStudentsParams))
            }
            confirmDialogValue="students"
            {...props}
          />
        </Tab>
        <Tab
          id="staff-tab"
          buttonStyle={{ color: blue500 }}
          icon={<PersonOutlineIcon style={{ color: blue500 }} />}
          label={<FormattedMessage {...submissionsTranslations.staff} />}
          onActive={() => this.setState({ tab: 'staff-tab' })}
        >
          <SubmissionsTable
            submissions={staffSubmissions}
            handleDownload={() =>
              dispatch(downloadSubmissions(handleStaffsParams))
            }
            handleDownloadStatistics={() =>
              dispatch(downloadStatistics(handleStaffsParams))
            }
            handleUnsubmitAll={() =>
              dispatch(unsubmitAllSubmissions(handleStaffsParams))
            }
            handleDeleteAll={() =>
              dispatch(deleteAllSubmissions(handleStaffsParams))
            }
            confirmDialogValue="staff"
            {...props}
          />
        </Tab>
      </Tabs>
    );
  }

  render() {
    const { isLoading, notification } = this.props;
    if (isLoading) {
      return <LoadingIndicator />;
    }
    return (
      <>
        {this.renderHeader()}
        {this.renderTabs()}
        {this.renderPublishConfirmation()}
        <NotificationBar notification={notification} />
      </>
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
      grade: PropTypes.number,
      pointsAwarded: PropTypes.number,
      workflowState: PropTypes.string,
    }),
  ),
  notification: notificationShape,
  isLoading: PropTypes.bool.isRequired,
  isDownloading: PropTypes.bool.isRequired,
  isStatisticsDownloading: PropTypes.bool.isRequired,
  isPublishing: PropTypes.bool.isRequired,
  isUnsubmitting: PropTypes.bool.isRequired,
  isDeleting: PropTypes.bool.isRequired,
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
    isUnsubmitting: state.submissionFlags.isUnsubmitting,
    isDeleting: state.submissionFlags.isDeleting,
  };
}

const SubmissionsIndex = connect(mapStateToProps)(VisibleSubmissionsIndex);
export default SubmissionsIndex;
