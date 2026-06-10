import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Alert,
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

import { updateGradebookWeights } from '../operations';

const translations = defineMessages({
  dialogTitle: {
    id: 'course.gradebook.ConfigureWeightsDialog.dialogTitle',
    defaultMessage: 'Configure tab weights',
  },
  description: {
    id: 'course.gradebook.ConfigureWeightsDialog.description',
    defaultMessage:
      'Set how much each tab contributes to the total grade. Weights should sum to 100.',
  },
  total: {
    id: 'course.gradebook.ConfigureWeightsDialog.total',
    defaultMessage: 'Total: {sum}%',
  },
  weightsDoNotSum: {
    id: 'course.gradebook.ConfigureWeightsDialog.weightsDoNotSum',
    defaultMessage:
      'Weights do not sum to 100. Saving is allowed; Total may be inaccurate.',
  },
  save: {
    id: 'course.gradebook.ConfigureWeightsDialog.save',
    defaultMessage: 'Save',
  },
  valueTooLow: {
    id: 'course.gradebook.ConfigureWeightsDialog.valueTooLow',
    defaultMessage: 'Value must be at least 0',
  },
  valueTooHigh: {
    id: 'course.gradebook.ConfigureWeightsDialog.valueTooHigh',
    defaultMessage: 'Value must be at most 100',
  },
  valueNotTwoDp: {
    id: 'course.gradebook.ConfigureWeightsDialog.valueNotTwoDp',
    defaultMessage: 'Value can have at most 2 decimal places',
  },
  saveError: {
    id: 'course.gradebook.ConfigureWeightsDialog.saveError',
    defaultMessage: 'Failed to save weights. Please try again.',
  },
  ofGrade: {
    id: 'course.gradebook.ConfigureWeightsDialog.ofGrade',
    defaultMessage: '{pct}% of grade',
  },
  equalMode: {
    id: 'course.gradebook.ConfigureWeightsDialog.equalMode',
    defaultMessage: 'Equal',
  },
  customMode: {
    id: 'course.gradebook.ConfigureWeightsDialog.customMode',
    defaultMessage: 'Custom',
  },
  modeAria: {
    id: 'course.gradebook.ConfigureWeightsDialog.modeAria',
    defaultMessage: '{tab} weight mode',
  },
  customSum: {
    id: 'course.gradebook.ConfigureWeightsDialog.customSum',
    defaultMessage: 'Assessment weights: {sum} / {total}',
  },
  unbalanced: {
    id: 'course.gradebook.ConfigureWeightsDialog.unbalanced',
    defaultMessage:
      'Assessment weights for "{tab}" must sum to its tab total before saving.',
  },
});

type WeightMode = 'equal' | 'custom';

const r2 = (n: number): number => Math.round(n * 100) / 100;
const cents = (n: number): number => Math.round(n * 100);
const is2dp = (n: number): boolean => Math.abs(n * 100 - Math.round(n * 100)) < 1e-9;

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

  const validate = (value: number): string | null => {
    if (Number.isNaN(value)) return t(translations.valueTooLow);
    if (value < 0) return t(translations.valueTooLow);
    if (value > 100) return t(translations.valueTooHigh);
    if (!is2dp(value)) return t(translations.valueNotTwoDp);
    return null;
  };

  const seedWeights = (): Record<number, number> =>
    Object.fromEntries(tabs.map((tb) => [tb.id, tb.gradebookWeight ?? 0]));
  const seedModes = (): Record<number, WeightMode> =>
    Object.fromEntries(tabs.map((tb) => [tb.id, tb.weightMode ?? 'equal']));
  const seedAssessmentWeights = (): Record<number, number> =>
    Object.fromEntries(assessments.map((a) => [a.id, a.gradebookWeight ?? 0]));

  const [weights, setWeights] = useState<Record<number, number>>(seedWeights);
  const [modes, setModes] = useState<Record<number, WeightMode>>(seedModes);
  const [assessmentWeights, setAssessmentWeights] = useState<
    Record<number, number>
  >(seedAssessmentWeights);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setWeights(seedWeights());
      setModes(seedModes());
      setAssessmentWeights(seedAssessmentWeights());
      setExpanded({});
    }
  }, [open]);

  const tabAssessmentIds = (tabId: number): number[] =>
    assessments.filter((a) => a.tabId === tabId).map((a) => a.id);

  const customSum = (tabId: number): number =>
    tabAssessmentIds(tabId).reduce(
      (acc, id) => acc + (assessmentWeights[id] ?? 0),
      0,
    );

  const isUnbalanced = (tabId: number): boolean =>
    (modes[tabId] ?? 'equal') === 'custom' &&
    tabAssessmentIds(tabId).length > 0 &&
    cents(customSum(tabId)) !== cents(weights[tabId] ?? 0);

  const sum = Object.values(weights).reduce((acc, w) => acc + w, 0);
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

  const handleModeChange = (tabId: number, next: WeightMode | null): void => {
    if (!next) return; // ToggleButtonGroup emits null when clicking the active button
    setModes((prev) => ({ ...prev, [tabId]: next }));
    if (next === 'custom') {
      const ids = tabAssessmentIds(tabId);
      const allZero = ids.every((id) => (assessmentWeights[id] ?? 0) === 0);
      if (allZero) {
        const seeded = distributeEqual(weights[tabId] ?? 0, ids);
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
      primaryLabel={t(translations.save)}
      title={t(translations.dialogTitle)}
    >
      <Typography color="text.secondary" gutterBottom variant="body2">
        {t(translations.description)}
      </Typography>
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
                  const n = tabAssessments.length;

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
                          value={value}
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
                      <Collapse in={isExpanded}>
                        <Stack spacing={0} sx={{ pl: 4.5, pt: 0.5, pb: 0.5 }}>
                          {tabAssessments.map((a) => {
                            if (mode === 'custom') {
                              const awValue = assessmentWeights[a.id] ?? 0;
                              const awErr = validate(awValue);
                              return (
                                <div
                                  key={a.id}
                                  className="flex items-center justify-between py-0.5"
                                >
                                  <Typography
                                    color="text.secondary"
                                    variant="caption"
                                  >
                                    {a.title}
                                  </Typography>
                                  <TextField
                                    error={awErr !== null}
                                    inputProps={{
                                      'aria-label': `${tb.title}: ${a.title}`,
                                      min: 0,
                                      step: 0.01,
                                    }}
                                    onChange={(e) =>
                                      handleAssessmentChange(a.id, e.target.value)
                                    }
                                    size="small"
                                    sx={{ width: 88 }}
                                    type="number"
                                    value={awValue}
                                  />
                                </div>
                              );
                            }
                            const pct = n > 0 ? r2(value / n) : 0;
                            return (
                              <div
                                key={a.id}
                                className="flex items-center justify-between py-0.5"
                              >
                                <Typography
                                  color="text.secondary"
                                  variant="caption"
                                >
                                  {a.title}
                                </Typography>
                                <Typography
                                  color="text.disabled"
                                  variant="caption"
                                >
                                  {t(translations.ofGrade, {
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
