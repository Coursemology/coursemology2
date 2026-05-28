import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { CategoryData, TabData } from 'types/course/gradebook';

import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { updateGradebookWeights } from '../operations';

interface Props {
  open: boolean;
  onClose: () => void;
  categories: CategoryData[];
  tabs: TabData[];
}

const translations = defineMessages({
  title: {
    id: 'course.gradebook.ConfigureWeightsDialog.title',
    defaultMessage: 'Configure tab weights',
  },
  description: {
    id: 'course.gradebook.ConfigureWeightsDialog.description',
    defaultMessage:
      'Set how much each tab contributes to the total grade. Weights should sum to 100.',
  },
  totalLabel: {
    id: 'course.gradebook.ConfigureWeightsDialog.totalLabel',
    defaultMessage: 'Total: {sum}%',
  },
  sumWarning: {
    id: 'course.gradebook.ConfigureWeightsDialog.sumWarning',
    defaultMessage:
      'Weights do not sum to 100. Saving is allowed; Total may be inaccurate.',
  },
  cancel: {
    id: 'course.gradebook.ConfigureWeightsDialog.cancel',
    defaultMessage: 'Cancel',
  },
  save: {
    id: 'course.gradebook.ConfigureWeightsDialog.save',
    defaultMessage: 'Save',
  },
  saveSuccess: {
    id: 'course.gradebook.ConfigureWeightsDialog.saveSuccess',
    defaultMessage: 'Weights saved.',
  },
  saveFailure: {
    id: 'course.gradebook.ConfigureWeightsDialog.saveFailure',
    defaultMessage: 'Failed to save weights — try again.',
  },
  errorMin: {
    id: 'course.gradebook.ConfigureWeightsDialog.errorMin',
    defaultMessage: 'Value must be at least 0',
  },
  errorMax: {
    id: 'course.gradebook.ConfigureWeightsDialog.errorMax',
    defaultMessage: 'Value must be at most 100',
  },
  errorInteger: {
    id: 'course.gradebook.ConfigureWeightsDialog.errorInteger',
    defaultMessage: 'Value must be a whole number',
  },
});

const validate = (value: number): keyof typeof translations | null => {
  if (!Number.isInteger(value)) return 'errorInteger';
  if (value < 0) return 'errorMin';
  if (value > 100) return 'errorMax';
  return null;
};

const ConfigureWeightsDialog: FC<Props> = ({
  open,
  onClose,
  categories,
  tabs,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [weights, setWeights] = useState<Record<number, number>>(() =>
    Object.fromEntries(tabs.map((tb) => [tb.id, tb.gradebookWeight ?? 0])),
  );
  const [submitting, setSubmitting] = useState(false);

  // Re-sync from store whenever dialog opens (handles stale state after external updates)
  useEffect(() => {
    if (open) {
      setWeights(
        Object.fromEntries(tabs.map((tb) => [tb.id, tb.gradebookWeight ?? 0])),
      );
    }
  }, [open, tabs]);

  const sum = Object.values(weights).reduce((acc, w) => acc + w, 0);
  const hasInvalid = Object.values(weights).some((w) => validate(w) !== null);

  const handleChange = (tabId: number, raw: string): void => {
    const parsed = raw === '' ? 0 : Number(raw);
    setWeights((prev) => ({ ...prev, [tabId]: parsed }));
  };

  const handleSave = async (): Promise<void> => {
    if (hasInvalid) return;
    setSubmitting(true);
    try {
      await dispatch(
        updateGradebookWeights(
          tabs.map((tb) => ({ tabId: tb.id, weight: weights[tb.id] ?? 0 })),
        ),
      );
      toast.success(t(translations.saveSuccess));
      onClose();
    } catch {
      toast.error(t(translations.saveFailure));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>{t(translations.title)}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" gutterBottom variant="body2">
          {t(translations.description)}
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {categories.map((cat) => (
            <div key={cat.id}>
              <Typography variant="subtitle2">{cat.title}</Typography>
              <Stack spacing={1} sx={{ mt: 1, pl: 2 }}>
                {tabs
                  .filter((tb) => tb.categoryId === cat.id)
                  .map((tb) => {
                    const value = weights[tb.id] ?? 0;
                    const errKey = validate(value);
                    return (
                      <TextField
                        key={tb.id}
                        error={errKey !== null}
                        helperText={
                          errKey ? t(translations[errKey]) : undefined
                        }
                        InputProps={{ endAdornment: '%' }}
                        label={tb.title}
                        onChange={(e) => handleChange(tb.id, e.target.value)}
                        size="small"
                        type="number"
                        value={value}
                      />
                    );
                  })}
              </Stack>
            </div>
          ))}
        </Stack>
        <Typography sx={{ fontWeight: 500, mt: 3 }}>
          {t(translations.totalLabel, { sum })}
        </Typography>
        {sum !== 100 && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {t(translations.sumWarning)}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t(translations.cancel)}</Button>
        <Button
          disabled={submitting || hasInvalid}
          onClick={handleSave}
          variant="contained"
        >
          {t(translations.save)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigureWeightsDialog;
