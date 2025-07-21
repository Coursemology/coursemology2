import { FC, useEffect, useRef, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  InfoOutlined,
  Plagiarism,
  PlayArrow,
  Warning,
} from '@mui/icons-material';
import {
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import palette from 'theme/palette';
import { PlagiarismAssessmentListData } from 'types/course/plagiarism';

import { ASSESSMENTS_POLL_INTERVAL_MILLISECONDS } from 'course/plagiarism/constants';
import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import { ColumnTemplate } from 'lib/components/table';
import Table from 'lib/components/table/Table';
import {
  ASSESSMENT_SIMILARITY_WORKFLOW_STATE,
  DEFAULT_TABLE_ROWS_PER_PAGE,
  NUM_CELL_CLASS_NAME,
} from 'lib/constants/sharedConstants';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import { formatMiniDateTime } from 'lib/moment';
import formTranslations from 'lib/translations/form';

import {
  fetchAssessments,
  runAssessmentsPlagiarism,
} from '../../../operations';
import { getPlagiarismAssessments } from '../../../selectors';

const translations = defineMessages({
  assessment: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.assessment',
    defaultMessage: 'Assessment',
  },
  numSubmitted: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.numSubmitted',
    defaultMessage: '# Submissions',
  },
  numCheckableQuestions: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.numCheckableQuestions',
    defaultMessage: '# Checkable Questions',
  },
  lastSubmittedAt: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.lastSubmittedAt',
    defaultMessage: 'Last Submission At',
  },
  lastRunStatus: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.lastRunStatus',
    defaultMessage: 'Status',
  },
  lastRunTime: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.lastRunTime',
    defaultMessage: 'Last Run At',
  },
  statusNotStarted: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.statusNotStarted',
    defaultMessage: 'Not Started',
  },
  statusRunning: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.statusRunning',
    defaultMessage: 'Running',
  },
  statusCompleted: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.statusCompleted',
    defaultMessage: 'Completed',
  },
  statusFailed: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.statusFailed',
    defaultMessage: 'Failed',
  },
  noPlagiarismCheckableQuestions: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.noPlagiarismCheckableQuestions',
    defaultMessage: 'No checkable questions',
  },
  notEnoughSubmissions: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.notEnoughSubmissions',
    defaultMessage: 'Not enough submissions',
  },
  runAssessmentsPlagiarism: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.runAssessmentsPlagiarism',
    defaultMessage: 'New Plagiarism Check ({count})',
  },
  runPlagiarismCheckSuccess: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.runPlagiarismCheckSuccess',
    defaultMessage:
      'Started plagiarism check for {count, plural, =1 {# assessment} other {# assessments}}',
  },
  runPlagiarismCheckError: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.runPlagiarismCheckError',
    defaultMessage: 'Failed to start plagiarism checks for some assessments',
  },
  searchByAssessmentTitle: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.searchByAssessmentTitle',
    defaultMessage: 'Search by Assessment Title',
  },
  actions: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.actions',
    defaultMessage: 'Actions',
  },
  runPlagiarismCheck: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.runPlagiarismCheck',
    defaultMessage: 'Run Plagiarism Check',
  },
  viewResults: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.viewResults',
    defaultMessage: 'View Results',
  },
  newSubmissionsWarning: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.newSubmissionsWarning',
    defaultMessage: 'New submissions detected since last plagiarism run',
  },
  noNewSubmissionsWarning: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.noNewSubmissionsWarning',
    defaultMessage: 'No new submissions since last plagiarism run',
  },
  confirmRerunTitle: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.confirmRerunTitle',
    defaultMessage: 'Confirm Plagiarism Check?',
  },
  confirmRerunMessage: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.confirmRerunMessage',
    defaultMessage:
      'Some of the selected assessments already have completed plagiarism checks. Running a new plagiarism check will remove the previous results.',
  },
});

const AssessmentsPlagiarismTable: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { assessments } = useAppSelector(getPlagiarismAssessments);
  const assessmentsPollerRef = useRef<NodeJS.Timeout | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [markedAssessments, setMarkedAssessments] = useState<
    PlagiarismAssessmentListData[]
  >([]);

  useEffect(() => {
    assessmentsPollerRef.current = setInterval(() => {
      dispatch(fetchAssessments());
    }, ASSESSMENTS_POLL_INTERVAL_MILLISECONDS);
    return () => {
      if (assessmentsPollerRef.current) {
        clearInterval(assessmentsPollerRef.current);
      }
    };
  });

  const handleRunPlagiarismCheck = async (
    selectedAssessments: PlagiarismAssessmentListData[],
  ): Promise<void> => {
    if (selectedAssessments.length === 0) return;

    setIsSubmitting(true);
    try {
      const assessmentIds = selectedAssessments.map(
        (assessment) => assessment.id,
      );
      await runAssessmentsPlagiarism(assessmentIds);
      await dispatch(fetchAssessments());
      toast.success(
        t(translations.runPlagiarismCheckSuccess, {
          count: selectedAssessments.length,
        }),
      );
    } catch {
      toast.error(t(translations.runPlagiarismCheckError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunPlagiarismCheckWithConfirmation = (
    selectedAssessments: PlagiarismAssessmentListData[],
  ): void => {
    if (selectedAssessments.length === 0) return;

    const hasCompletedAssessments = selectedAssessments.some(
      (assessment) =>
        assessment.workflowState ===
        ASSESSMENT_SIMILARITY_WORKFLOW_STATE.completed,
    );

    if (hasCompletedAssessments) {
      setMarkedAssessments(selectedAssessments);
      setOpenDialog(true);
    } else {
      handleRunPlagiarismCheck(selectedAssessments);
    }
  };

  const handleDialogClose = (): void => {
    setOpenDialog(false);
    setMarkedAssessments([]);
  };

  const handleConfirmRerun = async (): Promise<void> => {
    setOpenDialog(false);
    await handleRunPlagiarismCheck(markedAssessments);
    setMarkedAssessments([]);
  };

  const getStatusText = (
    workflowState: keyof typeof ASSESSMENT_SIMILARITY_WORKFLOW_STATE,
  ): string => {
    switch (workflowState) {
      case ASSESSMENT_SIMILARITY_WORKFLOW_STATE.not_started:
        return t(translations.statusNotStarted);
      case ASSESSMENT_SIMILARITY_WORKFLOW_STATE.running:
        return t(translations.statusRunning);
      case ASSESSMENT_SIMILARITY_WORKFLOW_STATE.completed:
        return t(translations.statusCompleted);
      case ASSESSMENT_SIMILARITY_WORKFLOW_STATE.failed:
        return t(translations.statusFailed);
      default:
        return workflowState;
    }
  };

  const hasNewSubmissionsSinceLastRun = (
    assessment: PlagiarismAssessmentListData,
  ): boolean => {
    if (
      assessment.workflowState ===
        ASSESSMENT_SIMILARITY_WORKFLOW_STATE.not_started ||
      !assessment.lastSubmittedAt ||
      !assessment.lastRunTime
    ) {
      return false;
    }
    return (
      new Date(assessment.lastSubmittedAt) > new Date(assessment.lastRunTime)
    );
  };

  const isCompletedWithNewSubmissions = (
    assessment: PlagiarismAssessmentListData,
  ): boolean =>
    assessment.workflowState ===
      ASSESSMENT_SIMILARITY_WORKFLOW_STATE.completed &&
    hasNewSubmissionsSinceLastRun(assessment);

  const isCompletedWithoutNewSubmissions = (
    assessment: PlagiarismAssessmentListData,
  ): boolean =>
    assessment.workflowState ===
      ASSESSMENT_SIMILARITY_WORKFLOW_STATE.completed &&
    !hasNewSubmissionsSinceLastRun(assessment);

  const canRunPlagiarismCheck = (
    assessment: PlagiarismAssessmentListData,
  ): boolean =>
    assessment.workflowState !== ASSESSMENT_SIMILARITY_WORKFLOW_STATE.running &&
    assessment.numCheckableQuestions > 0 &&
    assessment.numSubmitted >= 2;

  const columns: ColumnTemplate<PlagiarismAssessmentListData>[] = [
    {
      of: 'title',
      title: t(translations.assessment),
      sortable: true,
      searchable: true,
      cell: (assessment) => (
        <div className="flex items-center justify-between">
          <Link opensInNewTab to={assessment.url}>
            {assessment.title}
          </Link>
          {(assessment.numCheckableQuestions === 0 ||
            assessment.numSubmitted < 2) && (
            <Tooltip
              title={t(
                assessment.numCheckableQuestions === 0
                  ? translations.noPlagiarismCheckableQuestions
                  : translations.notEnoughSubmissions,
              )}
            >
              <Warning color="warning" />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      of: 'numCheckableQuestions',
      title: t(translations.numCheckableQuestions),
      sortable: true,
      cell: (assessment) => (
        <div className="flex items-center justify-center">
          <span className={`${NUM_CELL_CLASS_NAME} min-w-[4ch]`}>
            {assessment.numCheckableQuestions}
          </span>
        </div>
      ),
    },
    {
      of: 'numSubmitted',
      title: t(translations.numSubmitted),
      sortable: true,
      cell: (assessment) => (
        <div className="flex items-center justify-center">
          <span className={`${NUM_CELL_CLASS_NAME} min-w-[4ch]`}>
            <Link opensInNewTab to={assessment.submissionsUrl}>
              {assessment.numSubmitted}
            </Link>
          </span>
        </div>
      ),
    },
    {
      of: 'lastSubmittedAt',
      title: t(translations.lastSubmittedAt),
      sortable: true,
      cell: (assessment) =>
        assessment.lastSubmittedAt
          ? formatMiniDateTime(assessment.lastSubmittedAt)
          : '-',
    },
    {
      of: 'workflowState',
      title: t(translations.lastRunStatus),
      sortable: true,
      cell: (assessment): JSX.Element => {
        const content = (
          <div className="flex gap-2">
            <Chip
              className={`w-fit py-1.5 h-auto ${palette.assessmentPlagiarismStatus[assessment.workflowState]}`}
              label={getStatusText(assessment.workflowState)}
            />
            {isCompletedWithNewSubmissions(assessment) && (
              <Tooltip title={t(translations.newSubmissionsWarning)}>
                <InfoOutlined color="info" />
              </Tooltip>
            )}
            {assessment.workflowState ===
              ASSESSMENT_SIMILARITY_WORKFLOW_STATE.failed && (
              <Tooltip title={assessment.errorMessage}>
                <InfoOutlined color="info" />
              </Tooltip>
            )}
          </div>
        );
        if (isCompletedWithoutNewSubmissions(assessment)) {
          return (
            <Tooltip title={t(translations.noNewSubmissionsWarning)}>
              {content}
            </Tooltip>
          );
        }
        return content;
      },
    },
    {
      of: 'lastRunTime',
      title: t(translations.lastRunTime),
      sortable: true,
      cell: (assessment) =>
        assessment.lastRunTime
          ? formatMiniDateTime(assessment.lastRunTime)
          : '-',
    },
    {
      of: 'plagiarismUrl',
      title: t(translations.actions),
      cell: (assessment) => (
        <div className="flex">
          <Tooltip title={t(translations.runPlagiarismCheck)}>
            <IconButton
              color="primary"
              disabled={!canRunPlagiarismCheck(assessment)}
              onClick={() =>
                handleRunPlagiarismCheckWithConfirmation([assessment])
              }
              size="small"
            >
              <PlayArrow />
            </IconButton>
          </Tooltip>
          <Tooltip title={t(translations.viewResults)}>
            <Link
              disabled={
                assessment.workflowState !==
                ASSESSMENT_SIMILARITY_WORKFLOW_STATE.completed
              }
              opensInNewTab
              to={assessment.plagiarismUrl}
            >
              <IconButton
                color="primary"
                disabled={
                  assessment.workflowState !==
                  ASSESSMENT_SIMILARITY_WORKFLOW_STATE.completed
                }
                size="small"
              >
                <Plagiarism />
              </IconButton>
            </Link>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        className="border-none"
        columns={columns}
        data={assessments}
        getRowClassName={(assessment): string =>
          `assessment_plagiarism_${assessment.id} bg-slot-1 hover?:bg-slot-2 slot-1-white slot-2-neutral-100`
        }
        getRowEqualityData={(assessment): PlagiarismAssessmentListData =>
          assessment
        }
        getRowId={(assessment): string => assessment.id.toString()}
        indexing={{ rowSelectable: canRunPlagiarismCheck }}
        pagination={{
          rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
          showAllRows: true,
        }}
        search={{
          searchPlaceholder: t(translations.searchByAssessmentTitle),
          searchProps: {
            shouldInclude: (assessment, filterValue?: string): boolean => {
              if (!assessment.title) return false;
              if (!filterValue) return true;

              return assessment.title
                .toLowerCase()
                .trim()
                .includes(filterValue.toLowerCase().trim());
            },
          },
        }}
        toolbar={{
          show: true,
          activeToolbar: (selectedAssessments): JSX.Element => {
            selectedAssessments = selectedAssessments.filter(
              canRunPlagiarismCheck,
            );
            return (
              <Button
                color="primary"
                disabled={selectedAssessments.length === 0 || isSubmitting}
                onClick={() => {
                  handleRunPlagiarismCheckWithConfirmation(selectedAssessments);
                }}
                startIcon={
                  isSubmitting ? <CircularProgress size={20} /> : <PlayArrow />
                }
                variant="contained"
              >
                {t(translations.runAssessmentsPlagiarism, {
                  count: selectedAssessments.length,
                })}
              </Button>
            );
          },
          keepNative: true,
        }}
      />

      <Prompt
        disabled={isSubmitting}
        onClickPrimary={handleConfirmRerun}
        onClose={handleDialogClose}
        open={openDialog}
        primaryColor="info"
        primaryLabel={t(formTranslations.continue)}
        title={t(translations.confirmRerunTitle)}
      >
        <PromptText>{t(translations.confirmRerunMessage)}</PromptText>
      </Prompt>
    </>
  );
};

export default AssessmentsPlagiarismTable;
