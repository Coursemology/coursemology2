import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
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
  const [saving, setSaving] = useState(false);

  const reset = (): void => {
    setName('');
    setMax('');
  };

  const canSave =
    name.trim() !== '' && max.trim() !== '' && Number(max) >= 0 && !saving;

  const submit = async (): Promise<void> => {
    setSaving(true);
    try {
      await dispatch(createExternalAssessment(name.trim(), Number(max)));
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
