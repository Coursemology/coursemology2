import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import {
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
  Tab,
  Tabs,
} from '@mui/material';
import { PropTypes } from 'prop-types';
import palette from 'theme/palette';

import BarChart from 'lib/components/core/BarChart';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import withRouter from 'lib/components/navigation/withRouter';

import assessmentsTranslations from '../../../translations';
import { purgeSubmissionStore } from '../../actions';
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

      this.setState({ tab: 'students-tab' });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(purgeSubmissionStore());
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

  renderBarChart = (SubmissionStatusChart) => {
    const { includePhantoms } = this.state;
    const workflowStatesArray = Object.values(workflowStates);

    const initialCounts = workflowStatesArray.reduce(
      (counts, w) => ({ ...counts, [w]: 0 }),
      {},
    );
    const submissionStateCounts = SubmissionStatusChart.reduce(
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

    const data = workflowStatesArray
      .map((w) => {
        const count = submissionStateCounts[w];
        return {
          count,
          color: palette.submissionStatus[w],
          label: <FormattedMessage {...translations[w]} />,
        };
      })
      .filter((seg) => seg.count > 0);

    return <BarChart data={data} />;
  };

  renderHeader(shownSubmissions) {
    const {
      assessment: { canPublishGrades, canForceSubmit },
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
      <>
        {this.renderBarChart(shownSubmissions)}

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
              <FormattedMessage {...submissionsTranslations.includePhantoms} />
            </b>
          }
          labelPlacement="end"
        />

        <section className="-m-2 flex-wrap">
          {canPublishGrades && (
            <Button
              className="m-2"
              color="primary"
              disabled={
                disableButtons ||
                !VisibleSubmissionsIndex.canPublish(shownSubmissions)
              }
              endIcon={isPublishing && <CircularProgress size={24} />}
              onClick={() => this.setState({ publishConfirmation: true })}
              variant="contained"
            >
              <FormattedMessage {...submissionsTranslations.publishGrades} />
            </Button>
          )}

          {canForceSubmit && (
            <Button
              className="m-2"
              color="primary"
              disabled={
                disableButtons ||
                !VisibleSubmissionsIndex.canForceSubmitOrRemind(
                  shownSubmissions,
                )
              }
              endIcon={isForceSubmitting && <CircularProgress size={24} />}
              onClick={() => this.setState({ forceSubmitConfirmation: true })}
              variant="contained"
            >
              <FormattedMessage {...submissionsTranslations.forceSubmit} />
            </Button>
          )}

          {showRemindButton && (
            <Button
              className="m-2"
              color="primary"
              disabled={
                disableButtons ||
                !VisibleSubmissionsIndex.canForceSubmitOrRemind(
                  shownSubmissions,
                )
              }
              endIcon={isReminding && <CircularProgress size={24} />}
              onClick={() => this.setState({ remindConfirmation: true })}
              variant="contained"
            >
              <FormattedMessage {...submissionsTranslations.remind} />
            </Button>
          )}
        </section>
      </>
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
        handleDeleteAll={() =>
          dispatch(deleteAllSubmissions(handleActionParams))
        }
        handleDownload={(downloadFormat) =>
          dispatch(downloadSubmissions(handleActionParams, downloadFormat))
        }
        handleDownloadStatistics={() =>
          dispatch(downloadStatistics(handleActionParams))
        }
        handleUnsubmitAll={() =>
          dispatch(unsubmitAllSubmissions(handleActionParams))
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
        className="border-only-y-neutral-200"
        onChange={(_, value) => this.setState({ tab: value })}
        value={this.state.tab}
        variant="fullWidth"
      >
        {myStudentsExist && (
          <Tab
            id="my-students-tab"
            label={<FormattedMessage {...submissionsTranslations.myStudents} />}
            style={{ color: palette.submissionIcon.person }}
            value="my-students-tab"
          />
        )}
        <Tab
          id="students-tab"
          label={<FormattedMessage {...submissionsTranslations.students} />}
          value="students-tab"
        />

        <Tab
          id="staff-tab"
          label={<FormattedMessage {...submissionsTranslations.staff} />}
          value="staff-tab"
        />
      </Tabs>
    );
  }

  render() {
    const { assessment, isLoading, submissions } = this.props;
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
      <Page
        title={
          <FormattedMessage
            {...translations.submissionsHeader}
            values={{ assessment: assessment.title }}
          />
        }
        unpadded
      >
        <Page.PaddedSection>
          {this.renderHeader(shownSubmissions)}
        </Page.PaddedSection>

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
      </Page>
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

function mapStateToProps({ assessments: { submission } }) {
  return {
    assessment: submission.assessment,
    submissions: submission.submissions,
    isLoading: submission.submissionFlags.isLoading,
    isDownloadingFiles: submission.submissionFlags.isDownloadingFiles,
    isDownloadingCsv: submission.submissionFlags.isDownloadingCsv,
    isStatisticsDownloading: submission.submissionFlags.isStatisticsDownloading,
    isPublishing: submission.submissionFlags.isPublishing,
    isForceSubmitting: submission.submissionFlags.isForceSubmitting,
    isUnsubmitting: submission.submissionFlags.isUnsubmitting,
    isDeleting: submission.submissionFlags.isDeleting,
    isReminding: submission.submissionFlags.isReminding,
  };
}

const handle = assessmentsTranslations.submissions;

const SubmissionsIndex = connect(mapStateToProps)(VisibleSubmissionsIndex);
export default Object.assign(withRouter(SubmissionsIndex), { handle });
