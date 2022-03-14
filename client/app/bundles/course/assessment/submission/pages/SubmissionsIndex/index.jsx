import { Component } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  FormControlLabel,
  Switch,
  Tab,
  Tabs,
} from '@mui/material';
import { blue, green, grey, yellow, red } from '@mui/material/colors';
import Group from '@mui/icons-material/Group';
import Person from '@mui/icons-material/Person';
import PersonOutline from '@mui/icons-material/PersonOutline';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';
import {
  fetchSubmissions,
  publishSubmissions,
  forceSubmitSubmissions,
  downloadSubmissions,
  downloadStatistics,
  unsubmitAllSubmissions,
  deleteAllSubmissions,
  sendAssessmentReminderEmail,
} from '../../actions/submissions';
import SubmissionsTable from './SubmissionsTable';
import { assessmentShape } from '../../propTypes';
import {
  workflowStates,
  selectedUserType,
  selectedUserTypeDisplay,
} from '../../constants';
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
    unstarted: { backgroundColor: red[100] },
    attempting: { backgroundColor: yellow[100] },
    submitted: { backgroundColor: grey[100] },
    graded: { backgroundColor: blue[100] },
    published: { backgroundColor: green[100] },
  },
};

class VisibleSubmissionsIndex extends Component {
  static canForceSubmitOrRemind(shownSubmissions) {
    return shownSubmissions.some(
      (s) =>
        s.workflowState === workflowStates.Unstarted ||
        s.workflowState === workflowStates.Attempting,
    );
  }

  static canPublish(shownSubmissions) {
    return shownSubmissions.some(
      (s) => s.workflowState === workflowStates.Graded,
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      publishConfirmation: false,
      forceSubmitConfirmation: false,
      includePhantoms: false,
      remindConfirmation: false,
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

  renderForceSubmitConfirmation(shownSubmissions, handleForceSubmitParams) {
    const { dispatch, assessment } = this.props;
    const { forceSubmitConfirmation } = this.state;
    const values = {
      unattempted: shownSubmissions.filter(
        (s) => s.workflowState === workflowStates.Unstarted,
      ).length,
      attempting: shownSubmissions.filter(
        (s) => s.workflowState === workflowStates.Attempting,
      ).length,
      selectedUsers: selectedUserTypeDisplay[handleForceSubmitParams],
    };
    const message = assessment.autograded
      ? translations.forceSubmitConfirmationAutograded
      : translations.forceSubmitConfirmation;

    return (
      <ConfirmationDialog
        open={forceSubmitConfirmation}
        onCancel={() => this.setState({ forceSubmitConfirmation: false })}
        onConfirm={() => {
          dispatch(forceSubmitSubmissions(handleForceSubmitParams));
          this.setState({ forceSubmitConfirmation: false });
        }}
        message={<FormattedMessage {...message} values={values} />}
      />
    );
  }

  renderHeader(shownSubmissions) {
    const {
      assessment: { title, canPublishGrades, canForceSubmit },
      isPublishing,
      isForceSubmitting,
      isDeleting,
      isUnsubmitting,
      isReminding,
    } = this.props;
    const { includePhantoms, tab } = this.state;
    const disableButtons =
      isPublishing ||
      isForceSubmitting ||
      isDeleting ||
      isUnsubmitting ||
      isReminding;
    const showRemindButton = tab !== 'staff-tab';

    return (
      <Card style={{ marginBottom: 20 }}>
        <CardHeader title={<h3>{title}</h3>} subheader="Submissions" />
        <CardContent style={{ paddingTop: 0, paddingBottom: 0 }}>
          {this.renderHistogram(shownSubmissions)}
          <FormControlLabel
            control={
              <Switch
                checked={includePhantoms}
                className="toggle-phantom"
                color="primary"
                onChange={() =>
                  this.setState({ includePhantoms: !includePhantoms })
                }
              />
            }
            label={
              <b>
                <FormattedMessage
                  {...submissionsTranslations.includePhantoms}
                />
              </b>
            }
            labelPlacement="end"
          />
        </CardContent>
        <CardActions>
          {canPublishGrades && (
            <Button
              variant="contained"
              color="primary"
              disabled={
                disableButtons ||
                !VisibleSubmissionsIndex.canPublish(shownSubmissions)
              }
              endIcon={isPublishing && <CircularProgress size={24} />}
              onClick={() => this.setState({ publishConfirmation: true })}
            >
              <FormattedMessage {...submissionsTranslations.publishGrades} />
            </Button>
          )}
          {canForceSubmit && (
            <Button
              variant="contained"
              color="primary"
              disabled={
                disableButtons ||
                !VisibleSubmissionsIndex.canForceSubmitOrRemind(
                  shownSubmissions,
                )
              }
              endIcon={isForceSubmitting && <CircularProgress size={24} />}
              onClick={() => this.setState({ forceSubmitConfirmation: true })}
            >
              <FormattedMessage {...submissionsTranslations.forceSubmit} />
            </Button>
          )}
          {showRemindButton && (
            <Button
              variant="contained"
              color="primary"
              disabled={
                disableButtons ||
                !VisibleSubmissionsIndex.canForceSubmitOrRemind(
                  shownSubmissions,
                )
              }
              endIcon={isReminding && <CircularProgress size={24} />}
              onClick={() => this.setState({ remindConfirmation: true })}
            >
              <FormattedMessage {...submissionsTranslations.remind} />
            </Button>
          )}
        </CardActions>
      </Card>
    );
  }

  renderHistogram(submissionHistogram) {
    const { includePhantoms } = this.state;
    const workflowStatesArray = Object.values(workflowStates);

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

  renderPublishConfirmation(shownSubmissions, handlePublishParams) {
    const { dispatch } = this.props;
    const { publishConfirmation } = this.state;

    const values = {
      graded: shownSubmissions.filter(
        (s) => s.workflowState === workflowStates.Graded,
      ).length,
      selectedUsers: selectedUserTypeDisplay[handlePublishParams],
    };

    return (
      <ConfirmationDialog
        open={publishConfirmation}
        onCancel={() => this.setState({ publishConfirmation: false })}
        onConfirm={() => {
          dispatch(publishSubmissions(handlePublishParams));
          this.setState({ publishConfirmation: false });
        }}
        message={
          <FormattedMessage
            {...translations.publishConfirmation}
            values={values}
          />
        }
      />
    );
  }

  renderReminderConfirmation(shownSubmissions, handleRemindParams) {
    const { dispatch } = this.props;
    const { assessmentId } = this.props.match.params;
    const { remindConfirmation } = this.state;
    const values = {
      unattempted: shownSubmissions.filter(
        (s) => s.workflowState === workflowStates.Unstarted,
      ).length,
      attempting: shownSubmissions.filter(
        (s) => s.workflowState === workflowStates.Attempting,
      ).length,
      selectedUsers: selectedUserTypeDisplay[handleRemindParams],
    };

    return (
      <ConfirmationDialog
        open={remindConfirmation}
        onCancel={() => this.setState({ remindConfirmation: false })}
        onConfirm={() => {
          dispatch(
            sendAssessmentReminderEmail(assessmentId, handleRemindParams),
          );
          this.setState({ remindConfirmation: false });
        }}
        message={
          <FormattedMessage
            {...translations.sendReminderEmailConfirmation}
            values={values}
          />
        }
      />
    );
  }

  renderTable(
    shownSubmissions,
    handleActionParams,
    confirmDialogValue,
    isActive,
  ) {
    const { courseId, assessmentId } = this.props.match.params;
    const {
      dispatch,
      assessment,
      isDownloadingFiles,
      isDownloadingCsv,
      isStatisticsDownloading,
      isUnsubmitting,
      isDeleting,
    } = this.props;

    const props = {
      dispatch,
      courseId,
      assessmentId,
      assessment,
      isDownloadingFiles,
      isDownloadingCsv,
      isStatisticsDownloading,
      isUnsubmitting,
      isDeleting,
    };
    return (
      <SubmissionsTable
        confirmDialogValue={confirmDialogValue}
        handleDownload={(downloadFormat) =>
          dispatch(downloadSubmissions(handleActionParams, downloadFormat))
        }
        handleDownloadStatistics={() =>
          dispatch(downloadStatistics(handleActionParams))
        }
        handleUnsubmitAll={() =>
          dispatch(unsubmitAllSubmissions(handleActionParams))
        }
        handleDeleteAll={() =>
          dispatch(deleteAllSubmissions(handleActionParams))
        }
        isActive={isActive}
        submissions={shownSubmissions}
        {...props}
      />
    );
  }

  renderTabs(myStudentsExist) {
    return (
      <Tabs
        onChange={(event, value) => {
          this.setState({ tab: value });
        }}
        style={{ backgroundColor: grey[100], color: blue[500] }}
        TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
        value={this.state.tab}
        variant="fullWidth"
      >
        {myStudentsExist && (
          <Tab
            id="my-students-tab"
            style={{ color: blue[500] }}
            icon={<Group style={{ color: blue[500] }} />}
            label={<FormattedMessage {...submissionsTranslations.myStudents} />}
            value="my-students-tab"
          />
        )}
        <Tab
          id="students-tab"
          icon={<Person style={{ color: blue[500] }} />}
          label={<FormattedMessage {...submissionsTranslations.students} />}
          value="students-tab"
        />

        <Tab
          id="staff-tab"
          icon={<PersonOutline style={{ color: blue[500] }} />}
          label={<FormattedMessage {...submissionsTranslations.staff} />}
          value="staff-tab"
        />
      </Tabs>
    );
  }

  render() {
    const { isLoading, notification, submissions } = this.props;
    const {
      includePhantoms,
      tab,
      publishConfirmation,
      forceSubmitConfirmation,
      remindConfirmation,
    } = this.state;
    if (isLoading) {
      return <LoadingIndicator />;
    }
    const myStudentAllSubmissions = submissions.filter(
      (s) => s.courseUser.isStudent && s.courseUser.myStudent,
    );
    const myStudentNormalSubmissions = myStudentAllSubmissions.filter(
      (s) => !s.courseUser.phantom,
    );
    const myStudentSubmissions = includePhantoms
      ? myStudentAllSubmissions
      : myStudentNormalSubmissions;
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
      ? selectedUserType.my_students_w_phantom
      : selectedUserType.my_students;
    const handleStudentsParams = includePhantoms
      ? selectedUserType.students_w_phantom
      : selectedUserType.students;
    const handleStaffParams = includePhantoms
      ? selectedUserType.staff_w_phantom
      : selectedUserType.staff;

    const myStudentsExist = myStudentAllSubmissions.length > 0;

    let shownSubmissions; // shownSubmissions are submissions currently shown on the active tab on the page
    let handleActionParams;
    switch (tab) {
      case 'staff-tab':
        shownSubmissions = staffSubmissions;
        handleActionParams = handleStaffParams;
        break;
      case 'my-students-tab':
        shownSubmissions = myStudentSubmissions;
        handleActionParams = handleMyStudentsParams;
        break;
      case 'students-tab':
      default:
        shownSubmissions = studentSubmissions;
        handleActionParams = handleStudentsParams;
    }

    return (
      <>
        {this.renderHeader(shownSubmissions)}
        {this.renderTabs(myStudentsExist)}
        {myStudentsExist &&
          this.renderTable(
            myStudentSubmissions,
            handleMyStudentsParams,
            'your students',
            tab === 'my-students-tab',
          )}
        {this.renderTable(
          staffSubmissions,
          handleStaffParams,
          'staff',
          tab === 'staff-tab',
        )}
        {this.renderTable(
          studentSubmissions,
          handleStudentsParams,
          'students',
          tab === 'students-tab',
        )}
        {publishConfirmation &&
          this.renderPublishConfirmation(shownSubmissions, handleActionParams)}
        {forceSubmitConfirmation &&
          this.renderForceSubmitConfirmation(
            shownSubmissions,
            handleActionParams,
          )}
        {remindConfirmation &&
          this.renderReminderConfirmation(shownSubmissions, handleActionParams)}
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
  isDownloadingFiles: PropTypes.bool.isRequired,
  isDownloadingCsv: PropTypes.bool.isRequired,
  isStatisticsDownloading: PropTypes.bool.isRequired,
  isPublishing: PropTypes.bool.isRequired,
  isForceSubmitting: PropTypes.bool.isRequired,
  isUnsubmitting: PropTypes.bool.isRequired,
  isDeleting: PropTypes.bool.isRequired,
  isReminding: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    assessment: state.assessment,
    notification: state.notification,
    submissions: state.submissions,
    isLoading: state.submissionFlags.isLoading,
    isDownloadingFiles: state.submissionFlags.isDownloadingFiles,
    isDownloadingCsv: state.submissionFlags.isDownloadingCsv,
    isStatisticsDownloading: state.submissionFlags.isStatisticsDownloading,
    isPublishing: state.submissionFlags.isPublishing,
    isForceSubmitting: state.submissionFlags.isForceSubmitting,
    isUnsubmitting: state.submissionFlags.isUnsubmitting,
    isDeleting: state.submissionFlags.isDeleting,
    isReminding: state.submissionFlags.isReminding,
  };
}

const SubmissionsIndex = connect(mapStateToProps)(VisibleSubmissionsIndex);
export default SubmissionsIndex;
