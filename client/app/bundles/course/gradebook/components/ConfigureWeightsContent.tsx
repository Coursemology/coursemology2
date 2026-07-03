import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  InfoOutlined,
  KeyboardArrowDown,
  KeyboardArrowRight,
} from '@mui/icons-material';
import {
  Alert,
  Checkbox,
  Collapse,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type {
  AssessmentData,
  CategoryData,
  LevelContributionData,
  LevelContributionSaveData,
  StudentData,
  TabData,
} from 'types/course/gradebook';

import SegmentedSwitch from 'lib/components/core/buttons/SegmentedSwitch';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import type { LevelOffender } from '../computeWeighted';
import {
  levelOffenders,
  resolveTabWeights,
  usingDefaultWeights,
} from '../computeWeighted';
import {
  ParsedFormula,
  parseFormula,
  seedLevelFormula,
  serializeFormula,
} from '../levelFormula';
import { updateGradebookWeights } from '../operations';

const translations = defineMessages({
  descriptionIntro: {
    id: 'course.gradebook.ConfigureWeightsPrompt.descriptionIntro',
    defaultMessage:
      "Control how tabs and assessments count toward each student's total grade.",
  },
  descriptionWeights: {
    id: 'course.gradebook.ConfigureWeightsPrompt.descriptionWeights',
    defaultMessage:
      "Set each tab's weight - how much it contributes to the total (weights should sum to 100).",
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
  keepHighestLabel: {
    id: 'course.gradebook.ConfigureWeightsPrompt.keepHighestLabel',
    defaultMessage: 'Keep highest',
  },
  keepHighestAria: {
    id: 'course.gradebook.ConfigureWeightsPrompt.keepHighestAria',
    defaultMessage: 'Keep highest for {tab}',
  },
  keepHighestToggleAria: {
    id: 'course.gradebook.ConfigureWeightsPrompt.keepHighestToggleAria',
    defaultMessage: 'Enable keep highest for {tab}',
  },
  keepInvalid: {
    id: 'course.gradebook.ConfigureWeightsPrompt.keepInvalid',
    defaultMessage: 'Keep at least 1 (whole number)',
  },
  keepSubtitle: {
    id: 'course.gradebook.ConfigureWeightsPrompt.keepSubtitle',
    defaultMessage:
      '— keeps highest {keep} of {included} · each counts as {pct}%',
  },
  keepOverflowWarning: {
    id: 'course.gradebook.ConfigureWeightsPrompt.keepOverflowWarning',
    defaultMessage:
      '"{tab}" keeps more assessments than it contains — all of them will count.',
  },
  descriptionKeep: {
    id: 'course.gradebook.ConfigureWeightsPrompt.descriptionKeep',
    defaultMessage:
      "In Equal mode, optionally keep only each student's N highest-scoring assessments.",
  },
  total: {
    id: 'course.gradebook.ConfigureWeightsPrompt.total',
    defaultMessage: 'Total: {sum}%',
  },
  weightsOverHundred: {
    id: 'course.gradebook.ConfigureWeightsPrompt.weightsOverHundred',
    defaultMessage:
      "Weights sum to more than 100%, so student totals can exceed 100%. Turn on 'Cap at 100%' to show and export them as 100%, or set weights to sum to 100%. Saving is still allowed.",
  },
  weightsUnderHundred: {
    id: 'course.gradebook.ConfigureWeightsPrompt.weightsUnderHundred',
    defaultMessage:
      'Weights sum to less than 100%, so no student can reach a 100% total. Set weights to sum to 100% if that is unintended. Saving is still allowed.',
  },
  capToggle: {
    id: 'course.gradebook.ConfigureWeightsPrompt.capToggle',
    defaultMessage: 'Cap at 100%',
  },
  capInfo: {
    id: 'course.gradebook.ConfigureWeightsPrompt.capInfo',
    defaultMessage: 'About capping the total at 100%',
  },
  capInfoBody: {
    id: 'course.gradebook.ConfigureWeightsPrompt.capInfoBody',
    defaultMessage:
      'When on, any weighted total above 100% is shown and exported as 100%. ' +
      'Per-tab percentages still show what each student earned. Turn this off to ' +
      'see raw totals.',
  },
  valueTooLow: {
    id: 'course.gradebook.ConfigureWeightsPrompt.valueTooLow',
    defaultMessage: 'Value must be at least 0',
  },
  valueTooHigh: {
    id: 'course.gradebook.ConfigureWeightsPrompt.valueTooHigh',
    defaultMessage: 'Value must be at most 100',
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
      'All assessments in "{tab}" are excluded - it contributes nothing to the total.',
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
      'No weights set yet - these are suggested defaults with every tab counting equally. Save to confirm, or adjust below.',
  },
  levelTitle: {
    id: 'course.gradebook.ConfigureWeightsPrompt.levelTitle',
    defaultMessage: 'Level contribution',
  },
  levelSubtitle: {
    id: 'course.gradebook.ConfigureWeightsPrompt.levelSubtitle',
    defaultMessage:
      "Adds grade-points from each student's level, on top of tab contributions.",
  },
  levelHighestStudent: {
    id: 'course.gradebook.ConfigureWeightsPrompt.levelHighestStudent',
    defaultMessage: 'Highest student level: {level}',
  },
  levelCourseMax: {
    id: 'course.gradebook.ConfigureWeightsPrompt.levelCourseMax',
    defaultMessage: 'Course maximum level: {courseMaxLevel}',
  },
  levelClampLabel: {
    id: 'course.gradebook.ConfigureWeightsPrompt.levelClampLabel',
    defaultMessage: 'Keep results between 0 and max level contributions',
  },
  levelFormulaLabel: {
    id: 'course.gradebook.ConfigureWeightsPrompt.levelFormulaLabel',
    defaultMessage: 'Formula',
  },
  levelFormulaHelper: {
    id: 'course.gradebook.ConfigureWeightsPrompt.levelFormulaHelper',
    defaultMessage:
      'The formula may use numbers, arithmetic operators (+ − * /), parentheses, the variable "level", and the functions floor, ceil, round, min and max.',
  },
  levelShowLabel: {
    id: 'course.gradebook.ConfigureWeightsPrompt.levelShowLabel',
    defaultMessage: 'Show level column in table',
  },
  levelOffendersAbove: {
    id: 'course.gradebook.ConfigureWeightsPrompt.levelOffendersAbove',
    defaultMessage:
      '{count, plural, =1 {{name1} is above {max}.} =2 {{name1} and {name2} are above {max}.} other {{name1}, {name2} and {extra} more are above {max}.}}',
  },
  levelOffendersBelow: {
    id: 'course.gradebook.ConfigureWeightsPrompt.levelOffendersBelow',
    defaultMessage:
      '{count, plural, =1 {{name1} is below 0.} =2 {{name1} and {name2} are below 0.} other {{name1}, {name2} and {extra} more are below 0.}}',
  },
  levelFixAtMost: {
    id: 'course.gradebook.ConfigureWeightsPrompt.levelFixAtMost',
    defaultMessage: 'These contributions will be set to {max}.',
  },
  levelFixAtLeast: {
    id: 'course.gradebook.ConfigureWeightsPrompt.levelFixAtLeast',
    defaultMessage: 'These contributions will be set to 0.',
  },
  levelFixBetween: {
    id: 'course.gradebook.ConfigureWeightsPrompt.levelFixBetween',
    defaultMessage:
      'Contributions below 0 will be set to 0, and contributions above {max} will be set to {max}.',
  },
  levelUnscoreable: {
    id: 'course.gradebook.ConfigureWeightsPrompt.levelUnscoreable',
    defaultMessage:
      '{count, plural, =1 {The formula divides by zero for {name1}, so their level contribution is set to 0.} =2 {The formula divides by zero for {name1} and {name2}, so their level contributions are set to 0.} other {The formula divides by zero for {name1}, {name2} and {extra} more, so their level contributions are set to 0.}}',
  },
});

type WeightMode = 'equal' | 'custom';

const r2 = (n: number): number => Math.round(n * 100) / 100;
const cents = (n: number): number => Math.round(n * 100);
// "Bob (60.00)" — student name with their contribution at 2dp, for the warning.
const fmtOffender = (o: LevelOffender): string =>
  `${o.name} (${r2(o.value).toFixed(2)})`;
// "Bob (level 0)" — student name with their level, for the divide-by-zero warning
// (the contribution value is undefined, so we show level instead).
const fmtUnscoreable = (o: LevelOffender): string =>
  `${o.name} (level ${o.level})`;
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

export interface ConfigureWeightsContentProps {
  categories: CategoryData[];
  tabs: TabData[];
  assessments: AssessmentData[];
  gamificationEnabled: boolean;
  courseMaxLevel: number;
  levelContribution: LevelContributionData;
  capTotal: boolean;
  students: StudentData[];
  // Called after a successful save-and-close.
  onSaved: () => void;
  // Lets the host wire its footer Save button to this body's save handler.
  registerSave: (fn: () => Promise<void>, canSave: boolean) => void;
}

const ConfigureWeightsContent: FC<ConfigureWeightsContentProps> = ({
  categories,
  tabs,
  assessments,
  gamificationEnabled,
  courseMaxLevel,
  levelContribution,
  capTotal,
  students,
  onSaved,
  registerSave,
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

  const seedKeepHighest = (): Record<number, number> =>
    Object.fromEntries(resolvedTabs.map((tb) => [tb.id, tb.keepHighest ?? 0]));
  const seedKeepOn = (): Record<number, boolean> =>
    Object.fromEntries(
      resolvedTabs.map((tb) => [tb.id, (tb.keepHighest ?? 0) > 0]),
    );

  const [weights, setWeights] = useState<Record<number, number>>(seedWeights);
  const [modes, setModes] = useState<Record<number, WeightMode>>(seedModes);
  const [assessmentWeights, setAssessmentWeights] = useState<
    Record<number, number>
  >(seedAssessmentWeights);
  const [excluded, setExcluded] =
    useState<Record<number, boolean>>(seedExclusions);
  const [keepHighest, setKeepHighest] =
    useState<Record<number, number>>(seedKeepHighest);
  const [keepOn, setKeepOn] = useState<Record<number, boolean>>(seedKeepOn);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const [levelEnabled, setLevelEnabled] = useState(levelContribution.enabled);
  const [levelFormula, setLevelFormula] = useState(
    levelContribution.formula || seedLevelFormula,
  );
  // Seed the suggested maximum to the course's top level.
  const [levelWeight, setLevelWeight] = useState(
    levelContribution.weight || courseMaxLevel,
  );
  const [levelShow, setLevelShow] = useState(levelContribution.show);
  const [levelClamp, setLevelClamp] = useState(levelContribution.clamp);
  const [capEnabled, setCapEnabled] = useState(capTotal);

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

  // Parse whenever enabled — including an empty string, which parseFormula reports as
  // { ok: false, error: 'Enter a formula.' } so Save is blocked and the field flags it.
  const parsedLevel: ParsedFormula | null = levelEnabled
    ? parseFormula(levelFormula)
    : null;
  const levelParseError =
    parsedLevel && !parsedLevel.ok ? parsedLevel.error : null;
  // Students whose contribution falls outside [0, levelWeight], split by bound —
  // the out-of-range warning names the worst offenders on each side.
  const offenders = levelOffenders(students, parsedLevel, levelWeight);
  // The cohort's real top level — distinct from courseMaxLevel (the course ceiling).
  // Helps staff pick a sensible cap; null when there are no students to read.
  const highestStudentLevel = students.length
    ? Math.max(...students.map((s) => s.level))
    : null;
  // Which bound(s) the cohort breaches — drives a message scoped to the actual
  // problem (only-below, only-above, or both).
  const hasBelow = offenders.below.length > 0;
  const hasAbove = offenders.above.length > 0;
  const hasUnscoreable = offenders.unscoreable.length > 0;
  // Fix instruction matching the breached bound(s).
  let levelFixMessage = translations.levelFixAtLeast;
  if (hasBelow && hasAbove) levelFixMessage = translations.levelFixBetween;
  else if (hasAbove) levelFixMessage = translations.levelFixAtMost;

  const validateKeep = (value: number): string | null =>
    Number.isInteger(value) && value >= 1 ? null : t(translations.keepInvalid);

  // Returns the effective keep-N value when the feature is active for a tab,
  // or null when not applicable (mode != equal, checkbox off, or only 1 included).
  const activeKeepValue = (tabId: number): number | null => {
    if ((modes[tabId] ?? 'equal') !== 'equal') return null;
    if (!keepOn[tabId]) return null;
    return keepHighest[tabId] ?? 0;
  };

  const handleKeepChange = (tabId: number, raw: string): void => {
    const parsed = raw === '' ? 0 : Number(raw);
    setKeepHighest((prev) => ({ ...prev, [tabId]: parsed }));
  };

  // Skip a category with no tabs — e.g. the synthetic "External Assessments"
  // group once its last external is deleted — so no bare header lingers.
  const visibleCategories = categories.filter((cat) =>
    tabs.some((tb) => tb.categoryId === cat.id),
  );

  // Gamification off hides the level section, so a persisted enabled level must be
  // treated as disabled — it contributes nothing to the Total (matches the table's
  // showLevelContribution = gamificationEnabled && enabled).
  const sum = r2(
    tabs.reduce((acc, tb) => acc + effectiveWeight(tb.id), 0) +
      (gamificationEnabled && levelEnabled ? levelWeight : 0),
  );
  const hasInvalid =
    Object.values(weights).some((w) => validate(w) !== null) ||
    Object.values(assessmentWeights).some((w) => validate(w) !== null) ||
    tabs.some((tb) => {
      if ((modes[tb.id] ?? 'equal') !== 'equal') return false;
      if (!keepOn[tb.id]) return false;
      const includedCount = tabIncludedIds(tb.id).length;
      if (includedCount <= 1) return false;
      return validateKeep(keepHighest[tb.id] ?? 0) !== null;
    });
  const hasUnbalanced = tabs.some((tb) => isUnbalanced(tb.id));

  const keepOverflowTabs = tabs.filter((tb) => {
    const v = activeKeepValue(tb.id);
    if (!v) return false;
    const included = tabIncludedIds(tb.id).length;
    return included > 1 && v > included;
  });

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

  const canSave =
    !submitting && !hasInvalid && !hasUnbalanced && !levelParseError;

  const handleSave = async (): Promise<void> => {
    if (hasInvalid || hasUnbalanced || !!levelParseError) return;
    setSubmitting(true);
    try {
      const serialized = levelEnabled ? serializeFormula(levelFormula) : null;
      const formulaAst = serialized?.ok ? serialized.ast : null;
      const lcPayload: LevelContributionSaveData = {
        enabled: levelEnabled,
        formula: levelFormula,
        formulaAst,
        weight: levelWeight,
        show: levelShow,
        clamp: levelClamp,
      };
      await dispatch(
        updateGradebookWeights(
          tabs.map((tb) => {
            const mode = modes[tb.id] ?? 'equal';
            const entry = {
              tabId: tb.id,
              weight: weights[tb.id] ?? 0,
              weightMode: mode,
              keepHighest:
                activeKeepValue(tb.id) !== null &&
                tabIncludedIds(tb.id).length > 1
                  ? keepHighest[tb.id] ?? 0
                  : 0,
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
          lcPayload,
          capEnabled,
        ),
      );
      onSaved();
    } catch {
      toast.error(t(translations.saveError));
    } finally {
      setSubmitting(false);
    }
  };

  // Expose the save handler and its validity so the host dialog's single footer
  // can drive this body's save.
  useEffect(() => {
    registerSave(handleSave, canSave);
  }, [handleSave, canSave]);

  return (
    <>
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
          translations.descriptionKeep,
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
        {visibleCategories.map((cat) => (
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
                  // An external assessment is always one-per-tab; its tab has
                  // no internal structure, so render just name + weight (no
                  // mode toggle, no expand, no per-assessment exclusion).
                  const isExternal =
                    tabAssessments.length > 0 &&
                    tabAssessments.every((a) => a.external);
                  if (isExternal) {
                    return (
                      <div key={tb.id}>
                        <div className="flex items-center gap-1">
                          <div className="w-9 shrink-0" />
                          <Typography className="flex-1" variant="body2">
                            {tb.title}
                          </Typography>
                          <TextField
                            error={err !== null}
                            inputProps={{
                              'aria-label': tb.title,
                              min: 0,
                              max: 100,
                              step: 0.01,
                            }}
                            onBlur={() =>
                              setWeights((prev) => ({
                                ...prev,
                                [tb.id]: r2(prev[tb.id] ?? 0),
                              }))
                            }
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
                      </div>
                    );
                  }
                  const mode = modes[tb.id] ?? 'equal';
                  const isExpanded = !!expanded[tb.id];
                  const unbalanced = isUnbalanced(tb.id);
                  const noAssessments = tabAssessments.length === 0;
                  const includedCount = tabIncludedIds(tb.id).length;
                  const excludedCount = tabAssessments.length - includedCount;
                  const pct = includedCount > 0 ? r2(value / includedCount) : 0;

                  // keep-highest vars
                  const keepValue = keepHighest[tb.id] ?? 0;
                  const keepDisabled = includedCount <= 1;
                  const keepEnabled = !keepDisabled && !!keepOn[tb.id];
                  const keepErr = keepEnabled ? validateKeep(keepValue) : null;
                  const kept = Math.min(keepValue, includedCount);
                  const keepPct = kept > 0 ? r2(value / kept) : 0;
                  const isKeepOverflow = keepOverflowTabs.some(
                    (ot) => ot.id === tb.id,
                  );

                  return (
                    <div key={tb.id}>
                      <div className="flex items-center gap-1">
                        <IconButton
                          disabled={noAssessments}
                          onClick={() => toggleExpanded(tb.id)}
                          size="small"
                        >
                          {isExpanded ? (
                            <KeyboardArrowDown fontSize="small" />
                          ) : (
                            <KeyboardArrowRight fontSize="small" />
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
                        <SegmentedSwitch
                          ariaLabel={t(translations.modeAria, {
                            tab: tb.title,
                          })}
                          // Match the weight input's height on this row without
                          // hardcoding it: stretch to the row's tallest control.
                          className="self-stretch"
                          disabled={noAssessments}
                          onChange={(next) => handleModeChange(tb.id, next)}
                          options={[
                            {
                              value: 'equal',
                              label: t(translations.equalMode),
                            },
                            {
                              value: 'custom',
                              label: t(translations.customMode),
                            },
                          ]}
                          value={mode}
                        />
                        <TextField
                          disabled={isAllExcluded(tb.id)}
                          error={err !== null}
                          inputProps={{
                            'aria-label': tb.title,
                            min: 0,
                            max: 100,
                            step: 0.01,
                          }}
                          onBlur={() =>
                            setWeights((prev) => ({
                              ...prev,
                              [tb.id]: r2(prev[tb.id] ?? 0),
                            }))
                          }
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
                      {mode === 'equal' && !noAssessments && (
                        <>
                          <div className="pl-9 flex items-center gap-1 flex-wrap">
                            <Checkbox
                              checked={keepEnabled}
                              disabled={keepDisabled}
                              inputProps={{
                                'aria-label': t(
                                  translations.keepHighestToggleAria,
                                  { tab: tb.title },
                                ),
                              }}
                              onChange={() => {
                                if (keepEnabled) {
                                  // Turn off: just toggle the on flag
                                  setKeepOn((prev) => ({
                                    ...prev,
                                    [tb.id]: false,
                                  }));
                                } else {
                                  // Turn on: seed default value if not already set
                                  if (keepValue === 0) {
                                    setKeepHighest((prev) => ({
                                      ...prev,
                                      [tb.id]: Math.max(1, includedCount - 1),
                                    }));
                                  }
                                  setKeepOn((prev) => ({
                                    ...prev,
                                    [tb.id]: true,
                                  }));
                                }
                              }}
                              size="small"
                            />
                            <Typography
                              color="text.secondary"
                              variant="caption"
                            >
                              {t(translations.keepHighestLabel)}
                            </Typography>
                            {keepEnabled && (
                              <TextField
                                error={keepErr !== null}
                                inputProps={{
                                  'aria-label': t(translations.keepHighestAria, {
                                    tab: tb.title,
                                  }),
                                  min: 1,
                                  step: 1,
                                }}
                                label={t(translations.keepHighestLabel)}
                                onChange={(e) =>
                                  handleKeepChange(tb.id, e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (
                                    ['.', ',', 'e', 'E', '-', '+'].includes(
                                      e.key,
                                    )
                                  )
                                    e.preventDefault();
                                }}
                                size="small"
                                sx={{ width: 80, mx: 0.5 }}
                                type="number"
                                value={keepValue}
                              />
                            )}
                            {keepEnabled && keepErr === null && (
                              <Typography color="primary" variant="caption">
                                {t(translations.keepSubtitle, {
                                  keep: kept,
                                  included: includedCount,
                                  pct: keepPct.toFixed(2),
                                })}
                              </Typography>
                            )}
                          </div>
                          {keepEnabled && keepErr && (
                            <Typography
                              className="pl-9"
                              color="error"
                              variant="caption"
                            >
                              {keepErr}
                            </Typography>
                          )}
                          {isKeepOverflow && (
                            <Alert severity="warning" sx={{ mt: 1, ml: 4.5 }}>
                              {t(translations.keepOverflowWarning, {
                                tab: tb.title,
                              })}
                            </Alert>
                          )}
                        </>
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
                                      onBlur={() =>
                                        setAssessmentWeights((prev) => ({
                                          ...prev,
                                          [a.id]: r2(prev[a.id] ?? 0),
                                        }))
                                      }
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
                            let caption = t(translations.ofGrade, {
                              pct: pct.toFixed(2),
                            });
                            if (isExcluded) {
                              caption = t(translations.excluded);
                            } else if (keepEnabled) {
                              caption = '—';
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
                                  {caption}
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
      {gamificationEnabled && (
        <div style={{ marginTop: 16 }}>
          <div className="flex items-center gap-1">
            <FormControlLabel
              control={
                <Checkbox
                  checked={levelEnabled}
                  onChange={(e) => setLevelEnabled(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2">
                  {t(translations.levelTitle)}
                </Typography>
              }
              sx={{ flex: 1, mr: 0 }}
            />
            <TextField
              disabled={!levelEnabled}
              inputProps={{
                'aria-label': t(translations.levelTitle),
                min: 0,
                max: 100,
                step: 0.01,
              }}
              onBlur={() => setLevelWeight((prev) => r2(prev))}
              onChange={(e) =>
                setLevelWeight(e.target.value === '' ? 0 : Number(e.target.value))
              }
              size="small"
              sx={{ width: 96 }}
              type="number"
              value={levelEnabled ? levelWeight : 0}
            />
          </div>
          {levelEnabled && (
            <Stack spacing={1} sx={{ pl: 1, mt: 1 }}>
              <Typography color="text.secondary" variant="caption">
                {t(translations.levelSubtitle)}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                {t(translations.levelFormulaHelper)}
              </Typography>
              <TextField
                error={!!levelParseError}
                fullWidth
                helperText={levelParseError ?? undefined}
                inputProps={{ 'aria-label': t(translations.levelFormulaLabel) }}
                label={t(translations.levelFormulaLabel)}
                onChange={(e) => setLevelFormula(e.target.value)}
                size="small"
                value={levelFormula}
              />
              {highestStudentLevel != null && (
                <Typography color="text.secondary" variant="caption">
                  {t(translations.levelHighestStudent, {
                    level: highestStudentLevel,
                  })}
                </Typography>
              )}
              <Typography color="text.secondary" variant="caption">
                {t(translations.levelCourseMax, { courseMaxLevel })}
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={levelShow}
                    onChange={(e) => setLevelShow(e.target.checked)}
                    size="small"
                    sx={{ py: 0.25 }}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t(translations.levelShowLabel)}
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={levelClamp}
                    onChange={(e) => setLevelClamp(e.target.checked)}
                    size="small"
                    sx={{ py: 0.25 }}
                  />
                }
                label={
                  <Typography variant="body2">
                    {t(translations.levelClampLabel)}
                  </Typography>
                }
              />
              {((levelClamp && (hasBelow || hasAbove)) || hasUnscoreable) && (
                <Alert severity="warning">
                  <Typography variant="body2">
                    {[
                      levelClamp &&
                        hasAbove &&
                        t(translations.levelOffendersAbove, {
                          count: offenders.above.length,
                          name1: fmtOffender(offenders.above[0]),
                          name2: offenders.above[1]
                            ? fmtOffender(offenders.above[1])
                            : '',
                          extra: Math.max(0, offenders.above.length - 2),
                          max: levelWeight,
                        }),
                      levelClamp &&
                        hasBelow &&
                        t(translations.levelOffendersBelow, {
                          count: offenders.below.length,
                          name1: fmtOffender(offenders.below[0]),
                          name2: offenders.below[1]
                            ? fmtOffender(offenders.below[1])
                            : '',
                          extra: Math.max(0, offenders.below.length - 2),
                        }),
                      hasUnscoreable &&
                        t(translations.levelUnscoreable, {
                          count: offenders.unscoreable.length,
                          name1: fmtUnscoreable(offenders.unscoreable[0]),
                          name2: offenders.unscoreable[1]
                            ? fmtUnscoreable(offenders.unscoreable[1])
                            : '',
                          extra: Math.max(0, offenders.unscoreable.length - 2),
                        }),
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  </Typography>
                  {levelClamp && (hasBelow || hasAbove) && (
                    <Typography sx={{ mt: 0.5 }} variant="body2">
                      {t(levelFixMessage, { max: levelWeight })}
                    </Typography>
                  )}
                </Alert>
              )}
            </Stack>
          )}
        </div>
      )}
      <Stack alignItems="center" direction="row" spacing={1} sx={{ mt: 3 }}>
        <Typography sx={{ fontWeight: 500 }}>
          {t(translations.total, { sum })}
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={capEnabled}
              onChange={(e) => setCapEnabled(e.target.checked)}
              size="small"
            />
          }
          label={t(translations.capToggle)}
        />
        <Tooltip title={t(translations.capInfoBody)}>
          <InfoOutlined
            aria-label={t(translations.capInfo)}
            color="action"
            fontSize="small"
          />
        </Tooltip>
      </Stack>
      {sum !== 100 && !(capEnabled && sum > 100) && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {t(
            sum > 100
              ? translations.weightsOverHundred
              : translations.weightsUnderHundred,
          )}
        </Alert>
      )}
    </>
  );
};

export default ConfigureWeightsContent;
