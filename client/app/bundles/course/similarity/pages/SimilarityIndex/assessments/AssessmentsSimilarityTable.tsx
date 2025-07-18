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
import { SimilarityAssessmentListData } from 'types/course/similarity';

import { ASSESSMENTS_POLL_INTERVAL_MILLISECONDS } from 'course/similarity/constants';
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
  runAssessmentsSimilarity,
} from '../../../operations';
import { getSimilarityAssessments } from '../../../selectors';

const translations = defineMessages({
  assessment: {
    id: 'course.similarity.SimilarityIndex.assessments.assessment',
    defaultMessage: 'Assessment',
  },
  numSubmitted: {
    id: 'course.similarity.SimilarityIndex.assessments.numSubmitted',
    defaultMessage: '# Submissions',
  },
  numCheckableQuestions: {
    id: 'course.similarity.SimilarityIndex.assessments.numCheckableQuestions',
    defaultMessage: '# Checkable Questions',
  },
  lastSubmittedAt: {
    id: 'course.similarity.SimilarityIndex.assessments.lastSubmittedAt',
    defaultMessage: 'Last Submission At',
  },
  lastRunStatus: {
    id: 'course.similarity.SimilarityIndex.assessments.lastRunStatus',
    defaultMessage: 'Status',
  },
  lastRunTime: {
    id: 'course.similarity.SimilarityIndex.assessments.lastRunTime',
    defaultMessage: 'Last Run At',
  },
  statusNotStarted: {
    id: 'course.similarity.SimilarityIndex.assessments.statusNotStarted',
    defaultMessage: 'Not Started',
  },
  statusRunning: {
    id: 'course.similarity.SimilarityIndex.assessments.statusRunning',
    defaultMessage: 'Running',
  },
  statusCompleted: {
    id: 'course.similarity.SimilarityIndex.assessments.statusCompleted',
    defaultMessage: 'Completed',
  },
  statusFailed: {
    id: 'course.similarity.SimilarityIndex.assessments.statusFailed',
    defaultMessage: 'Failed',
  },
  noSimilarityCheckableQuestions: {
    id: 'course.similarity.SimilarityIndex.assessments.noSimilarityCheckableQuestions',
    defaultMessage: 'No checkable questions',
  },
  notEnoughSubmissions: {
    id: 'course.similarity.SimilarityIndex.assessments.notEnoughSubmissions',
    defaultMessage: 'Not enough submissions',
  },
  runAssessmentsSimilarity: {
    id: 'course.similarity.SimilarityIndex.assessments.runAssessmentsSimilarity',
    defaultMessage: 'New Similarity Check ({count})',
  },
  runSimilarityCheckSuccess: {
    id: 'course.similarity.SimilarityIndex.assessments.runSimilarityCheckSuccess',
    defaultMessage:
      'Started similarity check for {count, plural, =1 {# assessment} other {# assessments}}',
  },
  runSimilarityCheckError: {
    id: 'course.similarity.SimilarityIndex.assessments.runSimilarityCheckError',
    defaultMessage: 'Failed to start similarity checks for some assessments',
  },
  searchByAssessmentTitle: {
    id: 'course.similarity.SimilarityIndex.assessments.searchByAssessmentTitle',
    defaultMessage: 'Search by Assessment Title',
  },
  actions: {
    id: 'course.similarity.SimilarityIndex.assessments.actions',
    defaultMessage: 'Actions',
  },
  runSimilarityCheck: {
    id: 'course.similarity.SimilarityIndex.assessments.runSimilarityCheck',
    defaultMessage: 'Run Similarity Check',
  },
  viewResults: {
    id: 'course.similarity.SimilarityIndex.assessments.viewResults',
    defaultMessage: 'View Results',
  },
  newSubmissionsWarning: {
    id: 'course.similarity.SimilarityIndex.assessments.newSubmissionsWarning',
    defaultMessage: 'New submissions detected since last similarity run',
  },
  noNewSubmissionsWarning: {
    id: 'course.similarity.SimilarityIndex.assessments.noNewSubmissionsWarning',
    defaultMessage: 'No new submissions since last similarity run',
  },
  confirmRerunTitle: {
    id: 'course.similarity.SimilarityIndex.assessments.confirmRerunTitle',
    defaultMessage: 'Confirm Similarity Check?',
  },
  confirmRerunMessage: {
    id: 'course.similarity.SimilarityIndex.assessments.confirmRerunMessage',
    defaultMessage:
      'Some of the selected assessments already have completed similarity checks. Running a new similarity check will remove the previous results.',
  },
});

const AssessmentsSimilarityTable: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { assessments } = useAppSelector(getSimilarityAssessments);
  const assessmentsPollerRef = useRef<NodeJS.Timeout | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [markedAssessments, setMarkedAssessments] = useState<
    SimilarityAssessmentListData[]
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

  const handleRunSimilarityCheck = async (
    selectedAssessments: SimilarityAssessmentListData[],
  ): Promise<void> => {
    if (selectedAssessments.length === 0) return;

    setIsSubmitting(true);
    try {
      const assessmentIds = selectedAssessments.map(
        (assessment) => assessment.id,
      );
      await runAssessmentsSimilarity(assessmentIds);
      await dispatch(fetchAssessments());
      toast.success(
        t(translations.runSimilarityCheckSuccess, {
          count: selectedAssessments.length,
        }),
      );
    } catch {
      toast.error(t(translations.runSimilarityCheckError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunSimilarityCheckWithConfirmation = (
    selectedAssessments: SimilarityAssessmentListData[],
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
      handleRunSimilarityCheck(selectedAssessments);
    }
  };

  const handleDialogClose = (): void => {
    setOpenDialog(false);
    setMarkedAssessments([]);
  };

  const handleConfirmRerun = async (): Promise<void> => {
    setOpenDialog(false);
    await handleRunSimilarityCheck(markedAssessments);
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
    assessment: SimilarityAssessmentListData,
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
    assessment: SimilarityAssessmentListData,
  ): boolean =>
    assessment.workflowState ===
      ASSESSMENT_SIMILARITY_WORKFLOW_STATE.completed &&
    hasNewSubmissionsSinceLastRun(assessment);

  const isCompletedWithoutNewSubmissions = (
    assessment: SimilarityAssessmentListData,
  ): boolean =>
    assessment.workflowState ===
      ASSESSMENT_SIMILARITY_WORKFLOW_STATE.completed &&
    !hasNewSubmissionsSinceLastRun(assessment);

  const canRunSimilarityCheck = (
    assessment: SimilarityAssessmentListData,
  ): boolean =>
    assessment.workflowState !== ASSESSMENT_SIMILARITY_WORKFLOW_STATE.running &&
    assessment.numCheckableQuestions > 0 &&
    assessment.numSubmitted >= 2;

  const columns: ColumnTemplate<SimilarityAssessmentListData>[] = [
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
                  ? translations.noSimilarityCheckableQuestions
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
              className={`w-fit py-1.5 h-auto ${palette.assessmentSimilarityStatus[assessment.workflowState]}`}
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
      of: 'similarityUrl',
      title: t(translations.actions),
      cell: (assessment) => (
        <div className="flex">
          <Tooltip title={t(translations.runSimilarityCheck)}>
            <IconButton
              color="primary"
              disabled={!canRunSimilarityCheck(assessment)}
              onClick={() =>
                handleRunSimilarityCheckWithConfirmation([assessment])
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
              to={assessment.similarityUrl}
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
          `assessment_similarity_${assessment.id} bg-slot-1 hover?:bg-slot-2 slot-1-white slot-2-neutral-100`
        }
        getRowEqualityData={(assessment): SimilarityAssessmentListData =>
          assessment
        }
        getRowId={(assessment): string => assessment.id.toString()}
        indexing={{ rowSelectable: canRunSimilarityCheck }}
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
              canRunSimilarityCheck,
            );
            return (
              <Button
                color="primary"
                disabled={selectedAssessments.length === 0 || isSubmitting}
                onClick={() => {
                  handleRunSimilarityCheckWithConfirmation(selectedAssessments);
                }}
                startIcon={
                  isSubmitting ? <CircularProgress size={20} /> : <PlayArrow />
                }
                variant="contained"
              >
                {t(translations.runAssessmentsSimilarity, {
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

export default AssessmentsSimilarityTable;
