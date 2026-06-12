import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Alert,
  Checkbox,
  Collapse,
  IconButton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import type {
  AssessmentData,
  CategoryData,
  TabData,
} from 'types/course/gradebook';

import Prompt from 'lib/components/core/dialogs/Prompt';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { resolveTabWeights, usingDefaultWeights } from '../computeWeighted';
import { updateGradebookWeights } from '../operations';

const translations = defineMessages({
  promptTitle: {
    id: 'course.gradebook.ConfigureWeightsPrompt.promptTitle',
    defaultMessage: 'Configure contributions',
  },
  descriptionIntro: {
    id: 'course.gradebook.ConfigureWeightsPrompt.descriptionIntro',
    defaultMessage:
      "Control how tabs and assessments count toward each student's total grade.",
  },
  descriptionWeights: {
    id: 'course.gradebook.ConfigureWeightsPrompt.descriptionWeights',
    defaultMessage:
      "Set each tab's weight — how much it contributes to the total (weights should sum to 100).",
  },
  descriptionExclusion: {
    id: 'course.gradebook.ConfigureWeightsPrompt.descriptionExclusion',
    defaultMessage:
      'Expand a tab to include or exclude individual assessments from grading.',
  },
  descriptionModes: {
    id: 'course.gradebook.ConfigureWeightsPrompt.descriptionModes',
    defaultMessage:
      "Choose Equal (all assessments share the tab's weight) or Custom (set each assessment's share).",
  },
  descriptionDrop: {
    id: 'course.gradebook.ConfigureWeightsPrompt.descriptionDrop',
    defaultMessage:
      "In Equal mode, optionally drop each student's N lowest-scoring assessments before averaging.",
  },
  total: {
    id: 'course.gradebook.ConfigureWeightsPrompt.total',
    defaultMessage: 'Total: {sum}%',
  },
  weightsDoNotSum: {
    id: 'course.gradebook.ConfigureWeightsPrompt.weightsDoNotSum',
    defaultMessage:
      'Weights do not sum to 100. Saving is allowed; Total may be inaccurate.',
  },
  valueTooLow: {
    id: 'course.gradebook.ConfigureWeightsPrompt.valueTooLow',
    defaultMessage: 'Value must be at least 0',
  },
  valueTooHigh: {
    id: 'course.gradebook.ConfigureWeightsPrompt.valueTooHigh',
    defaultMessage: 'Value must be at most 100',
  },
  valueNotTwoDp: {
    id: 'course.gradebook.ConfigureWeightsPrompt.valueNotTwoDp',
    defaultMessage: 'Value can have at most 2 decimal places',
  },
  saveError: {
    id: 'course.gradebook.ConfigureWeightsPrompt.saveError',
    defaultMessage: 'Failed to save weights. Please try again.',
  },
  ofGrade: {
    id: 'course.gradebook.ConfigureWeightsPrompt.ofGrade',
    defaultMessage: '{pct}% of grade',
  },
  equalMode: {
    id: 'course.gradebook.ConfigureWeightsPrompt.equalMode',
    defaultMessage: 'Equal',
  },
  customMode: {
    id: 'course.gradebook.ConfigureWeightsPrompt.customMode',
    defaultMessage: 'Custom',
  },
  modeAria: {
    id: 'course.gradebook.ConfigureWeightsPrompt.modeAria',
    defaultMessage: '{tab} weight mode',
  },
  customSum: {
    id: 'course.gradebook.ConfigureWeightsPrompt.customSum',
    defaultMessage: 'Assessment weights: {sum} / {total}',
  },
  unbalanced: {
    id: 'course.gradebook.ConfigureWeightsPrompt.unbalanced',
    defaultMessage:
      'Assessment weights for "{tab}" must sum to its tab total before saving.',
  },
  includeAssessment: {
    id: 'course.gradebook.ConfigureWeightsPrompt.includeAssessment',
    defaultMessage: 'Include {assessment} in grade',
  },
  excluded: {
    id: 'course.gradebook.ConfigureWeightsPrompt.excluded',
    defaultMessage: 'Excluded',
  },
  allExcluded: {
    id: 'course.gradebook.ConfigureWeightsPrompt.allExcluded',
    defaultMessage:
      'All assessments in "{tab}" are excluded — it contributes nothing to the total.',
  },
  excludedCount: {
    id: 'course.gradebook.ConfigureWeightsPrompt.excludedCount',
    defaultMessage: '{n} excluded',
  },
  allExcludedCount: {
    id: 'course.gradebook.ConfigureWeightsPrompt.allExcludedCount',
    defaultMessage: 'All {n} excluded',
  },
  defaultsHint: {
    id: 'course.gradebook.ConfigureWeightsPrompt.defaultsHint',
    defaultMessage:
      'No weights set yet — these are suggested defaults with every tab counting equally. Save to confirm, or adjust below.',
  },
});

type WeightMode = 'equal' | 'custom';

const r2 = (n: number): number => Math.round(n * 100) / 100;
const cents = (n: number): number => Math.round(n * 100);
const is2dp = (n: number): boolean =>
  Math.abs(n * 100 - Math.round(n * 100)) < 1e-9;

// Distribute a tab total across assessment ids at 2dp; the last id absorbs the rounding
// remainder so the seeded values sum back exactly to total.
const distributeEqual = (
  total: number,
  ids: number[],
): Record<number, number> => {
  const result: Record<number, number> = {};
  const n = ids.length;
  if (n === 0) return result;
  const base = r2(total / n);
  ids.forEach((id, i) => {
    result[id] = i === n - 1 ? r2(total - base * (n - 1)) : base;
  });
  return result;
};

interface Props {
  open: boolean;
  onClose: () => void;
  categories: CategoryData[];
  tabs: TabData[];
  assessments: AssessmentData[];
}

const ConfigureWeightsPrompt: FC<Props> = ({
  open,
  onClose,
  categories,
  tabs,
  assessments,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Pre-fill from the same equal-split default the table shows when no weights
  // are configured, so opening the dialog confirms what is already on screen
  // rather than presenting a blank 0%.
  const resolvedTabs = resolveTabWeights(tabs, assessments);
  const showingDefaults = usingDefaultWeights(tabs, assessments);

  const validate = (value: number): string | null => {
    if (Number.isNaN(value)) return t(translations.valueTooLow);
    if (value < 0) return t(translations.valueTooLow);
    if (value > 100) return t(translations.valueTooHigh);
    if (!is2dp(value)) return t(translations.valueNotTwoDp);
    return null;
  };

  const seedWeights = (): Record<number, number> =>
    Object.fromEntries(
      resolvedTabs.map((tb) => [tb.id, tb.gradebookWeight ?? 0]),
    );
  const seedModes = (): Record<number, WeightMode> =>
    Object.fromEntries(
      resolvedTabs.map((tb) => [tb.id, tb.weightMode ?? 'equal']),
    );
  const seedAssessmentWeights = (): Record<number, number> =>
    Object.fromEntries(assessments.map((a) => [a.id, a.gradebookWeight ?? 0]));
  const seedExclusions = (): Record<number, boolean> =>
    Object.fromEntries(assessments.map((a) => [a.id, !!a.gradebookExcluded]));

  const [weights, setWeights] = useState<Record<number, number>>(seedWeights);
  const [modes, setModes] = useState<Record<number, WeightMode>>(seedModes);
  const [assessmentWeights, setAssessmentWeights] = useState<
    Record<number, number>
  >(seedAssessmentWeights);
  const [excluded, setExcluded] =
    useState<Record<number, boolean>>(seedExclusions);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setWeights(seedWeights());
      setModes(seedModes());
      setAssessmentWeights(seedAssessmentWeights());
      setExcluded(seedExclusions());
      setExpanded({});
    }
  }, [open]);

  const tabAssessmentIds = (tabId: number): number[] =>
    assessments.filter((a) => a.tabId === tabId).map((a) => a.id);

  const tabIncludedIds = (tabId: number): number[] =>
    tabAssessmentIds(tabId).filter((id) => !excluded[id]);

  const customSum = (tabId: number): number =>
    tabIncludedIds(tabId).reduce(
      (acc, id) => acc + (assessmentWeights[id] ?? 0),
      0,
    );

  const isUnbalanced = (tabId: number): boolean =>
    (modes[tabId] ?? 'equal') === 'custom' &&
    tabIncludedIds(tabId).length > 0 &&
    cents(customSum(tabId)) !== cents(weights[tabId] ?? 0);

  const isAllExcluded = (tabId: number): boolean =>
    tabAssessmentIds(tabId).length > 0 && tabIncludedIds(tabId).length === 0;

  // An all-excluded tab contributes nothing, so its stored weight is treated as 0
  // for the Total. The stored value is retained (still saved, restored on re-include).
  const effectiveWeight = (tabId: number): number =>
    isAllExcluded(tabId) ? 0 : weights[tabId] ?? 0;

  const sum = tabs.reduce((acc, tb) => acc + effectiveWeight(tb.id), 0);
  const hasInvalid =
    Object.values(weights).some((w) => validate(w) !== null) ||
    Object.values(assessmentWeights).some((w) => validate(w) !== null);
  const hasUnbalanced = tabs.some((tb) => isUnbalanced(tb.id));

  const handleChange = (tabId: number, raw: string): void => {
    const parsed = raw === '' ? 0 : Number(raw);
    setWeights((prev) => ({ ...prev, [tabId]: parsed }));
  };

  const handleAssessmentChange = (assessmentId: number, raw: string): void => {
    const parsed = raw === '' ? 0 : Number(raw);
    setAssessmentWeights((prev) => ({ ...prev, [assessmentId]: parsed }));
  };

  const handleToggleExcluded = (assessmentId: number): void =>
    setExcluded((prev) => ({ ...prev, [assessmentId]: !prev[assessmentId] }));

  const handleModeChange = (tabId: number, next: WeightMode | null): void => {
    if (!next) return; // ToggleButtonGroup emits null when clicking the active button
    setModes((prev) => ({ ...prev, [tabId]: next }));
    if (next === 'custom') {
      const includedIds = tabIncludedIds(tabId);
      const allZero = includedIds.every(
        (id) => (assessmentWeights[id] ?? 0) === 0,
      );
      if (allZero) {
        const seeded = distributeEqual(weights[tabId] ?? 0, includedIds);
        setAssessmentWeights((prev) => ({ ...prev, ...seeded }));
      }
      setExpanded((prev) => ({ ...prev, [tabId]: true }));
    }
  };

  const toggleExpanded = (tabId: number): void =>
    setExpanded((prev) => ({ ...prev, [tabId]: !prev[tabId] }));

  const handleSave = async (): Promise<void> => {
    if (hasInvalid || hasUnbalanced) return;
    setSubmitting(true);
    try {
      await dispatch(
        updateGradebookWeights(
          tabs.map((tb) => {
            const mode = modes[tb.id] ?? 'equal';
            const entry = {
              tabId: tb.id,
              weight: weights[tb.id] ?? 0,
              weightMode: mode,
              excludedAssessmentIds: tabAssessmentIds(tb.id).filter(
                (id) => excluded[id],
              ),
            };
            if (mode === 'custom') {
              return {
                ...entry,
                assessmentWeights: tabAssessmentIds(tb.id).map((id) => ({
                  assessmentId: id,
                  weight: assessmentWeights[id] ?? 0,
                })),
              };
            }
            return entry;
          }),
        ),
      );
      onClose();
    } catch {
      toast.error(t(translations.saveError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Prompt
      onClickPrimary={handleSave}
      onClose={onClose}
      open={open}
      primaryDisabled={submitting || hasInvalid || hasUnbalanced}
      primaryLabel={t(formTranslations.save)}
      title={t(translations.promptTitle)}
    >
      {showingDefaults && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t(translations.defaultsHint)}
        </Alert>
      )}
      <Typography color="text.secondary" gutterBottom variant="body2">
        {t(translations.descriptionIntro)}
      </Typography>
      <ul style={{ margin: '4px 0 16px', paddingLeft: 20 }}>
        {[
          translations.descriptionWeights,
          translations.descriptionExclusion,
          translations.descriptionModes,
        ].map((key) => (
          <Typography
            key={key.id}
            color="text.secondary"
            component="li"
            variant="body2"
          >
            {t(key)}
          </Typography>
        ))}
      </ul>
      <Stack spacing={2} sx={{ mt: 2 }}>
        {categories.map((cat) => (
          <div key={cat.id}>
            <Typography variant="subtitle2">{cat.title}</Typography>
            <Stack spacing={0.5} sx={{ pl: 1, mt: 1 }}>
              {tabs
                .filter((tb) => tb.categoryId === cat.id)
                .map((tb) => {
                  const value = weights[tb.id] ?? 0;
                  const err = validate(value);
                  const tabAssessments = assessments.filter(
                    (a) => a.tabId === tb.id,
                  );
                  const mode = modes[tb.id] ?? 'equal';
                  const isExpanded = !!expanded[tb.id];
                  const unbalanced = isUnbalanced(tb.id);
                  const noAssessments = tabAssessments.length === 0;
                  const includedCount = tabIncludedIds(tb.id).length;
                  const excludedCount = tabAssessments.length - includedCount;
                  const pct = includedCount > 0 ? r2(value / includedCount) : 0;

                  return (
                    <div key={tb.id}>
                      <div className="flex items-center gap-1">
                        <IconButton
                          disabled={noAssessments}
                          onClick={() => toggleExpanded(tb.id)}
                          size="small"
                        >
                          {isExpanded ? (
                            <ExpandLess fontSize="small" />
                          ) : (
                            <ExpandMore fontSize="small" />
                          )}
                        </IconButton>
                        <Typography className="flex-1" variant="body2">
                          {tb.title}
                          {excludedCount > 0 && (
                            <>
                              {' · '}
                              <Typography
                                color="text.secondary"
                                component="span"
                                variant="caption"
                              >
                                {isAllExcluded(tb.id)
                                  ? t(translations.allExcludedCount, {
                                      n: excludedCount,
                                    })
                                  : t(translations.excludedCount, {
                                      n: excludedCount,
                                    })}
                              </Typography>
                            </>
                          )}
                        </Typography>
                        <ToggleButtonGroup
                          aria-label={t(translations.modeAria, {
                            tab: tb.title,
                          })}
                          disabled={noAssessments}
                          exclusive
                          onChange={(_, next) =>
                            handleModeChange(tb.id, next as WeightMode | null)
                          }
                          size="small"
                          value={mode}
                        >
                          <ToggleButton value="equal">
                            {t(translations.equalMode)}
                          </ToggleButton>
                          <ToggleButton value="custom">
                            {t(translations.customMode)}
                          </ToggleButton>
                        </ToggleButtonGroup>
                        <TextField
                          disabled={isAllExcluded(tb.id)}
                          error={err !== null}
                          inputProps={{
                            'aria-label': tb.title,
                            min: 0,
                            max: 100,
                            step: 0.01,
                          }}
                          onChange={(e) => handleChange(tb.id, e.target.value)}
                          size="small"
                          sx={{ width: 96 }}
                          type="number"
                          value={isAllExcluded(tb.id) ? 0 : value}
                        />
                      </div>
                      {err && (
                        <Typography
                          className="pl-9"
                          color="error"
                          variant="caption"
                        >
                          {err}
                        </Typography>
                      )}
                      {unbalanced && (
                        <Alert severity="error" sx={{ mt: 1, ml: 4.5 }}>
                          {t(translations.unbalanced, { tab: tb.title })}
                        </Alert>
                      )}
                      {isAllExcluded(tb.id) && (
                        <Alert severity="warning" sx={{ mt: 1, ml: 4.5 }}>
                          {t(translations.allExcluded, { tab: tb.title })}
                        </Alert>
                      )}
                      <Collapse in={isExpanded}>
                        <Stack spacing={0} sx={{ pl: 4.5, pt: 0.5, pb: 0.5 }}>
                          {tabAssessments.map((a) => {
                            const isExcluded = !!excluded[a.id];
                            const checkbox = (
                              <Checkbox
                                checked={!isExcluded}
                                inputProps={{
                                  'aria-label': t(
                                    translations.includeAssessment,
                                    {
                                      assessment: a.title,
                                    },
                                  ),
                                }}
                                onChange={() => handleToggleExcluded(a.id)}
                                size="small"
                              />
                            );
                            if (mode === 'custom') {
                              const awValue = assessmentWeights[a.id] ?? 0;
                              const awErr = validate(awValue);
                              return (
                                <div
                                  key={a.id}
                                  className="flex items-center justify-between py-0.5"
                                >
                                  <div className="flex items-center">
                                    {checkbox}
                                    <Typography
                                      color="text.secondary"
                                      variant="caption"
                                    >
                                      {a.title}
                                    </Typography>
                                  </div>
                                  {isExcluded ? (
                                    <Typography
                                      color="text.disabled"
                                      variant="caption"
                                    >
                                      {t(translations.excluded)}
                                    </Typography>
                                  ) : (
                                    <TextField
                                      error={awErr !== null}
                                      inputProps={{
                                        'aria-label': `${tb.title}: ${a.title}`,
                                        min: 0,
                                        step: 0.01,
                                      }}
                                      onChange={(e) =>
                                        handleAssessmentChange(
                                          a.id,
                                          e.target.value,
                                        )
                                      }
                                      size="small"
                                      sx={{ width: 88 }}
                                      type="number"
                                      value={awValue}
                                    />
                                  )}
                                </div>
                              );
                            }
                            return (
                              <div
                                key={a.id}
                                className="flex items-center justify-between py-0.5"
                              >
                                <div className="flex items-center">
                                  {checkbox}
                                  <Typography
                                    color="text.secondary"
                                    variant="caption"
                                  >
                                    {a.title}
                                  </Typography>
                                </div>
                                <Typography
                                  color="text.disabled"
                                  variant="caption"
                                >
                                  {isExcluded
                                    ? t(translations.excluded)
                                    : t(translations.ofGrade, {
                                        pct: pct.toFixed(2),
                                      })}
                                </Typography>
                              </div>
                            );
                          })}
                          {mode === 'custom' && (
                            <Typography
                              className="pt-1"
                              color={unbalanced ? 'error' : 'text.secondary'}
                              variant="caption"
                            >
                              {t(translations.customSum, {
                                sum: r2(customSum(tb.id)).toFixed(2),
                                total: value.toFixed(2),
                              })}
                            </Typography>
                          )}
                        </Stack>
                      </Collapse>
                    </div>
                  );
                })}
            </Stack>
          </div>
        ))}
      </Stack>
      <Typography sx={{ mt: 3, fontWeight: 500 }}>
        {t(translations.total, { sum })}
      </Typography>
      {sum !== 100 && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {t(translations.weightsDoNotSum)}
        </Alert>
      )}
    </Prompt>
  );
};

export default ConfigureWeightsPrompt;
