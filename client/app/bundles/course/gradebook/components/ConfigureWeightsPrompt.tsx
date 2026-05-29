import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Alert,
  Collapse,
  IconButton,
  Stack,
  TextField,
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
  valueNotInteger: {
    id: 'course.gradebook.ConfigureWeightsDialog.valueNotInteger',
    defaultMessage: 'Value must be a whole number',
  },
  saveError: {
    id: 'course.gradebook.ConfigureWeightsDialog.saveError',
    defaultMessage: 'Failed to save weights. Please try again.',
  },
  ofGrade: {
    id: 'course.gradebook.ConfigureWeightsDialog.ofGrade',
    defaultMessage: '{pct}% of grade',
  },
});

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
    if (!Number.isInteger(value)) return t(translations.valueNotInteger);
    if (value < 0) return t(translations.valueTooLow);
    if (value > 100) return t(translations.valueTooHigh);
    return null;
  };

  const [weights, setWeights] = useState<Record<number, number>>(() =>
    Object.fromEntries(tabs.map((tb) => [tb.id, tb.gradebookWeight ?? 0])),
  );
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setWeights(
        Object.fromEntries(tabs.map((tb) => [tb.id, tb.gradebookWeight ?? 0])),
      );
      setExpanded({});
    }
  }, [open]);

  const sum = Object.values(weights).reduce((acc, w) => acc + w, 0);
  const hasInvalid = Object.values(weights).some((w) => validate(w) !== null);

  const handleChange = (tabId: number, raw: string): void => {
    const parsed = raw === '' ? 0 : Number(raw);
    setWeights((prev) => ({ ...prev, [tabId]: parsed }));
  };

  const toggleExpanded = (tabId: number): void =>
    setExpanded((prev) => ({ ...prev, [tabId]: !prev[tabId] }));

  const handleSave = async (): Promise<void> => {
    if (hasInvalid) return;
    setSubmitting(true);
    try {
      await dispatch(
        updateGradebookWeights(
          tabs.map((tb) => ({
            tabId: tb.id,
            weight: weights[tb.id] ?? 0,
          })),
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
      primaryDisabled={submitting || hasInvalid}
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
                  const tabMaxGrade = tabAssessments.reduce(
                    (s, a) => s + a.maxGrade,
                    0,
                  );
                  const isExpanded = !!expanded[tb.id];

                  return (
                    <div key={tb.id}>
                      <div className="flex items-center gap-1">
                        <IconButton
                          disabled={tabAssessments.length === 0}
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
                        <TextField
                          error={err !== null}
                          inputProps={{
                            'aria-label': tb.title,
                            min: 0,
                            max: 100,
                            step: 1,
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
                      <Collapse in={isExpanded}>
                        <Stack spacing={0} sx={{ pl: 4.5, pt: 0.5, pb: 0.5 }}>
                          {tabAssessments.map((a) => {
                            const pct =
                              tabMaxGrade > 0
                                ? (a.maxGrade / tabMaxGrade) * value
                                : 0;
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
                                    pct: pct.toFixed(1),
                                  })}
                                </Typography>
                              </div>
                            );
                          })}
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
