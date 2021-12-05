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
  forceSubmitSubmissions,
  downloadSubmissions,
  downloadStatistics,
  unsubmitAllSubmissions,
  deleteAllSubmissions,
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
    unstarted: { backgroundColor: red100 },
    attempting: { backgroundColor: yellow100 },
    submitted: { backgroundColor: grey100 },
    graded: { backgroundColor: blue100 },
    published: { backgroundColor: green100 },
  },
};

class VisibleSubmissionsIndex extends React.Component {
  static canPublish(shownSubmissions) {
    return shownSubmissions.some(
      (s) => s.workflowState === workflowStates.Graded,
    );
  }

  static canForceSubmit(shownSubmissions) {
    return shownSubmissions.some(
      (s) =>
        s.workflowState === workflowStates.Unstarted ||
        s.workflowState === workflowStates.Attempting,
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      publishConfirmation: false,
      forceSubmitConfirmation: false,
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

  renderHeader(shownSubmissions) {
    const {
      assessment: { title, canPublishGrades, canForceSubmit },
      isPublishing,
      isForceSubmitting,
    } = this.props;
    const { includePhantoms } = this.state;

    return (
      <Card style={{ marginBottom: 20 }}>
        <CardHeader title={<h3>{title}</h3>} subtitle="Submissions" />
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
            toggled={includePhantoms}
            onToggle={() =>
              this.setState({ includePhantoms: !includePhantoms })
            }
          />
          {canPublishGrades && (
            <FlatButton
              disabled={
                isPublishing ||
                isForceSubmitting ||
                !VisibleSubmissionsIndex.canPublish(shownSubmissions)
              }
              secondary
              label={
                <FormattedMessage {...submissionsTranslations.publishGrades} />
              }
              labelPosition="before"
              icon={isPublishing ? <CircularProgress size={24} /> : null}
              onClick={() => this.setState({ publishConfirmation: true })}
            />
          )}
          {canForceSubmit && (
            <FlatButton
              disabled={
                isForceSubmitting ||
                isPublishing ||
                !VisibleSubmissionsIndex.canForceSubmit(shownSubmissions)
              }
              secondary
              label={
                <FormattedMessage {...submissionsTranslations.forceSubmit} />
              }
              labelPosition="before"
              icon={isForceSubmitting ? <CircularProgress size={24} /> : null}
              onClick={() => this.setState({ forceSubmitConfirmation: true })}
            />
          )}
        </CardActions>
      </Card>
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
            id="my-students-tab"
            buttonStyle={{ color: blue500 }}
            icon={<GroupIcon style={{ color: blue500 }} />}
            label={<FormattedMessage {...submissionsTranslations.myStudents} />}
            onActive={() => this.setState({ tab: 'my-students-tab' })}
          >
            <SubmissionsTable
              submissions={filteredSubmissions.myStudentSubmissions}
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
              handleDeleteAll={() =>
                dispatch(
                  deleteAllSubmissions(handleParams.handleMyStudentsParams),
                )
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
            submissions={filteredSubmissions.studentSubmissions}
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
            handleDeleteAll={() =>
              dispatch(deleteAllSubmissions(handleParams.handleStudentsParams))
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
            submissions={filteredSubmissions.staffSubmissions}
            handleDownload={() =>
              dispatch(downloadSubmissions(handleParams.handleStaffParams))
            }
            handleDownloadStatistics={() =>
              dispatch(downloadStatistics(handleParams.handleStaffParams))
            }
            handleUnsubmitAll={() =>
              dispatch(unsubmitAllSubmissions(handleParams.handleStaffParams))
            }
            handleDeleteAll={() =>
              dispatch(deleteAllSubmissions(handleParams.handleStaffParams))
            }
            confirmDialogValue="staff"
            {...props}
          />
        </Tab>
      </Tabs>
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

  render() {
    const { isLoading, notification, submissions } = this.props;
    const {
      includePhantoms,
      tab,
      publishConfirmation,
      forceSubmitConfirmation,
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
    let handlePublishOrSubmitParams;
    switch (tab) {
      case 'staff-tab':
        shownSubmissions = staffSubmissions;
        handlePublishOrSubmitParams = handleStaffParams;
        break;
      case 'my-students-tab':
        shownSubmissions = myStudentSubmissions;
        handlePublishOrSubmitParams = handleMyStudentsParams;
        break;
      case 'students-tab':
      default:
        shownSubmissions = studentSubmissions;
        handlePublishOrSubmitParams = handleStudentsParams;
    }

    return (
      <>
        {this.renderHeader(shownSubmissions)}
        {this.renderTabs(filteredSubmissions, handleParams)}
        {publishConfirmation &&
          this.renderPublishConfirmation(
            shownSubmissions,
            handlePublishOrSubmitParams,
          )}
        {forceSubmitConfirmation &&
          this.renderForceSubmitConfirmation(
            shownSubmissions,
            handlePublishOrSubmitParams,
          )}
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
  };
}

const SubmissionsIndex = connect(mapStateToProps)(VisibleSubmissionsIndex);
export default SubmissionsIndex;
