import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowForward, Edit, Undo, Upgrade } from '@mui/icons-material';
import {
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  ProgrammingLanguageData,
  ProgrammingUpgradeData,
  ProgrammingUpgradeQuestionData,
} from 'types/course/programmingUpgrade';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { ColumnTemplate } from 'lib/components/table';
import Table from 'lib/components/table/Table';
import Preload from 'lib/components/wrappers/Preload';
import {
  DEFAULT_TABLE_ROWS_PER_PAGE,
  NUM_CELL_CLASS_NAME,
} from 'lib/constants/sharedConstants';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { UPGRADES_POLL_INTERVAL_MILLISECONDS } from './constants';
import {
  fetchQuestions,
  fetchUpgrades,
  revertQuestion,
  upgradeQuestions,
} from './operations';
import { isInProgress, statusOf } from './status';
import StatusChip, { STATUS_LABELS } from './StatusChip';
import translations from './translations';

const QuestionsTable: FC = () => {
  const { t } = useTranslation();

  const [questions, setQuestions] = useState<ProgrammingUpgradeQuestionData[]>(
    [],
  );
  const [languages, setLanguages] = useState<
    Record<number, ProgrammingLanguageData>
  >({});
  // Per-row dropdown selection, defaulting to the newest available version.
  const [targets, setTargets] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState<ProgrammingUpgradeQuestionData[]>([]);

  // The table captures filterProps callbacks, so they must read the languages as of when they fire
  // rather than as of when the column list was built.
  const languagesRef = useRef<Record<number, ProgrammingLanguageData>>({});
  languagesRef.current = languages;

  const load = useCallback(async (): Promise<void> => {
    const data = await fetchQuestions();

    setQuestions(data.questions);
    setLanguages(
      Object.fromEntries(
        data.languages.map((language) => [language.id, language]),
      ),
    );
    setTargets((current) =>
      Object.fromEntries(
        data.questions.map((question) => [
          question.id,
          current[question.id] ?? question.upgradeTargetIds[0],
        ]),
      ),
    );
  }, []);

  /** Folds polled upgrade rows back into the questions already on screen. */
  const applyUpgrades = useCallback(
    (upgrades: ProgrammingUpgradeData[]): void => {
      const byQuestion = Object.fromEntries(
        upgrades.map((upgrade) => [upgrade.questionId, upgrade]),
      );

      setQuestions((current) =>
        current.map((question) =>
          question.id in byQuestion
            ? { ...question, upgrade: byQuestion[question.id] }
            : question,
        ),
      );
    },
    [],
  );

  // Only rows actually waiting on an import job are worth re-reading. Keyed on the watched ids
  // rather than `questions`, so a poll that changes nothing else does not tear down and re-arm the
  // interval (which would reset the countdown on every tick).
  const watchedIds = questions
    .filter((question) => isInProgress(question.upgrade))
    .map((question) => question.id);
  const watchedKey = watchedIds.join(',');

  useEffect(() => {
    if (watchedKey === '') return undefined;

    const ids = watchedKey.split(',').map(Number);

    const poller = setInterval(async () => {
      const data = await fetchUpgrades(ids);
      applyUpgrades(data.upgrades);

      // A revert that succeeded destroys its row, so it comes back absent rather than completed.
      const returned = new Set(
        data.upgrades.map((upgrade) => upgrade.questionId),
      );
      setQuestions((current) =>
        current.map((question) =>
          ids.includes(question.id) && !returned.has(question.id)
            ? { ...question, upgrade: undefined }
            : question,
        ),
      );
    }, UPGRADES_POLL_INTERVAL_MILLISECONDS);

    return () => clearInterval(poller);
  }, [watchedKey, applyUpgrades]);

  const runUpgrade = async (
    selected: ProgrammingUpgradeQuestionData[],
  ): Promise<void> => {
    if (selected.length === 0) return;

    setSubmitting(true);
    try {
      const data = await upgradeQuestions(
        Object.fromEntries(
          selected.map((question) => [question.id, targets[question.id]]),
        ),
      );

      applyUpgrades(data.upgrades);
      if (data.upgrades.length > 0) {
        toast.success(
          t(translations.upgradeStarted, { count: data.upgrades.length }),
        );
      }

      const rejected = Object.values(data.rejected);
      if (rejected.length > 0) {
        // Surface the reasons themselves — they name the specific question's problem.
        toast.warn(
          `${t(translations.upgradeRejected, { count: rejected.length })} ${rejected.join(' ')}`,
        );
      }
    } catch {
      toast.error(t(translations.upgradeFailed));
    } finally {
      setSubmitting(false);
    }
  };

  /** Warns before upgrading anything that already has submissions, since those get regraded. */
  const confirmThenUpgrade = (
    selected: ProgrammingUpgradeQuestionData[],
  ): void => {
    if (selected.length === 0) return;

    if (selected.some((question) => question.submissionCount > 0)) {
      setPending(selected);
    } else {
      runUpgrade(selected);
    }
  };

  const runRevert = async (
    question: ProgrammingUpgradeQuestionData,
  ): Promise<void> => {
    setSubmitting(true);
    try {
      const data = await revertQuestion(question.id);
      applyUpgrades(data.upgrades);
      toast.success(t(translations.revertStarted));
    } catch {
      toast.error(t(translations.revertFailed));
    } finally {
      setSubmitting(false);
    }
  };

  const isSelectable = (question: ProgrammingUpgradeQuestionData): boolean =>
    question.upgradable && !isInProgress(question.upgrade);

  const columns: ColumnTemplate<ProgrammingUpgradeQuestionData>[] = [
    {
      // A column needs its own accessor for the filter's faceting to find any values: without `of`
      // or `accessorFn`, columnsBuilder leaves accessorKey undefined and the dropdown comes up empty.
      id: 'assessment',
      accessorFn: (question): string => question.assessment?.title ?? '',
      title: t(translations.assessment),
      sortable: true,
      searchable: true,
      filterable: true,
      filterProps: {
        getValue: (question) =>
          question.assessment ? [question.assessment.title] : [],
        shouldInclude: (question, filterValue?: string[]): boolean => {
          if (!filterValue?.length) return true;

          return Boolean(
            question.assessment &&
              new Set(filterValue).has(question.assessment.title),
          );
        },
      },
      cell: (question) =>
        question.assessment ? (
          <Link opensInNewTab to={question.assessment.url}>
            {question.assessment.title}
          </Link>
        ) : (
          '-'
        ),
    },
    {
      of: 'title',
      title: t(translations.question),
      sortable: true,
      searchable: true,
      cell: (question) => question.title ?? '-',
    },
    {
      of: 'submissionCount',
      title: t(translations.submissionCount),
      sortable: true,
      cell: (question) => (
        <div className="flex items-center justify-center">
          <span className={`${NUM_CELL_CLASS_NAME} min-w-[4ch]`}>
            {question.submissionCount}
          </span>
        </div>
      ),
    },
    {
      of: 'languageId',
      title: t(translations.language),
      sortable: true,
      filterable: true,
      filterProps: {
        getValue: (question): string[] => {
          const name = languagesRef.current[question.languageId]?.name;

          return name ? [name] : [];
        },
        shouldInclude: (question, filterValue?: string[]): boolean => {
          if (!filterValue?.length) return true;

          const name = languagesRef.current[question.languageId]?.name;

          return Boolean(name && new Set(filterValue).has(name));
        },
      },
      cell: (question) => (
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap">
            {languages[question.languageId]?.name ?? '-'}
          </span>

          {question.upgradeTargetIds.length > 0 && (
            <>
              <ArrowForward color="disabled" fontSize="small" />

              <TextField
                disabled={isInProgress(question.upgrade) || submitting}
                // MUI sizes an input's text as body1 (1rem) regardless of `size`, while TableCell
                // uses body2 — so the field would otherwise read a step larger than the current
                // language beside it. text-sm is that same 0.875rem.
                InputProps={{ className: 'text-[1.4rem]' }}
                onChange={(e) =>
                  setTargets((current) => ({
                    ...current,
                    [question.id]: Number(e.target.value),
                  }))
                }
                select
                size="small"
                value={targets[question.id] ?? ''}
                variant="outlined"
              >
                {question.upgradeTargetIds.map((id) => (
                  <MenuItem key={id} className="text-[1.4rem]" value={id}>
                    {languages[id]?.name}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}
        </div>
      ),
    },
    {
      id: 'status',
      accessorFn: (question): string => {
        const status = statusOf(
          question,
          languagesRef.current[question.languageId],
        );

        return status ? t(STATUS_LABELS[status]) : '';
      },
      title: t(translations.status),
      sortable: true,
      filterable: true,
      filterProps: {
        getValue: (question): string[] => {
          const status = statusOf(
            question,
            languagesRef.current[question.languageId],
          );

          return status ? [t(STATUS_LABELS[status])] : [];
        },
        shouldInclude: (question, filterValue?: string[]): boolean => {
          if (!filterValue?.length) return true;

          const status = statusOf(
            question,
            languagesRef.current[question.languageId],
          );

          return Boolean(
            status && new Set(filterValue).has(t(STATUS_LABELS[status])),
          );
        },
      },
      cell: (question) => (
        <StatusChip
          language={languages[question.languageId]}
          question={question}
        />
      ),
    },
    {
      title: t(translations.actions),
      cell: (question): JSX.Element => {
        const target = targets[question.id];
        const revertTo = question.upgrade?.oldLanguageId;

        return (
          <div className="flex">
            {question.upgradeTargetIds.length > 0 && (
              <Tooltip title={t(translations.upgrade)}>
                <span>
                  <IconButton
                    color="primary"
                    // Nothing to do when the dropdown is already on the current version.
                    disabled={
                      submitting ||
                      isInProgress(question.upgrade) ||
                      !target ||
                      target === question.languageId
                    }
                    onClick={() => confirmThenUpgrade([question])}
                    size="small"
                  >
                    <Upgrade />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {question.upgrade?.workflowState === 'failed' && revertTo && (
              <Tooltip
                title={t(translations.revert, {
                  language: languages[revertTo]?.name ?? '',
                })}
              >
                <span>
                  <IconButton
                    color="primary"
                    disabled={submitting}
                    onClick={() => runRevert(question)}
                    size="small"
                  >
                    <Undo />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {question.editUrl && (
              <Tooltip title={t(translations.editQuestion)}>
                <span>
                  <IconButton
                    color="primary"
                    href={question.editUrl}
                    size="small"
                    target="_blank"
                  >
                    <Edit />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Preload render={<LoadingIndicator />} while={load}>
      <>
        <Table
          className="border-none -m-6"
          columns={columns}
          data={questions}
          getRowClassName={(question): string =>
            `programming_upgrade_question_${question.id} bg-slot-1 hover?:bg-slot-2 slot-1-white slot-2-neutral-100`
          }
          getRowEqualityData={(question): ProgrammingUpgradeQuestionData =>
            question
          }
          getRowId={(question): string => question.id.toString()}
          indexing={{ rowSelectable: isSelectable }}
          pagination={{
            rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
            showAllRows: true,
          }}
          search={{
            searchPlaceholder: t(translations.searchPlaceholder),
            searchProps: {
              shouldInclude: (question, filterValue?: string): boolean => {
                if (!filterValue) return true;

                const haystack =
                  `${question.title ?? ''} ${question.assessment?.title ?? ''}`.toLowerCase();

                return haystack.includes(filterValue.toLowerCase().trim());
              },
            },
          }}
          toolbar={{
            show: true,
            activeToolbar: (selected): JSX.Element => {
              const upgradable = selected.filter(isSelectable);

              return (
                <Button
                  color="primary"
                  disabled={upgradable.length === 0 || submitting}
                  onClick={() => confirmThenUpgrade(upgradable)}
                  startIcon={
                    submitting ? <CircularProgress size={20} /> : <Upgrade />
                  }
                  variant="contained"
                >
                  {t(translations.upgradeSelected, {
                    count: upgradable.length,
                  })}
                </Button>
              );
            },
            keepNative: true,
          }}
        />

        <Prompt
          onClickPrimary={() => {
            const selected = pending;
            setPending([]);
            runUpgrade(selected);
          }}
          onClose={() => setPending([])}
          open={pending.length > 0}
          primaryLabel={t(formTranslations.continue)}
        >
          <PromptText>
            {t(translations.regradeWarning, {
              questionCount: pending.length,
              // Summing the per-row count double-counts questions sharing an assessment, which is
              // what makes it track answers to regrade rather than submissions.
              answerCount: pending.reduce(
                (sum, q) => sum + q.submissionCount,
                0,
              ),
            })}
          </PromptText>
        </Prompt>
      </>
    </Preload>
  );
};

export default QuestionsTable;
