import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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

import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { createExternalAssessment } from '../operations';

const translations = defineMessages({
  title: {
    id: 'course.gradebook.AddExternalColumnPrompt.title',
    defaultMessage: 'Add external assessment',
  },
  nameLabel: {
    id: 'course.gradebook.AddExternalColumnPrompt.nameLabel',
    defaultMessage: 'Name',
  },
  maxLabel: {
    id: 'course.gradebook.AddExternalColumnPrompt.maxLabel',
    defaultMessage: 'Max marks',
  },
  advancedLabel: {
    id: 'course.gradebook.AddExternalColumnPrompt.advancedLabel',
    defaultMessage: 'Advanced settings',
  },
  floorLabel: {
    id: 'course.gradebook.AddExternalColumnPrompt.floorLabel',
    defaultMessage: 'Floor grades at 0',
  },
  capLabel: {
    id: 'course.gradebook.AddExternalColumnPrompt.capLabel',
    defaultMessage: 'Cap grades at max',
  },
  floorHint: {
    id: 'course.gradebook.AddExternalColumnPrompt.floorHint',
    defaultMessage:
      'Counts negative grades as 0 when computing the weighted total, and marks them with a warning in the gradebook. The actual grade is unchanged.',
  },
  capHint: {
    id: 'course.gradebook.AddExternalColumnPrompt.capHint',
    defaultMessage:
      'Counts grades above the maximum as the maximum when computing the weighted total, and marks them with a warning in the gradebook. The actual grade is unchanged.',
  },
  cancel: {
    id: 'course.gradebook.AddExternalColumnPrompt.cancel',
    defaultMessage: 'Cancel',
  },
  create: {
    id: 'course.gradebook.AddExternalColumnPrompt.create',
    defaultMessage: 'Create',
  },
  error: {
    id: 'course.gradebook.AddExternalColumnPrompt.error',
    defaultMessage: 'Could not create the external assessment.',
  },
  success: {
    id: 'course.gradebook.AddExternalColumnPrompt.success',
    defaultMessage: 'External assessment created.',
  },
});

interface Props {
  open: boolean;
  onClose: () => void;
}

const AddExternalColumnPrompt: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [max, setMax] = useState('');
  const [floorAtZero, setFloorAtZero] = useState(true);
  const [capAtMaximum, setCapAtMaximum] = useState(true);
  const [saving, setSaving] = useState(false);

  const reset = (): void => {
    setName('');
    setMax('');
    setFloorAtZero(true);
    setCapAtMaximum(true);
  };

  const canSave =
    name.trim() !== '' && max.trim() !== '' && Number(max) >= 0 && !saving;

  const submit = async (): Promise<void> => {
    setSaving(true);
    try {
      await dispatch(
        createExternalAssessment(
          name.trim(),
          Number(max),
          floorAtZero,
          capAtMaximum,
        ),
      );
      toast.success(t(translations.success));
      reset();
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
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {t(translations.advancedLabel)}
          </AccordionSummary>
          <AccordionDetails className="flex flex-col space-y-2">
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
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogActions>
        <Button disabled={saving} onClick={onClose} variant="outlined">
          {t(translations.cancel)}
        </Button>
        <Button disabled={!canSave} onClick={submit} variant="contained">
          {t(translations.create)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddExternalColumnPrompt;
