import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
  Tooltip,
} from '@mui/material';
import type { AssessmentData } from 'types/course/gradebook';

import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { editExternalAssessment } from '../../operations';

const translations = defineMessages({
  title: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.title',
    defaultMessage: 'Edit external assessment',
  },
  nameLabel: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.nameLabel',
    defaultMessage: 'Name',
  },
  maxLabel: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.maxLabel',
    defaultMessage: 'Max marks',
  },
  weightLabel: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.weightLabel',
    defaultMessage: 'Weightage',
  },
  floorLabel: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.floorLabel',
    defaultMessage: 'Floor grades at 0',
  },
  capLabel: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.capLabel',
    defaultMessage: 'Cap grades at max',
  },
  floorHint: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.floorHint',
    defaultMessage:
      'Counts negative grades as 0 when computing the weighted total. The actual grade is unchanged.',
  },
  capHint: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.capHint',
    defaultMessage:
      'Counts grades above the maximum as the maximum when computing the weighted total. The actual grade is unchanged.',
  },
  cancel: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.cancel',
    defaultMessage: 'Cancel',
  },
  save: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.save',
    defaultMessage: 'Save',
  },
  error: {
    id: 'course.gradebook.EditExternalAssessmentPrompt.error',
    defaultMessage: 'Could not save the external assessment.',
  },
});

interface Props {
  open: boolean;
  assessment: AssessmentData;
  weightedViewEnabled?: boolean;
  currentWeight?: number;
  onClose: () => void;
}

const EditExternalAssessmentPrompt: FC<Props> = ({
  open,
  assessment,
  weightedViewEnabled = false,
  currentWeight = 0,
  onClose,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [name, setName] = useState(assessment.title);
  const [max, setMax] = useState(String(assessment.maxGrade));
  const [weight, setWeight] = useState(String(currentWeight));
  const [floorAtZero, setFloorAtZero] = useState(
    assessment.floorAtZero ?? true,
  );
  const [capAtMaximum, setCapAtMaximum] = useState(
    assessment.capAtMaximum ?? true,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(assessment.title);
      setMax(String(assessment.maxGrade));
      setFloorAtZero(assessment.floorAtZero ?? true);
      setCapAtMaximum(assessment.capAtMaximum ?? true);
      setWeight(String(currentWeight));
    }
  }, [open, assessment]);

  const canSave =
    name.trim() !== '' && max.trim() !== '' && Number(max) >= 0 && !saving;

  const submit = async (): Promise<void> => {
    setSaving(true);
    try {
      await dispatch(
        editExternalAssessment(assessment.id, {
          title: name.trim(),
          maximumGrade: Number(max),
          floorAtZero,
          capAtMaximum,
          ...(weightedViewEnabled ? { weight: Number(weight) } : {}),
        }),
      );
      onClose();
    } catch {
      toast.error(t(translations.error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog fullWidth maxWidth="xs" onClose={onClose} open={open}>
      <DialogTitle>{t(translations.title)}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label={t(translations.nameLabel)}
          margin="dense"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <TextField
          fullWidth
          label={t(translations.maxLabel)}
          margin="dense"
          onChange={(e) => setMax(e.target.value)}
          type="number"
          value={max}
        />
        {weightedViewEnabled && (
          <TextField
            fullWidth
            label={t(translations.weightLabel)}
            margin="dense"
            onChange={(e) => setWeight(e.target.value)}
            type="number"
            value={weight}
          />
        )}
        <div className="flex items-center">
          <FormControlLabel
            control={
              <Switch
                checked={floorAtZero}
                onChange={(e) => setFloorAtZero(e.target.checked)}
              />
            }
            label={t(translations.floorLabel)}
          />
          <Tooltip title={t(translations.floorHint)}>
            <InfoOutlined
              aria-label={t(translations.floorHint)}
              color="action"
              fontSize="small"
            />
          </Tooltip>
        </div>
        <div className="flex items-center">
          <FormControlLabel
            control={
              <Switch
                checked={capAtMaximum}
                onChange={(e) => setCapAtMaximum(e.target.checked)}
              />
            }
            label={t(translations.capLabel)}
          />
          <Tooltip title={t(translations.capHint)}>
            <InfoOutlined
              aria-label={t(translations.capHint)}
              color="action"
              fontSize="small"
            />
          </Tooltip>
        </div>
      </DialogContent>
      <DialogActions>
        <Button disabled={saving} onClick={onClose} variant="outlined">
          {t(translations.cancel)}
        </Button>
        <Button disabled={!canSave} onClick={submit} variant="contained">
          {t(translations.save)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditExternalAssessmentPrompt;
