import React, { useEffect, useState } from 'react';
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
import withRouter from 'lib/components/withRouter';
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
import { useTheme } from '@mui/material/styles';
import { style } from '@mui/system';

const styles = {
  histogram: {
    borderRadius: 10,
    display: 'flex',
    overflow: 'hidden',
    textAlign: 'center',
  },
  histogramCells: { transition: 'flex .5s, min-width .5s' },
};

const VisibleSubmissionsIndex = (props) => {
  const theme = useTheme();
  const [state, setState] = useState({
    publishConfirmation: false,
    forceSubmitConfirmation: false,
    includePhantoms: false,
    remindConfirmation: false,
    tab: 'my-students-tab',
  });

  useEffect(() => {
    const { dispatch } = props;
    dispatch(fetchSubmissions());
  }, []);

  useEffect(() => {
    if (
      state.tab === 'my-students-tab' &&
      props.submissions.every((s) => !s.courseUser.myStudent)
    ) {
      // This is safe since there will not be infinite re-renderings caused.
      // Follows the guidelines as recommended on React's website.
      // https://reactjs.org/docs/react-component.html#componentdidupdate
      // eslint-disable-next-line react/no-did-update-set-state
      setState({...state, tab: 'students-tab' });
    }
  }, [state.tab]);
  console.log(state);

  const canForceSubmitOrRemind = (shownSubmissions) => {
    return shownSubmissions.some(
      (s) =>
        s.workflowState === workflowStates.Unstarted ||
        s.workflowState === workflowStates.Attempting,
    );
  };

  const canPublish = (shownSubmissions) => {
    return shownSubmissions.some(
      (s) => s.workflowState === workflowStates.Graded,
    );
  };
  const renderForceSubmitConfirmation = (shownSubmissions, handleForceSubmitParams) => {
    const { dispatch, assessment } = props;
    const { forceSubmitConfirmation } = state;
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
        onCancel={() => setState({...state, forceSubmitConfirmation: false })}
        onConfirm={() => {
          dispatch(forceSubmitSubmissions(handleForceSubmitParams));
          setState({...state, forceSubmitConfirmation: false });
        }}
        message={<FormattedMessage {...message} values={values} />}
      />
    );
  };

  const renderHeader = (shownSubmissions) => {
    const {
      assessment: { title, canPublishGrades, canForceSubmit },
      isPublishing,
      isForceSubmitting,
      isDeleting,
      isUnsubmitting,
      isReminding,
    } = props;
    const { includePhantoms, tab } = state;
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
          {renderHistogram(shownSubmissions)}
          <FormControlLabel
            control={
              <Switch
                checked={includePhantoms}
                className="toggle-phantom"
                color="primary"
                onChange={() =>
                  setState({...state, includePhantoms: !includePhantoms })
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
                !canPublish(shownSubmissions)
              }
              endIcon={isPublishing && <CircularProgress size={24} />}
              onClick={() => setState({...state, publishConfirmation: true })}
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
                !canForceSubmitOrRemind(
                  shownSubmissions,
                )
              }
              endIcon={isForceSubmitting && <CircularProgress size={24} />}
              onClick={() => setState({...state, forceSubmitConfirmation: true })}
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
                !canForceSubmitOrRemind(
                  shownSubmissions,
                )
              }
              endIcon={isReminding && <CircularProgress size={24} />}
              onClick={() => setState({...state, remindConfirmation: true })}
            >
              <FormattedMessage {...submissionsTranslations.remind} />
            </Button>
          )}
        </CardActions>
      </Card>
    );
  };

  const renderHistogram = (submissionHistogram) => {
    const { includePhantoms } = state;
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
            ...styles.histogramCells,
            backgroundColor: theme.palette.status[w],
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
  };

  const renderPublishConfirmation = (shownSubmissions, handlePublishParams) => {
    const { dispatch } = props;
    const { publishConfirmation } = state;

    const values = {
      graded: shownSubmissions.filter(
        (s) => s.workflowState === workflowStates.Graded,
      ).length,
      selectedUsers: selectedUserTypeDisplay[handlePublishParams],
    };

    return (
      <ConfirmationDialog
        open={publishConfirmation}
        onCancel={() => setState({ ...state, publishConfirmation: false })}
        onConfirm={() => {
          dispatch(publishSubmissions(handlePublishParams));
          setState({ ...state, publishConfirmation: false });
        }}
        message={
          <FormattedMessage
            {...translations.publishConfirmation}
            values={values}
          />
        }
      />
    );
  };

  const renderReminderConfirmation = (shownSubmissions, handleRemindParams) => {
    const { dispatch } = props;
    const { assessmentId } = props.match.params;
    const { remindConfirmation } = state;
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
        onCancel={() => setState({ ...state, remindConfirmation: false })}
        onConfirm={() => {
          dispatch(
            sendAssessmentReminderEmail(assessmentId, handleRemindParams),
          );
          setState({ ...state, remindConfirmation: false });
        }}
        message={
          <FormattedMessage
            {...translations.sendReminderEmailConfirmation}
            values={values}
          />
        }
      />
    );
  };

  const renderTable = (
    shownSubmissions,
    handleActionParams,
    confirmDialogValue,
    isActive,
  ) => {
    const { courseId, assessmentId } = props.match.params;

    const {
      dispatch,
      assessment,
      isDownloadingFiles,
      isDownloadingCsv,
      isStatisticsDownloading,
      isUnsubmitting,
      isDeleting,
    } = props;

    const newProps = {
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
        {...newProps}
      />
    );
  };

  const renderTabs = (myStudentsExist) => {
    return (
      <Tabs
        onChange={(event, value) => {
          setState({ ...state, tab: value });
        }}
        style={{ backgroundColor: grey[100], color: blue[500] }}
        TabIndicatorProps={{ color: 'primary', style: { height: 5 } }}
        value={state.tab}
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
  };

  const { isLoading, notification, submissions } = props;
  const {
    includePhantoms,
    tab,
    publishConfirmation,
    forceSubmitConfirmation,
    remindConfirmation,
  } = state;
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
        {renderHeader(shownSubmissions)}
        {renderTabs(myStudentsExist)}
        {myStudentsExist &&
          renderTable(
            myStudentSubmissions,
            handleMyStudentsParams,
            'your students',
            tab === 'my-students-tab',
          )}
        {renderTable(
          staffSubmissions,
          handleStaffParams,
          'staff',
          tab === 'staff-tab',
        )}
        {renderTable(
          studentSubmissions,
          handleStudentsParams,
          'students',
          tab === 'students-tab',
        )}
        {publishConfirmation &&
          renderPublishConfirmation(shownSubmissions, handleActionParams)}
        {forceSubmitConfirmation &&
          renderForceSubmitConfirmation(
            shownSubmissions,
            handleActionParams,
          )}
        {remindConfirmation &&
          renderReminderConfirmation(shownSubmissions, handleActionParams)}
        <NotificationBar notification={notification} />
    </>
  );

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
export default withRouter(SubmissionsIndex);
