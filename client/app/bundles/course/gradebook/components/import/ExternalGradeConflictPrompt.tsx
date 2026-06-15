import { FC } from 'react';
import { defineMessages } from 'react-intl';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import type { ImportConflict } from 'types/course/gradebook';

import useTranslation from 'lib/hooks/useTranslation';

import ExternalGradeConflictTable from './ExternalGradeConflictTable';

const translations = defineMessages({
  title: {
    id: 'course.gradebook.ExternalGradeConflictPrompt.title',
    defaultMessage: 'Resolve grade conflicts',
  },
  body: {
    id: 'course.gradebook.ExternalGradeConflictPrompt.body',
    defaultMessage:
      'These students already have a grade for these components. Keep their existing grades, or replace them with the values from your file? New students and blank cells are unaffected.',
  },
  goBack: {
    id: 'course.gradebook.ExternalGradeConflictPrompt.goBack',
    defaultMessage: 'Go Back',
  },
  keepExisting: {
    id: 'course.gradebook.ExternalGradeConflictPrompt.keepExisting',
    defaultMessage: 'Keep Existing',
  },
  replace: {
    id: 'course.gradebook.ExternalGradeConflictPrompt.replace',
    defaultMessage: 'Replace',
  },
});

interface Props {
  open: boolean;
  conflicts: ImportConflict[];
  disabled?: boolean;
  onKeepExisting: () => void;
  onReplaceAll: () => void;
  onCancel: () => void;
}

const ExternalGradeConflictPrompt: FC<Props> = ({
  open,
  conflicts,
  disabled = false,
  onKeepExisting,
  onReplaceAll,
  onCancel,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog disableEscapeKeyDown maxWidth="md" onClose={onCancel} open={open}>
      <DialogTitle>{t(translations.title)}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t(translations.body)}</DialogContentText>
        <Box sx={{ maxHeight: 320, mt: 2, overflow: 'auto' }}>
          <ExternalGradeConflictTable rows={conflicts} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button disabled={disabled} onClick={onCancel} variant="outlined">
          {t(translations.goBack)}
        </Button>
        <Button
          disabled={disabled}
          onClick={onKeepExisting}
          variant="contained"
        >
          {t(translations.keepExisting)}
        </Button>
        <Button disabled={disabled} onClick={onReplaceAll} variant="contained">
          {t(translations.replace)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExternalGradeConflictPrompt;
