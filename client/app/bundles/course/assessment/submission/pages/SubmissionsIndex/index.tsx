import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  FormControlLabel,
  Switch,
  Tab,
  Tabs,
} from '@mui/material';
import palette from 'theme/palette';
import { MainSubmissionInfo } from 'types/course/statistics/assessmentStatistics';

import SubmissionStatusChart from 'course/assessment/pages/AssessmentStatistics/SubmissionStatus/SubmissionStatusChart';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import assessmentsTranslations from '../../../translations';
import { purgeSubmissionStore } from '../../actions';
import {
  deleteAllSubmissions,
  downloadStatistics,
  downloadSubmissions,
  fetchSubmissions,
  fetchSubmissionsFromKoditsu,
  forceSubmitSubmissions,
  publishSubmissions,
  sendAssessmentReminderEmail,
  unsubmitAllSubmissions,
} from '../../actions/submissions';
import {
  SelectedUserType,
  SelectedUserTypeDisplayMapper,
  workflowStates,
} from '../../constants';
import translations from '../../translations';

import SubmissionsTable from './SubmissionsTable';
import submissionsTranslations from './translations';

interface SubmissionData {
  workflowState: (typeof workflowStates)[keyof typeof workflowStates];
  courseUser: { isPhantom: boolean };
}

enum AssessmentSubmissionsIndexTab {
  MY_STUDENTS_TAB = 'my-students-tab',
  STUDENTS_TAB = 'students-tab',
  STAFF_TAB = 'staff-tab',
}

const TabSelectedUserTypeNormalMapper = {
  [AssessmentSubmissionsIndexTab.MY_STUDENTS_TAB]: SelectedUserType.MY_STUDENTS,
  [AssessmentSubmissionsIndexTab.STUDENTS_TAB]: SelectedUserType.STUDENTS,
  [AssessmentSubmissionsIndexTab.STAFF_TAB]: SelectedUserType.STAFF,
};

const TabSelectedUserTypePhantomMapper = {
  [AssessmentSubmissionsIndexTab.MY_STUDENTS_TAB]:
    SelectedUserType.MY_STUDENTS_W_PHANTOM,
  [AssessmentSubmissionsIndexTab.STUDENTS_TAB]:
    SelectedUserType.STUDENTS_W_PHANTOM,
  [AssessmentSubmissionsIndexTab.STAFF_TAB]: SelectedUserType.STAFF_W_PHANTOM,
};

const canForceSubmitOrRemind = (
  shownSubmissions: SubmissionData[],
): boolean => {
  return shownSubmissions.some(
    (s) =>
      s.workflowState === workflowStates.Unstarted ||
      s.workflowState === workflowStates.Attempting,
  );
};

const canPublish = (shownSubmissions: SubmissionData[]): boolean => {
  return shownSubmissions.some(
    (s) => s.workflowState === workflowStates.Graded,
  );
};

const AssessmentSubmissionsIndex: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { courseId, assessmentId } = useParams();
  const {
    assessment,
    submissions,
    submissionFlags: {
      isLoading,
      isDownloadingFiles,
      isDownloadingCsv,
      isStatisticsDownloading,
      isPublishing,
      isForceSubmitting,
      isUnsubmitting,
      isDeleting,
      isReminding,
    },
  } = useAppSelector((state) => state.assessments.submission);

  const [isIncludingPhantoms, setIsIncludingPhantoms] = useState(false);
  const [tab, setTab] = useState<AssessmentSubmissionsIndexTab>(
    AssessmentSubmissionsIndexTab.MY_STUDENTS_TAB,
  );

  // Whether these confirmation dialogs are open
  const [isConfirmingPublish, setIsConfirmingPublish] = useState(false);
  const [isConfirmingForceSubmit, setIsConfirmingForceSubmit] = useState(false);
  const [isConfirmingFetchFromKoditsu, setIsConfirmingFetchFromKoditsu] =
    useState(false);
  const [isConfirmingRemind, setIsConfirmingRemind] = useState(false);

  const myStudentsUserType = isIncludingPhantoms
    ? SelectedUserType.MY_STUDENTS_W_PHANTOM
    : SelectedUserType.MY_STUDENTS;
  const studentsUserType = isIncludingPhantoms
    ? SelectedUserType.STUDENTS_W_PHANTOM
    : SelectedUserType.STUDENTS;
  const staffUserType = isIncludingPhantoms
    ? SelectedUserType.STAFF_W_PHANTOM
    : SelectedUserType.STAFF;

  const currentSelectedUserType = isIncludingPhantoms
    ? TabSelectedUserTypePhantomMapper[tab]
    : TabSelectedUserTypeNormalMapper[tab];

  useEffect(() => {
    dispatch(fetchSubmissions());
    return () => dispatch(purgeSubmissionStore());
  }, [dispatch]);

  useEffect(() => {
    if (
      tab === AssessmentSubmissionsIndexTab.MY_STUDENTS_TAB &&
      submissions.every((s) => !s.courseUser.myStudent)
    ) {
      setTab(AssessmentSubmissionsIndexTab.STUDENTS_TAB);
    }
  }, [dispatch, submissions]);

  if (isLoading) {
    return <LoadingIndicator />;
  }
  const myStudentAllSubmissions = submissions.filter(
    (s) => s.courseUser.isStudent && s.courseUser.myStudent,
  );
  const myStudentNormalSubmissions = myStudentAllSubmissions.filter(
    (s) => !s.courseUser.phantom,
  );

  const myStudentSubmissions = isIncludingPhantoms
    ? myStudentAllSubmissions
    : myStudentNormalSubmissions;
  const studentSubmissions = isIncludingPhantoms
    ? submissions.filter((s) => s.courseUser.isStudent)
    : submissions.filter(
        (s) => s.courseUser.isStudent && !s.courseUser.phantom,
      );
  const staffSubmissions = isIncludingPhantoms
    ? submissions.filter((s) => !s.courseUser.isStudent)
    : submissions.filter(
        (s) => !s.courseUser.isStudent && !s.courseUser.phantom,
      );

  const myStudentsExist = myStudentAllSubmissions.length > 0;

  const tabShownSubmissionsMapper = {
    [AssessmentSubmissionsIndexTab.MY_STUDENTS_TAB]: myStudentSubmissions,
    [AssessmentSubmissionsIndexTab.STUDENTS_TAB]: studentSubmissions,
    [AssessmentSubmissionsIndexTab.STAFF_TAB]: staffSubmissions,
  };
  // shownSubmissions are submissions currently shown on the active tab on the page
  const shownSubmissions = tabShownSubmissionsMapper[tab];

  const renderForceSubmitConfirmation = (): JSX.Element => {
    const values = {
      unattempted: shownSubmissions.filter(
        (s) => s.workflowState === workflowStates.Unstarted,
      ).length,
      attempting: shownSubmissions.filter(
        (s) => s.workflowState === workflowStates.Attempting,
      ).length,
      selectedUsers: SelectedUserTypeDisplayMapper[currentSelectedUserType],
    };
    const message = assessment.autograded
      ? translations.forceSubmitConfirmationAutograded
      : translations.forceSubmitConfirmation;

    return (
      <ConfirmationDialog
        message={t(message, values)}
        onCancel={() => setIsConfirmingForceSubmit(false)}
        onConfirm={() => {
          dispatch(forceSubmitSubmissions(currentSelectedUserType));
          setIsConfirmingForceSubmit(false);
        }}
        open={isConfirmingForceSubmit}
      />
    );
  };

  const renderFetchFromKoditsuConfirmation = (): JSX.Element => (
    <ConfirmationDialog
      message={t(translations.fetchSubmissionsFromKoditsuConfirmation)}
      onCancel={() => setIsConfirmingFetchFromKoditsu(false)}
      onConfirm={() => {
        dispatch(fetchSubmissionsFromKoditsu());
        setIsConfirmingFetchFromKoditsu(false);
      }}
      open={isConfirmingFetchFromKoditsu}
    />
  );

  const renderStatusChart = (): JSX.Element => {
    const filteredSubmissions = isIncludingPhantoms
      ? shownSubmissions
      : shownSubmissions.filter((s) => !s.courseUser.isPhantom);

    return (
      <SubmissionStatusChart
        submissions={filteredSubmissions as MainSubmissionInfo[]}
      />
    );
  };

  const renderHeader = (): JSX.Element => {
    const { canPublishGrades, canForceSubmit, isKoditsuEnabled } = assessment;
    const disableButtons =
      isPublishing ||
      isForceSubmitting ||
      isDeleting ||
      isUnsubmitting ||
      isReminding;
    const isShowingRemindButton =
      tab !== AssessmentSubmissionsIndexTab.STAFF_TAB;

    return (
      <>
        {renderStatusChart()}

        <FormControlLabel
          control={
            <Switch
              checked={isIncludingPhantoms}
              className="toggle-phantom"
              color="primary"
              onChange={() => setIsIncludingPhantoms(!isIncludingPhantoms)}
            />
          }
          label={<b>{t(submissionsTranslations.includePhantoms)}</b>}
          labelPlacement="end"
        />

        <section className="-m-2 flex-wrap">
          {canPublishGrades && (
            <Button
              className="m-2"
              color="primary"
              disabled={disableButtons || !canPublish(shownSubmissions)}
              endIcon={isPublishing && <LoadingIndicator bare size={20} />}
              onClick={() => setIsConfirmingPublish(true)}
              variant="contained"
            >
              {t(submissionsTranslations.publishGrades)}
            </Button>
          )}

          {canForceSubmit &&
            (isKoditsuEnabled ? (
              <Button
                className="m-2"
                color="primary"
                disabled={disableButtons}
                endIcon={
                  isForceSubmitting && <LoadingIndicator bare size={20} />
                }
                onClick={() => setIsConfirmingFetchFromKoditsu(true)}
                variant="contained"
              >
                {t(submissionsTranslations.fetchFromKoditsu)}
              </Button>
            ) : (
              <Button
                className="m-2"
                color="primary"
                disabled={
                  disableButtons || !canForceSubmitOrRemind(shownSubmissions)
                }
                endIcon={
                  isForceSubmitting && <LoadingIndicator bare size={20} />
                }
                onClick={() => setIsConfirmingForceSubmit(true)}
                variant="contained"
              >
                {t(submissionsTranslations.forceSubmit)}
              </Button>
            ))}

          {isShowingRemindButton && (
            <Button
              className="m-2"
              color="primary"
              disabled={
                disableButtons || !canForceSubmitOrRemind(shownSubmissions)
              }
              endIcon={isReminding && <LoadingIndicator bare size={20} />}
              onClick={() => setIsConfirmingRemind(true)}
              variant="contained"
            >
              {t(submissionsTranslations.remind)}
            </Button>
          )}
        </section>
      </>
    );
  };

  const renderPublishConfirmation = (): JSX.Element => {
    const values = {
      graded: shownSubmissions.filter(
        (s) => s.workflowState === workflowStates.Graded,
      ).length,
      selectedUsers: SelectedUserTypeDisplayMapper[currentSelectedUserType],
    };

    return (
      <ConfirmationDialog
        message={t(translations.publishConfirmation, values)}
        onCancel={() => setIsConfirmingPublish(false)}
        onConfirm={() => {
          dispatch(publishSubmissions(currentSelectedUserType));
          setIsConfirmingPublish(false);
        }}
        open={isConfirmingPublish}
      />
    );
  };

  const renderReminderConfirmation = (): JSX.Element => {
    const values = {
      unattempted: shownSubmissions.filter(
        (s) => s.workflowState === workflowStates.Unstarted,
      ).length,
      attempting: shownSubmissions.filter(
        (s) => s.workflowState === workflowStates.Attempting,
      ).length,
      selectedUsers: SelectedUserTypeDisplayMapper[currentSelectedUserType],
    };

    return (
      <ConfirmationDialog
        message={t(translations.sendReminderEmailConfirmation, values)}
        onCancel={() => setIsConfirmingRemind(false)}
        onConfirm={() => {
          dispatch(
            sendAssessmentReminderEmail(assessment.id, currentSelectedUserType),
          );
          setIsConfirmingRemind(false);
        }}
        open={isConfirmingRemind}
      />
    );
  };

  const renderTable = (
    tableSubmissions: SubmissionData,
    selectedUserType: SelectedUserType,
    confirmDialogValue: string,
    isActive: boolean,
  ): JSX.Element => {
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
        handleDeleteAll={() => dispatch(deleteAllSubmissions(selectedUserType))}
        handleDownload={(downloadFormat) =>
          dispatch(downloadSubmissions(selectedUserType, downloadFormat))
        }
        handleDownloadStatistics={() =>
          dispatch(downloadStatistics(selectedUserType))
        }
        handleUnsubmitAll={() =>
          dispatch(unsubmitAllSubmissions(selectedUserType))
        }
        isActive={isActive}
        submissions={tableSubmissions}
        {...props}
      />
    );
  };

  const renderTabs = (): JSX.Element => (
    <Tabs
      className="border-only-y-neutral-200"
      onChange={(_, value) => setTab(value)}
      value={tab}
      variant="fullWidth"
    >
      {myStudentsExist && (
        <Tab
          id="my-students-tab"
          label={t(submissionsTranslations.myStudents)}
          style={{ color: palette.submissionIcon.person }}
          value={AssessmentSubmissionsIndexTab.MY_STUDENTS_TAB}
        />
      )}
      <Tab
        id="students-tab"
        label={t(submissionsTranslations.students)}
        value={AssessmentSubmissionsIndexTab.STUDENTS_TAB}
      />

      <Tab
        id="staff-tab"
        label={t(submissionsTranslations.staff)}
        value={AssessmentSubmissionsIndexTab.STAFF_TAB}
      />
    </Tabs>
  );

  return (
    <Page
      title={t(translations.submissionsHeader, {
        assessment: assessment.title,
      })}
      unpadded
    >
      <Page.PaddedSection>{renderHeader()}</Page.PaddedSection>

      {renderTabs()}

      {myStudentsExist &&
        renderTable(
          myStudentSubmissions,
          myStudentsUserType,
          'your students',
          tab === AssessmentSubmissionsIndexTab.MY_STUDENTS_TAB,
        )}

      {renderTable(
        staffSubmissions,
        staffUserType,
        'staff',
        tab === AssessmentSubmissionsIndexTab.STAFF_TAB,
      )}

      {renderTable(
        studentSubmissions,
        studentsUserType,
        'students',
        tab === AssessmentSubmissionsIndexTab.STUDENTS_TAB,
      )}

      {isConfirmingPublish && renderPublishConfirmation()}
      {isConfirmingForceSubmit && renderForceSubmitConfirmation()}
      {isConfirmingFetchFromKoditsu && renderFetchFromKoditsuConfirmation()}
      {isConfirmingRemind && renderReminderConfirmation()}

    </Page>
  );
};

const handle = assessmentsTranslations.submissions;
export default Object.assign(AssessmentSubmissionsIndex, { handle });
