import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import CircularProgress from 'material-ui/CircularProgress';
import RaisedButton from 'material-ui/RaisedButton';
import {
  blue100,
  blue500,
  green100,
  grey100,
  red100,
  yellow100,
} from 'material-ui/styles/colors';
import GroupIcon from 'material-ui/svg-icons/social/group';
import PersonIcon from 'material-ui/svg-icons/social/person';
import PersonOutlineIcon from 'material-ui/svg-icons/social/person-outline';
import { Tab, Tabs } from 'material-ui/Tabs';
import Toggle from 'material-ui/Toggle';
import { PropTypes } from 'prop-types';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';

import {
  deleteAllSubmissions,
  downloadStatistics,
  downloadSubmissions,
  fetchSubmissions,
  forceSubmitSubmissions,
  publishSubmissions,
  sendAssessmentReminderEmail,
  unsubmitAllSubmissions,
} from '../../actions/submissions';
import {
  selectedUserType,
  selectedUserTypeDisplay,
  workflowStates,
} from '../../constants';
import { assessmentShape } from '../../propTypes';
import translations from '../../translations';

import SubmissionsTable from './SubmissionsTable';
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
        message={<FormattedMessage {...message} values={values} />}
        onCancel={() => this.setState({ forceSubmitConfirmation: false })}
        onConfirm={() => {
          dispatch(forceSubmitSubmissions(handleForceSubmitParams));
          this.setState({ forceSubmitConfirmation: false });
        }}
        open={forceSubmitConfirmation}
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
        <CardHeader subtitle="Submissions" title={<h3>{title}</h3>} />
        <CardText style={{ paddingTop: 0 }}>
          {this.renderHistogram(shownSubmissions)}
        </CardText>
        <CardActions>
          <Toggle
            className="toggle-phantom"
            label={
              <FormattedMessage {...submissionsTranslations.includePhantoms} />
            }
            labelPosition="right"
            onToggle={() =>
              this.setState({ includePhantoms: !includePhantoms })
            }
            toggled={includePhantoms}
          />
          {canPublishGrades && (
            <RaisedButton
              disabled={
                disableButtons ||
                !VisibleSubmissionsIndex.canPublish(shownSubmissions)
              }
              icon={isPublishing ? <CircularProgress size={24} /> : null}
              label={
                <FormattedMessage {...submissionsTranslations.publishGrades} />
              }
              labelPosition="before"
              onClick={() => this.setState({ publishConfirmation: true })}
              primary={true}
            />
          )}
          {canForceSubmit && (
            <RaisedButton
              disabled={
                disableButtons ||
                !VisibleSubmissionsIndex.canForceSubmitOrRemind(
                  shownSubmissions,
                )
              }
              icon={isForceSubmitting ? <CircularProgress size={24} /> : null}
              label={
                <FormattedMessage {...submissionsTranslations.forceSubmit} />
              }
              labelPosition="before"
              onClick={() => this.setState({ forceSubmitConfirmation: true })}
              primary={true}
            />
          )}
          {showRemindButton && (
            <RaisedButton
              disabled={
                disableButtons ||
                !VisibleSubmissionsIndex.canForceSubmitOrRemind(
                  shownSubmissions,
                )
              }
              icon={isReminding ? <CircularProgress size={24} /> : null}
              label={<FormattedMessage {...submissionsTranslations.remind} />}
              labelPosition="before"
              onClick={() => this.setState({ remindConfirmation: true })}
              primary={true}
            />
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
            <div key={w} data-for={w} data-tip={true} style={cellStyle}>
              {count > 0 ? count : null}
              <ReactTooltip effect="solid" id={w}>
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
        message={
          <FormattedMessage
            {...translations.publishConfirmation}
            values={values}
          />
        }
        onCancel={() => this.setState({ publishConfirmation: false })}
        onConfirm={() => {
          dispatch(publishSubmissions(handlePublishParams));
          this.setState({ publishConfirmation: false });
        }}
        open={publishConfirmation}
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
        message={
          <FormattedMessage
            {...translations.sendReminderEmailConfirmation}
            values={values}
          />
        }
        onCancel={() => this.setState({ remindConfirmation: false })}
        onConfirm={() => {
          dispatch(
            sendAssessmentReminderEmail(assessmentId, handleRemindParams),
          );
          this.setState({ remindConfirmation: false });
        }}
        open={remindConfirmation}
      />
    );
  }

  renderTabs(filteredSubmissions, handleParams) {
    const { courseId, assessmentId } = this.props.match.params;
    const {
      dispatch,
      assessment,
      isDownloading,
      isStatisticsDownloading,
      isUnsubmitting,
      isDeleting,
    } = this.props;

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
        {filteredSubmissions.myStudentAllSubmissions.length > 0 ? (
          <Tab
            buttonStyle={{ color: blue500 }}
            icon={<GroupIcon style={{ color: blue500 }} />}
            id="my-students-tab"
            label={<FormattedMessage {...submissionsTranslations.myStudents} />}
            onActive={() => this.setState({ tab: 'my-students-tab' })}
          >
            <SubmissionsTable
              confirmDialogValue="your students"
              handleDeleteAll={() =>
                dispatch(
                  deleteAllSubmissions(handleParams.handleMyStudentsParams),
                )
              }
              handleDownload={() =>
                dispatch(
                  downloadSubmissions(handleParams.handleMyStudentsParams),
                )
              }
              handleDownloadStatistics={() =>
                dispatch(
                  downloadStatistics(handleParams.handleMyStudentsParams),
                )
              }
              handleUnsubmitAll={() =>
                dispatch(
                  unsubmitAllSubmissions(handleParams.handleMyStudentsParams),
                )
              }
              submissions={filteredSubmissions.myStudentSubmissions}
              {...props}
            />
          </Tab>
        ) : null}
        <Tab
          buttonStyle={{ color: blue500 }}
          icon={<PersonIcon style={{ color: blue500 }} />}
          id="students-tab"
          label={<FormattedMessage {...submissionsTranslations.students} />}
          onActive={() => this.setState({ tab: 'students-tab' })}
        >
          <SubmissionsTable
            confirmDialogValue="students"
            handleDeleteAll={() =>
              dispatch(deleteAllSubmissions(handleParams.handleStudentsParams))
            }
            handleDownload={() =>
              dispatch(downloadSubmissions(handleParams.handleStudentsParams))
            }
            handleDownloadStatistics={() =>
              dispatch(downloadStatistics(handleParams.handleStudentsParams))
            }
            handleUnsubmitAll={() =>
              dispatch(
                unsubmitAllSubmissions(handleParams.handleStudentsParams),
              )
            }
            submissions={filteredSubmissions.studentSubmissions}
            {...props}
          />
        </Tab>
        <Tab
          buttonStyle={{ color: blue500 }}
          icon={<PersonOutlineIcon style={{ color: blue500 }} />}
          id="staff-tab"
          label={<FormattedMessage {...submissionsTranslations.staff} />}
          onActive={() => this.setState({ tab: 'staff-tab' })}
        >
          <SubmissionsTable
            confirmDialogValue="staff"
            handleDeleteAll={() =>
              dispatch(deleteAllSubmissions(handleParams.handleStaffParams))
            }
            handleDownload={() =>
              dispatch(downloadSubmissions(handleParams.handleStaffParams))
            }
            handleDownloadStatistics={() =>
              dispatch(downloadStatistics(handleParams.handleStaffParams))
            }
            handleUnsubmitAll={() =>
              dispatch(unsubmitAllSubmissions(handleParams.handleStaffParams))
            }
            submissions={filteredSubmissions.staffSubmissions}
            {...props}
          />
        </Tab>
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
    const filteredSubmissions = {
      myStudentAllSubmissions,
      myStudentSubmissions,
      studentSubmissions,
      staffSubmissions,
    };

    const handleMyStudentsParams = includePhantoms
      ? selectedUserType.my_students_w_phantom
      : selectedUserType.my_students;
    const handleStudentsParams = includePhantoms
      ? selectedUserType.students_w_phantom
      : selectedUserType.students;
    const handleStaffParams = includePhantoms
      ? selectedUserType.staff_w_phantom
      : selectedUserType.staff;
    const handleParams = {
      handleMyStudentsParams,
      handleStudentsParams,
      handleStaffParams,
    };

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
        {this.renderTabs(filteredSubmissions, handleParams)}
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
  isDownloading: PropTypes.bool.isRequired,
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
    isDownloading: state.submissionFlags.isDownloading,
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
