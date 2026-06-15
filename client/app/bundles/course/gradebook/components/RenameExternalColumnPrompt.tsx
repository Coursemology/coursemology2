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

import { renameExternalAssessment } from '../operations';

const translations = defineMessages({
  title: {
    id: 'course.gradebook.RenameExternalColumnPrompt.title',
    defaultMessage: 'Rename external assessment',
  },
  nameLabel: {
    id: 'course.gradebook.RenameExternalColumnPrompt.nameLabel',
    defaultMessage: 'Name',
  },
  cancel: {
    id: 'course.gradebook.RenameExternalColumnPrompt.cancel',
    defaultMessage: 'Cancel',
  },
  save: {
    id: 'course.gradebook.RenameExternalColumnPrompt.save',
    defaultMessage: 'Save',
  },
  error: {
    id: 'course.gradebook.RenameExternalColumnPrompt.error',
    defaultMessage: 'Could not rename the external assessment.',
  },
});

interface Props {
  open: boolean;
  assessmentId: number;
  currentTitle: string;
  onClose: () => void;
}

const RenameExternalColumnPrompt: FC<Props> = ({
  open,
  assessmentId,
  currentTitle,
  onClose,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [name, setName] = useState(currentTitle);
  const [saving, setSaving] = useState(false);

  const submit = async (): Promise<void> => {
    setSaving(true);
    try {
      await dispatch(renameExternalAssessment(assessmentId, name.trim()));
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
      </DialogContent>
      <DialogActions>
        <Button disabled={saving} onClick={onClose} variant="outlined">
          {t(translations.cancel)}
        </Button>
        <Button
          disabled={saving || name.trim() === ''}
          onClick={submit}
          variant="contained"
        >
          {t(translations.save)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenameExternalColumnPrompt;
