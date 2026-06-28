import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { deleteExternalAssessment } from '../operations';

const translations = defineMessages({
  title: {
    id: 'course.gradebook.DeleteExternalColumnPrompt.title',
    defaultMessage: 'Delete external assessment',
  },
  body: {
    id: 'course.gradebook.DeleteExternalColumnPrompt.body',
    defaultMessage:
      'Delete "{title}"? This permanently removes the column and every student grade in it. This cannot be undone.',
  },
  cancel: {
    id: 'course.gradebook.DeleteExternalColumnPrompt.cancel',
    defaultMessage: 'Cancel',
  },
  confirm: {
    id: 'course.gradebook.DeleteExternalColumnPrompt.confirm',
    defaultMessage: 'Delete',
  },
  error: {
    id: 'course.gradebook.DeleteExternalColumnPrompt.error',
    defaultMessage: 'Could not delete the external assessment.',
  },
});

interface Props {
  open: boolean;
  assessmentId: number;
  title: string;
  onClose: () => void;
}

const DeleteExternalColumnPrompt: FC<Props> = ({
  open,
  assessmentId,
  title,
  onClose,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);

  const submit = async (): Promise<void> => {
    setSaving(true);
    try {
      await dispatch(deleteExternalAssessment(assessmentId));
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
        <DialogContentText>{t(translations.body, { title })}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button disabled={saving} onClick={onClose} variant="outlined">
          {t(translations.cancel)}
        </Button>
        <LoadingButton
          color="error"
          loading={saving}
          onClick={submit}
          variant="contained"
        >
          {t(translations.confirm)}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteExternalColumnPrompt;
