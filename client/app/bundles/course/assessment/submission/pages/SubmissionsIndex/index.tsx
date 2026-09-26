import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  FormControlLabel,
  Rating,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import { MainSubmissionInfo } from 'types/course/statistics/assessmentStatistics';

import SubmissionStatusChart from 'course/assessment/pages/AssessmentStatistics/SubmissionStatus/SubmissionStatusChart';
import CourseUserTypeFragment from 'lib/components/core/CourseUserTypeFragment';
import CourseUserTypeTabs, {
  CourseUserType,
  CourseUserTypeTabValue,
  getCurrentSelectedUserType,
} from 'lib/components/core/CourseUserTypeTabs';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import Prompt from 'lib/components/core/dialogs/Prompt';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import assessmentsTranslations from '../../../translations';
import { purgeSubmissionStore } from '../../actions';
import {
  fetchAssessmentAutoFeedbackCount,
  fetchAssessmentRubricFeedbackCount,
  publishAssessmentAutoFeedback,
  publishAssessmentRubricFeedback,
} from '../../actions/aiFeedback';
import {
  deleteAllSubmissions,
  downloadStatistics,
  downloadSubmissions,
  fetchSubmissions,
  fetchSubmissionsFromKoditsu,
  forceSubmitSubmissions,
  publishSubmissions,
  unsubmitAllSubmissions,
} from '../../actions/jobs';
import { sendAssessmentReminderEmail } from '../../actions/requests';
import { workflowStates } from '../../constants';
import translations from '../../translations';

import SubmissionsTable from './SubmissionsTable';
import submissionsTranslations from './translations';

interface SubmissionData {
  workflowState: (typeof workflowStates)[keyof typeof workflowStates];
  courseUser: { isPhantom: boolean };
}

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
  const parsedAssessmentId = parseInt(assessmentId!, 10);
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
  const [tab, setTab] = useState<CourseUserTypeTabValue>(
    CourseUserTypeTabValue.MY_STUDENTS_TAB,
  );

  // Whether these confirmation dialogs are open
  const [isConfirmingPublish, setIsConfirmingPublish] = useState(false);
  const [isConfirmingForceSubmit, setIsConfirmingForceSubmit] = useState(false);
  const [isConfirmingFetchFromKoditsu, setIsConfirmingFetchFromKoditsu] =
    useState(false);
  const [isConfirmingRemind, setIsConfirmingRemind] = useState(false);
  const [isConfirmingPublishAutoFeedback, setIsConfirmingPublishAutoFeedback] =
    useState(false);
  const [
    isConfirmingPublishRubricFeedback,
    setIsConfirmingPublishRubricFeedback,
  ] = useState(false);

  // Whether these requests are in flight
  const [isQueryingAutoFeedback, setIsQueryingAutoFeedback] = useState(false);
  const [isPublishingAutoFeedback, setIsPublishingAutoFeedback] =
    useState(false);
  const [isPublishingRubricFeedback, setIsPublishingRubricFeedback] =
    useState(false);

  // Draft AI feedback awaiting publication, per selected user type: on students' code (Codaveri), and on their
  // written answers (rubric grading).
  const [autoFeedbackCounts, setAutoFeedbackCounts] = useState<
    Partial<Record<CourseUserType, number>>
  >({});
  const [rubricFeedbackCounts, setRubricFeedbackCounts] = useState<
    Partial<Record<CourseUserType, number>>
  >({});
  const [autoFeedbackRating, setAutoFeedbackRating] = useState(0);

  const myStudentsUserType = isIncludingPhantoms
    ? CourseUserType.MY_STUDENTS_W_PHANTOM
    : CourseUserType.MY_STUDENTS;
  const studentsUserType = isIncludingPhantoms
    ? CourseUserType.STUDENTS_W_PHANTOM
    : CourseUserType.STUDENTS;
  const staffUserType = isIncludingPhantoms
    ? CourseUserType.STAFF_W_PHANTOM
    : CourseUserType.STAFF;

  const currentSelectedUserType = getCurrentSelectedUserType(
    tab,
    isIncludingPhantoms,
  );

  useEffect(() => {
    dispatch(fetchSubmissions());
    return () => dispatch(purgeSubmissionStore());
  }, [dispatch]);

  const myStudentsExist = submissions.some((s) => s.courseUser.myStudent);

  useEffect(() => {
    if (
      !(currentSelectedUserType in autoFeedbackCounts) &&
      // don't query auto feedback for my students if I don't have any students
      (myStudentsExist ||
        (currentSelectedUserType !== CourseUserType.MY_STUDENTS &&
          currentSelectedUserType !== CourseUserType.MY_STUDENTS_W_PHANTOM)) &&
      currentSelectedUserType !== CourseUserType.STAFF &&
      currentSelectedUserType !== CourseUserType.STAFF_W_PHANTOM
    ) {
      setIsQueryingAutoFeedback(true);
      Promise.all([
        fetchAssessmentAutoFeedbackCount(
          parsedAssessmentId,
          currentSelectedUserType,
        ),
        fetchAssessmentRubricFeedbackCount(
          parsedAssessmentId,
          currentSelectedUserType,
        ),
      ])
        .then(([autoFeedback, rubricFeedback]) => {
          setAutoFeedbackCounts((counts) => ({
            ...counts,
            [currentSelectedUserType]: autoFeedback.count,
          }));
          setRubricFeedbackCounts((counts) => ({
            ...counts,
            [currentSelectedUserType]: rubricFeedback.count,
          }));
        })
        .finally(() => setIsQueryingAutoFeedback(false));
    }
  }, [dispatch, currentSelectedUserType]);

  useEffect(() => {
    if (!myStudentsExist && tab === CourseUserTypeTabValue.MY_STUDENTS_TAB) {
      setTab(CourseUserTypeTabValue.STUDENTS_TAB);
    }
  }, [dispatch, submissions]);

  if (isLoading || isQueryingAutoFeedback) {
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

  const tabShownSubmissionsMapper = {
    [CourseUserTypeTabValue.MY_STUDENTS_TAB]: myStudentSubmissions,
    [CourseUserTypeTabValue.STUDENTS_TAB]: studentSubmissions,
    [CourseUserTypeTabValue.STAFF_TAB]: staffSubmissions,
  };
  // shownSubmissions are submissions currently shown on the active tab on the page
  const shownSubmissions = tabShownSubmissionsMapper[tab];

  const shownAutoFeedbackCount =
    autoFeedbackCounts[currentSelectedUserType] ?? 0;
  const shownRubricFeedbackCount =
    rubricFeedbackCounts[currentSelectedUserType] ?? 0;

  const renderForceSubmitConfirmation = (): JSX.Element => {
    const values = {
      unattempted: shownSubmissions.filter(
        (s) => s.workflowState === workflowStates.Unstarted,
      ).length,
      attempting: shownSubmissions.filter(
        (s) => s.workflowState === workflowStates.Attempting,
      ).length,
      selectedUsers: (
        <CourseUserTypeFragment userType={currentSelectedUserType} />
      ),
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
      isReminding ||
      isPublishingAutoFeedback ||
      isPublishingRubricFeedback;
    const isShowingRemindButton = tab !== CourseUserTypeTabValue.STAFF_TAB;
    const isShowingPublishAutoFeedbackButton =
      tab !== CourseUserTypeTabValue.STAFF_TAB;

    // No tooltips while disabled: a disabled button fires no pointer events, and MUI warns about a
    // tooltip on one unless its title is empty.
    const isPublishAutoFeedbackDisabled =
      disableButtons || shownAutoFeedbackCount === 0;
    const isPublishRubricFeedbackDisabled =
      disableButtons || shownRubricFeedbackCount === 0;

    return (
      <div className="space-y-5">
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

        {renderStatusChart()}

        <section className="flex-wrap space-x-4">
          {canPublishGrades && (
            <Button
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

          {isShowingPublishAutoFeedbackButton && (
            <Tooltip
              title={
                isPublishAutoFeedbackDisabled
                  ? ''
                  : t(submissionsTranslations.publishAutoFeedbackTooltip)
              }
            >
              <Button
                color="warning"
                disabled={isPublishAutoFeedbackDisabled}
                endIcon={
                  isPublishingAutoFeedback && (
                    <LoadingIndicator bare size={20} />
                  )
                }
                onClick={() => {
                  setIsConfirmingPublishAutoFeedback(true);
                }}
                variant="contained"
              >
                {t(submissionsTranslations.publishAutoFeedback, {
                  count: shownAutoFeedbackCount,
                })}
              </Button>
            </Tooltip>
          )}

          {isShowingPublishAutoFeedbackButton && (
            <Tooltip
              title={
                isPublishRubricFeedbackDisabled
                  ? ''
                  : t(submissionsTranslations.publishRubricFeedbackTooltip)
              }
            >
              <Button
                color="warning"
                disabled={isPublishRubricFeedbackDisabled}
                endIcon={
                  isPublishingRubricFeedback && (
                    <LoadingIndicator bare size={20} />
                  )
                }
                onClick={() => {
                  setIsConfirmingPublishRubricFeedback(true);
                }}
                variant="contained"
              >
                {t(submissionsTranslations.publishRubricFeedback, {
                  count: shownRubricFeedbackCount,
                })}
              </Button>
            </Tooltip>
          )}
        </section>
      </div>
    );
  };

  const renderPublishConfirmation = (): JSX.Element => {
    const values = {
      graded: shownSubmissions.filter(
        (s) => s.workflowState === workflowStates.Graded,
      ).length,
      selectedUsers: (
        <CourseUserTypeFragment userType={currentSelectedUserType} />
      ),
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
      selectedUsers: (
        <CourseUserTypeFragment userType={currentSelectedUserType} />
      ),
    };

    return (
      <ConfirmationDialog
        message={t(translations.sendReminderEmailConfirmation, values)}
        onCancel={() => setIsConfirmingRemind(false)}
        onConfirm={() => {
          dispatch(
            sendAssessmentReminderEmail(
              parsedAssessmentId,
              currentSelectedUserType,
            ),
          );
          setIsConfirmingRemind(false);
        }}
        open={isConfirmingRemind}
      />
    );
  };

  const renderPublishAutoFeedbackConfirmation = (): JSX.Element => {
    return (
      <Prompt
        cancelColor="secondary"
        onClickPrimary={() => {
          const publishSelectedUserType = currentSelectedUserType; // Capture the value at dispatch
          setIsPublishingAutoFeedback(true);
          dispatch(
            publishAssessmentAutoFeedback(
              parsedAssessmentId,
              publishSelectedUserType,
              autoFeedbackRating,
            ),
          )
            .then(() => {
              setAutoFeedbackCounts((counts) => ({
                ...counts,
                [publishSelectedUserType]: 0,
              }));
            })
            .catch(() => {
              // The thunk has already notified the user. The drafts are still unpublished, so the count stays.
            })
            .finally(() => {
              setIsPublishingAutoFeedback(false);
            });
          setIsConfirmingPublishAutoFeedback(false);
        }}
        onClose={() => setIsConfirmingPublishAutoFeedback(false)}
        open={isConfirmingPublishAutoFeedback}
        primaryDisabled={autoFeedbackRating === 0}
        primaryLabel={t(formTranslations.continue)}
      >
        <Typography variant="body2">
          {t(translations.publishAutoFeedbackConfirmationHeader, {
            count: shownAutoFeedbackCount,
          })}
        </Typography>
        <br />
        <Typography variant="body2">
          {t(translations.publishAutoFeedbackConfirmationPleaseRate)}
        </Typography>
        <Rating
          max={5}
          onChange={(_, newValue) => {
            // To prevent the rating to be reset to null when clicking on the same previous rating
            if (newValue !== null) {
              setAutoFeedbackRating(newValue);
            }
          }}
          size="medium"
          value={autoFeedbackRating}
        />
      </Prompt>
    );
  };

  // Unlike programming feedback, there is no overall rating to collect: the comments are simply published, exactly
  // as finalising a submission does under the publish-on-finalise feedback workflow.
  const renderPublishRubricFeedbackConfirmation = (): JSX.Element => (
    <Prompt
      cancelColor="secondary"
      onClickPrimary={() => {
        const publishSelectedUserType = currentSelectedUserType; // Capture the value at dispatch
        setIsPublishingRubricFeedback(true);
        dispatch(
          publishAssessmentRubricFeedback(
            parsedAssessmentId,
            publishSelectedUserType,
          ),
        )
          .then(() => {
            setRubricFeedbackCounts((counts) => ({
              ...counts,
              [publishSelectedUserType]: 0,
            }));
          })
          .catch(() => {
            // The thunk has already notified the user. The drafts are still unpublished, so the count stays.
          })
          .finally(() => {
            setIsPublishingRubricFeedback(false);
          });
        setIsConfirmingPublishRubricFeedback(false);
      }}
      onClose={() => setIsConfirmingPublishRubricFeedback(false)}
      open={isConfirmingPublishRubricFeedback}
      primaryLabel={t(formTranslations.continue)}
    >
      <Typography variant="body2">
        {t(translations.publishRubricFeedbackConfirmation, {
          count: shownRubricFeedbackCount,
        })}
      </Typography>
    </Prompt>
  );

  const renderTable = (
    tableSubmissions: SubmissionData,
    selectedUserType: CourseUserType,
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

  return (
    <Page
      title={t(translations.submissionsHeader, {
        assessment: assessment.title,
      })}
      unpadded
    >
      <CourseUserTypeTabs
        myStudentsExist={myStudentsExist}
        onChange={(_, value) => setTab(value)}
        value={tab}
      />

      <Page.PaddedSection>{renderHeader()}</Page.PaddedSection>

      {myStudentsExist &&
        renderTable(
          myStudentSubmissions,
          myStudentsUserType,
          'your students',
          tab === CourseUserTypeTabValue.MY_STUDENTS_TAB,
        )}

      {renderTable(
        staffSubmissions,
        staffUserType,
        'staff',
        tab === CourseUserTypeTabValue.STAFF_TAB,
      )}

      {renderTable(
        studentSubmissions,
        studentsUserType,
        'students',
        tab === CourseUserTypeTabValue.STUDENTS_TAB,
      )}

      {isConfirmingPublish && renderPublishConfirmation()}

      {isConfirmingForceSubmit && renderForceSubmitConfirmation()}

      {isConfirmingFetchFromKoditsu && renderFetchFromKoditsuConfirmation()}

      {isConfirmingRemind && renderReminderConfirmation()}

      {isConfirmingPublishAutoFeedback &&
        renderPublishAutoFeedbackConfirmation()}

      {isConfirmingPublishRubricFeedback &&
        renderPublishRubricFeedbackConfirmation()}
    </Page>
  );
};

const handle = assessmentsTranslations.submissions;
export default Object.assign(AssessmentSubmissionsIndex, { handle });
