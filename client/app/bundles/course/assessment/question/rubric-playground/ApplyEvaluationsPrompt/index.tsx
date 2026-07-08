import { FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Approval, PlayArrow, Refresh } from '@mui/icons-material';
import {
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Switch,
  Tooltip,
} from '@mui/material';
import { PossiblyUnstartedWorkflowState } from 'types/course/assessment/submission/submission';
import {
  RubricAnswerData,
  RubricAnswerEvaluationData,
} from 'types/course/rubrics';
import { JobStatus } from 'types/jobs';

import SubmissionWorkflowState from 'course/assessment/submission/components/SubmissionWorkflowState';
import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Table, { ColumnTemplate } from 'lib/components/table';
import { pollJobRequest } from 'lib/helpers/jobHelpers';
import { getEditSubmissionURL } from 'lib/helpers/url-builders';
import { getAssessmentId, getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import {
  actions as questionRubricsActions,
  RubricState,
} from '../../reducers/rubrics';
import PopoverContentCell from '../AnswerEvaluationsTable/PopoverContentCell';
import {
  evaluatePlaygroundAnswer,
  fetchRubricAnswerEvaluations,
} from '../operations/answers';
import {
  applyEvaluations,
  UnevaluatedAnswersError,
} from '../operations/rowEvaluation';
import translations from '../translations';
import { ApplyEvaluationRow } from '../types';
import { currentAnswersOnly } from '../utils';

interface ApplyEvaluationsPromptProps {
  open: boolean;
  onClose: () => void;
  // The question's active rubric. The whole table is based on this rubric: New Grade is its evaluation, and
  // applying / regrading operate on it. The revision selected on the page has no bearing here.
  activeRubric?: RubricState;
  answers: Record<number, RubricAnswerData>;
  // Applies the active rubric's evaluation to the given answers (replacing their official grade/comment).
  // Rejects with UnevaluatedAnswersError when some answers are unevaluated and applyUnevaluated is false.
  onApply: (answerIds: number[], applyUnevaluated: boolean) => Promise<void>;
}

type GradingStatus =
  | 'incomplete'
  | 'stale'
  | 'uptodate'
  | 'modified'
  | 'manuallyGraded';

const STATUS_CONFIG: Record<
  GradingStatus,
  {
    color: 'warning' | 'success' | 'info';
    label: typeof translations.gradingStatusStale;
  }
> = {
  incomplete: {
    color: 'warning',
    label: translations.gradingStatusIncomplete,
  },
  manuallyGraded: {
    color: 'info',
    label: translations.gradingStatusManuallyGraded,
  },
  modified: {
    color: 'warning',
    label: translations.gradingStatusModified,
  },
  stale: { color: 'warning', label: translations.gradingStatusStale },
  uptodate: { color: 'success', label: translations.gradingStatusUpToDate },
};

const totalGrade = (
  evaluation?: RubricAnswerEvaluationData,
): number | undefined => {
  const selections = evaluation?.selections;
  if (!selections?.length) return undefined;

  return selections.reduce((sum, selection) => sum + selection.grade, 0);
};

// An evaluation is "incomplete" when at least one of its categories has no criterion selected.
const hasNullSelection = (evaluation?: RubricAnswerEvaluationData): boolean =>
  !!evaluation?.selections?.some((selection) => selection.criterionId === null);

// Whether the grading evaluation's breakdown matches the background evaluation's EXACTLY, compared per
// category (not just on the total) -- so raising one category and lowering another by the same amount still
// counts as a difference. False when there is nothing to compare against.
const sameBreakdown = (
  grading?: RubricAnswerEvaluationData,
  evaluation?: RubricAnswerEvaluationData,
): boolean => {
  const gradingSelections = grading?.selections;
  const evaluationSelections = evaluation?.selections;
  if (!gradingSelections?.length || !evaluationSelections?.length) return false;
  if (gradingSelections.length !== evaluationSelections.length) return false;

  const evaluationGradeByCategory = new Map(
    evaluationSelections.map((selection) => [
      selection.categoryId,
      selection.grade,
    ]),
  );
  return gradingSelections.every(
    (selection) =>
      evaluationGradeByCategory.get(selection.categoryId) === selection.grade,
  );
};

const gradeLabel = (grade: number | undefined, maximumGrade: number): string =>
  grade === undefined
    ? '—'
    : `${grade.toFixed(1)} / ${maximumGrade.toFixed(1)}`;

const JOB_POLL_INTERVAL_MS = 1000;

// "Incomplete" if a category is ungraded; "Manually graded" when graded by hand without AI (null rubric);
// "Stale" if graded against a different (non-active) rubric; otherwise it was evaluated against the active
// rubric -- "Up-to-date" when the official grade still matches the active rubric's evaluation (the New
// Grade), or "Modified" when a grader has since changed it. Undefined when not graded. (Grade equality is
// used as a proxy for "matches the background evaluation".)
const gradingStatusOf = (
  row: ApplyEvaluationRow,
  activeRubricId?: number,
): GradingStatus | undefined => {
  if (row.currentGrade === undefined) return undefined;
  if (row.currentIncomplete) return 'incomplete';
  if (row.gradingRubricId === null) return 'manuallyGraded';

  const gradedAgainstActive =
    activeRubricId !== undefined && row.gradingRubricId === activeRubricId;
  if (!gradedAgainstActive) return 'stale';

  // No background evaluation to compare against, or the per-category breakdown matches it exactly.
  if (row.evaluationGrade === undefined || row.gradingMatchesEvaluation) {
    return 'uptodate';
  }
  return 'modified';
};

// Splits the fetched evaluations (the active rubric's 'playground' evaluations + every answer's 'grading'
// evaluation) into one row per answer: Current Grade from the grading eval, New Grade from the llm eval.
const buildRows = (
  answers: Record<number, RubricAnswerData>,
  evaluations: RubricAnswerEvaluationData[],
  maximumGrade: number,
): ApplyEvaluationRow[] => {
  const indexByAnswer = (
    predicate: (evaluation: RubricAnswerEvaluationData) => boolean,
  ): Record<number, RubricAnswerEvaluationData> =>
    evaluations.filter(predicate).reduce(
      (map, evaluation) => {
        map[evaluation.answerId] = evaluation;
        return map;
      },
      {} as Record<number, RubricAnswerEvaluationData>,
    );

  const llmByAnswer = indexByAnswer((e) => e.evaluationType !== 'grading');
  const gradingByAnswer = indexByAnswer((e) => e.evaluationType === 'grading');

  return Object.values(answers).map((answer) => {
    const grading = gradingByAnswer[answer.id];
    const llmEvaluation = llmByAnswer[answer.id];
    return {
      answerId: answer.id,
      studentName: answer.title,
      currentAnswer: answer.currentAnswer,
      submissionId: answer.submissionId,
      submissionStatus: answer.submissionStatus ?? '',
      answerText: answer.answerText,
      maximumGrade,
      currentGrade: totalGrade(grading) ?? answer.grade,
      // null (vs undefined) marks a grading evaluation that exists but was graded by hand (no AI rubric).
      gradingRubricId: grading ? grading.rubricId ?? null : undefined,
      currentIncomplete: hasNullSelection(grading),
      gradingMatchesEvaluation: sameBreakdown(grading, llmEvaluation),
      evaluationGrade: totalGrade(llmEvaluation),
      evaluationComment: llmEvaluation?.feedback,
    };
  });
};

const isApplicable = (row: ApplyEvaluationRow): boolean =>
  row.evaluationGrade !== undefined;

const ApplyEvaluationsPrompt: FC<ApplyEvaluationsPromptProps> = (props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { open, onClose, activeRubric, answers, onApply } = props;

  const activeRubricId = activeRubric?.id;
  const maximumGrade =
    activeRubric?.categories.reduce(
      (sum, category) => sum + category.maximumGrade,
      0,
    ) ?? 0;

  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<ApplyEvaluationRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [evaluatingIds, setEvaluatingIds] = useState<Set<number>>(new Set());
  // Answers whose apply job is running: answerId -> jobUrl. The poller (below) watches these; it is set up
  // and torn down with the component, so it can't outlive the page.
  const [applyingJobs, setApplyingJobs] = useState<Record<number, string>>({});
  const [confirmingUnevaluated, setConfirmingUnevaluated] = useState(false);
  const [showOnlyLatest, setShowOnlyLatest] = useState(true);

  const applyingIds = useMemo(
    () => new Set(Object.keys(applyingJobs).map(Number)),
    [applyingJobs],
  );
  // Jobs currently being polled, so a slow poll can't be issued twice for the same answer.
  const pollingRef = useRef<Set<number>>(new Set());

  // Only the latest (current) answer per student is shown/selectable when the toggle is on.
  const displayedRows = useMemo(
    () => (showOnlyLatest ? currentAnswersOnly(rows) : rows),
    [rows, showOnlyLatest],
  );

  const refreshRows = async (): Promise<void> => {
    if (activeRubricId === undefined) return;
    const evaluations = await fetchRubricAnswerEvaluations(activeRubricId);
    setRows(buildRows(answers, evaluations, maximumGrade));
  };

  useEffect(() => {
    if (!open || activeRubricId === undefined) return;

    setSelectedIds(new Set());
    setEvaluatingIds(new Set());
    setApplyingJobs({});
    setIsLoading(true);
    // The active rubric's evaluations may not be the page's selected revision, so fetch them on demand.
    fetchRubricAnswerEvaluations(activeRubricId)
      .then((evaluations) => {
        setRows(buildRows(answers, evaluations, maximumGrade));
      })
      .catch(() => toast.error(t(translations.applyFailure)))
      .finally(() => setIsLoading(false));
  }, [open, activeRubricId]);

  // Poll the running apply jobs on an interval tied to this component. Applying is a background job, so on
  // completion we refetch the evaluations and rebuild the rows (grade + Grading Status chip). The interval
  // is cleared on unmount (e.g. navigating away) and whenever the set of running jobs changes.
  useEffect(() => {
    const jobEntries = Object.entries(applyingJobs);
    if (jobEntries.length === 0) return undefined;

    const finishJob = (answerId: number, succeeded: boolean): void => {
      setApplyingJobs((previous) => {
        const next = { ...previous };
        delete next[answerId];
        return next;
      });
      if (succeeded) {
        setSelectedIds((previous) => {
          const next = new Set(previous);
          next.delete(answerId);
          return next;
        });
        toast.success(t(translations.applySuccess));
        refreshRows().catch(() => toast.error(t(translations.applyFailure)));
      } else {
        toast.error(t(translations.applyFailure));
      }
    };

    const interval = setInterval(() => {
      jobEntries.forEach(([answerIdString, jobUrl]) => {
        const answerId = Number(answerIdString);
        if (pollingRef.current.has(answerId)) return;
        pollingRef.current.add(answerId);
        pollJobRequest(jobUrl)
          .then((response) => {
            if (response.status === JobStatus.completed)
              finishJob(answerId, true);
            else if (response.status === JobStatus.errored)
              finishJob(answerId, false);
          })
          .catch(() => finishJob(answerId, false))
          .finally(() => pollingRef.current.delete(answerId));
      });
    }, JOB_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [applyingJobs, activeRubricId, answers, maximumGrade]);

  const allSelected =
    displayedRows.length > 0 &&
    displayedRows.every((row) => selectedIds.has(row.answerId));

  const toggleRow = (answerId: number): void =>
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(answerId)) next.delete(answerId);
      else next.add(answerId);
      return next;
    });

  const toggleAll = (): void =>
    setSelectedIds(
      allSelected
        ? new Set()
        : new Set(displayedRows.map((row) => row.answerId)),
    );

  // Hiding non-current answers must also drop them from the selection so applying can't touch a hidden row.
  const toggleShowOnlyLatest = (value: boolean): void => {
    setShowOnlyLatest(value);
    setSelectedIds(new Set());
  };

  // Applying is a background job: kick it off and register the job url so the component-scoped poller
  // watches it to completion (then refetches + rebuilds the row). No polling happens outside the poller.
  const applyRow = async (row: ApplyEvaluationRow): Promise<void> => {
    if (
      activeRubricId === undefined ||
      applyingJobs[row.answerId] !== undefined
    ) {
      return;
    }

    try {
      const jobStatus = await applyEvaluations(
        activeRubricId,
        [row.answerId],
        true,
      );
      if (jobStatus.status === JobStatus.submitted) {
        setApplyingJobs((previous) => ({
          ...previous,
          [row.answerId]: jobStatus.jobUrl,
        }));
      } else if (jobStatus.status === JobStatus.errored) {
        toast.error(t(translations.applyFailure));
      } else {
        // Already completed (unusual for a freshly submitted job) -- refresh straight away.
        setSelectedIds((previous) => {
          const next = new Set(previous);
          next.delete(row.answerId);
          return next;
        });
        toast.success(t(translations.applySuccess));
        await refreshRows();
      }
    } catch {
      toast.error(t(translations.applyFailure));
    }
  };

  // Force a fresh LLM evaluation against the active rubric. This only upserts the 'playground' evaluation; it
  // does NOT touch the official grade. The refreshed evaluation replaces the row's New Grade / Feedback.
  const evaluateRow = (row: ApplyEvaluationRow): void => {
    if (activeRubricId === undefined || evaluatingIds.has(row.answerId)) return;

    setEvaluatingIds((previous) => new Set(previous).add(row.answerId));
    dispatch(
      questionRubricsActions.requestAnswerEvaluation({
        answerId: row.answerId,
        rubricId: activeRubricId,
      }),
    );
    evaluatePlaygroundAnswer(activeRubricId, row.answerId)
      .then((evaluation) => {
        dispatch(
          questionRubricsActions.updateAnswerEvaluation({
            answerId: row.answerId,
            rubricId: activeRubricId,
            evaluation,
          }),
        );
        setRows((previous) =>
          previous.map((existing) =>
            existing.answerId === row.answerId
              ? {
                  ...existing,
                  evaluationGrade: totalGrade(evaluation),
                  evaluationComment: evaluation.feedback,
                }
              : existing,
          ),
        );
      })
      .catch(() => toast.error(t(translations.applyFailure)))
      .finally(() =>
        setEvaluatingIds((previous) => {
          const next = new Set(previous);
          next.delete(row.answerId);
          return next;
        }),
      );
  };

  // Mass evaluate the selected answers against the active rubric (skipping any already in flight).
  const handleMassEvaluate = (): void =>
    rows
      .filter(
        (row) =>
          selectedIds.has(row.answerId) && !evaluatingIds.has(row.answerId),
      )
      .forEach(evaluateRow);

  // Apply the selected answers. The backend rejects (UnevaluatedAnswersError) when some are unevaluated and
  // applyUnevaluated is false; we surface a confirmation prompt, then retry with applyUnevaluated = true.
  const doApply = async (
    answerIds: number[],
    applyUnevaluated: boolean,
  ): Promise<void> => {
    try {
      await onApply(answerIds, applyUnevaluated);
      setConfirmingUnevaluated(false);
      onClose();
    } catch (error) {
      if (error instanceof UnevaluatedAnswersError) {
        setConfirmingUnevaluated(true);
      } else {
        toast.error(t(translations.applyFailure));
      }
    }
  };

  const handleConfirm = (): void => {
    doApply([...selectedIds], false);
  };

  const columns: ColumnTemplate<ApplyEvaluationRow>[] = [
    {
      id: 'select',
      title: (() => (
        <Checkbox
          checked={allSelected}
          disabled={rows.length === 0}
          indeterminate={selectedIds.size > 0 && !allSelected}
          onChange={toggleAll}
          size="small"
        />
      )) as unknown as string,
      className: 'p-0',
      cell: (row) => (
        <Checkbox
          checked={selectedIds.has(row.answerId)}
          disabled={
            evaluatingIds.has(row.answerId) || applyingIds.has(row.answerId)
          }
          onChange={() => toggleRow(row.answerId)}
          size="small"
        />
      ),
    },
    {
      of: 'studentName',
      title: t(translations.student),
      searchable: true,
      sortable: true,
      cell: (row) => row.studentName,
    },
    {
      id: 'submissionStatus',
      title: t(translations.submissionStatus),
      cell: (row) =>
        row.submissionStatus ? (
          <SubmissionWorkflowState
            linkTo={
              row.submissionId === undefined
                ? undefined
                : getEditSubmissionURL(
                    getCourseId(),
                    getAssessmentId(),
                    row.submissionId,
                  )
            }
            opensInNewTab
            workflowState={
              row.submissionStatus as PossiblyUnstartedWorkflowState
            }
          />
        ) : (
          '—'
        ),
    },
    {
      of: 'answerText',
      title: t(translations.answer),
      cell: (row) => <PopoverContentCell content={row.answerText} />,
    },
    {
      id: 'currentGrade',
      title: t(translations.currentGrade),
      sortable: true,
      sortProps: {
        sort: (a, b) => (a.currentGrade ?? -1) - (b.currentGrade ?? -1),
      },
      cell: (row) => gradeLabel(row.currentGrade, row.maximumGrade),
    },
    {
      id: 'evaluationGrade',
      title: t(translations.evaluationGrade),
      sortable: true,
      sortProps: {
        sort: (a, b) => (a.evaluationGrade ?? -1) - (b.evaluationGrade ?? -1),
      },
      cell: (row): ReactNode =>
        evaluatingIds.has(row.answerId) ? (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <LoadingIndicator bare size={15} />
            {t(translations.evaluating)}
          </div>
        ) : (
          gradeLabel(row.evaluationGrade, row.maximumGrade)
        ),
    },
    {
      id: 'evaluationComment',
      title: t(translations.evaluationComment),
      cell: (row) => (
        <PopoverContentCell content={row.evaluationComment ?? ''} />
      ),
    },
    {
      id: 'gradingStatus',
      title: t(translations.gradingStatus),
      cell: (row): ReactNode => {
        if (applyingIds.has(row.answerId)) {
          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <LoadingIndicator bare size={15} />
              {t(translations.applying)}
            </div>
          );
        }

        const status = gradingStatusOf(row, activeRubricId);
        if (!status) return '—';

        const config = STATUS_CONFIG[status];
        return (
          <Chip
            color={config.color}
            label={t(config.label)}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      id: 'actions',
      title: t(translations.actions),
      className: 'p-0',
      cell: (row) => (
        <div className="flex">
          <Tooltip
            title={t(
              isApplicable(row)
                ? translations.reevaluate
                : translations.evaluate,
            )}
          >
            <span>
              <IconButton
                color="info"
                disabled={evaluatingIds.has(row.answerId)}
                onClick={() => evaluateRow(row)}
                size="small"
              >
                {isApplicable(row) ? (
                  <Refresh fontSize="small" />
                ) : (
                  <PlayArrow fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t(translations.applyRow)}>
            <span>
              <IconButton
                color="info"
                disabled={
                  !isApplicable(row) ||
                  evaluatingIds.has(row.answerId) ||
                  applyingIds.has(row.answerId)
                }
                onClick={() => applyRow(row)}
                size="small"
              >
                {applyingIds.has(row.answerId) ? (
                  <CircularProgress size={16} />
                ) : (
                  <Approval fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <Prompt
        contentClassName="space-y-5"
        maxWidth="xl"
        onClickPrimary={handleConfirm}
        onClickSecondary={handleMassEvaluate}
        onClose={onClose}
        open={open}
        primaryColor="info"
        primaryDisabled={selectedIds.size === 0}
        primaryLabel={t(translations.applySelected, {
          count: selectedIds.size,
        })}
        secondaryColor="info"
        secondaryDisabled={selectedIds.size === 0}
        secondaryLabel={t(translations.evaluateSelected, {
          count: selectedIds.size,
        })}
        title={t(translations.confirmAIGradingApplication)}
      >
        <PromptText>{t(translations.applyReplacesSavedResults)}</PromptText>

        {isLoading ? (
          <div className="flex justify-center p-6">
            <CircularProgress />
          </div>
        ) : (
          <>
            <FormControlLabel
              control={
                <Switch
                  checked={showOnlyLatest}
                  onChange={(_, checked) => toggleShowOnlyLatest(checked)}
                  size="small"
                />
              }
              label={t(translations.showOnlyLatestAnswers)}
            />
            <Table
              columns={columns}
              data={displayedRows}
              getRowEqualityData={(row) => ({
                ...row,
                selected: selectedIds.has(row.answerId),
                evaluating: evaluatingIds.has(row.answerId),
                applying: applyingIds.has(row.answerId),
              })}
              getRowId={(row) => row.answerId.toString()}
              search={{
                searchPlaceholder: t(translations.searchByStudentName),
              }}
            />
          </>
        )}
      </Prompt>

      <Prompt
        onClickPrimary={() => doApply([...selectedIds], true)}
        onClose={() => setConfirmingUnevaluated(false)}
        open={confirmingUnevaluated}
        primaryColor="info"
        primaryLabel={t(translations.applySelected, {
          count: selectedIds.size,
        })}
        title={t(translations.confirmApplyUnevaluatedTitle)}
      >
        <PromptText>{t(translations.confirmApplyUnevaluatedText)}</PromptText>
      </Prompt>
    </>
  );
};

export default ApplyEvaluationsPrompt;
