import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import type { ConflictRow } from 'types/course/gradebook';

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
      'Some students already have grades for these components that differ from the values in your file. Replace will overwrite the existing grades with the values from your file. Keep Existing will leave the existing grades unchanged.',
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
  changesSummary: {
    id: 'course.gradebook.ExternalGradeConflictPrompt.changesSummary',
    defaultMessage: '{changed} of {total} rows have changes',
  },
});

interface Props {
  open: boolean;
  rows: ConflictRow[];
  componentNames: string[];
  identifierLabel: string;
  totalRows: number;
  disabled?: boolean;
  keepLoading?: boolean;
  replaceLoading?: boolean;
  onKeepExisting: () => void;
  onReplaceAll: () => void;
  onCancel: () => void;
}

const ExternalGradeConflictPrompt: FC<Props> = ({
  open,
  rows,
  componentNames,
  identifierLabel,
  totalRows,
  disabled = false,
  keepLoading = false,
  replaceLoading = false,
  onKeepExisting,
  onReplaceAll,
  onCancel,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog
      disableEscapeKeyDown
      maxWidth="md"
      onClose={(_event, reason) => {
        if (reason === 'backdropClick') return;
        onCancel();
      }}
      open={open}
    >
      <DialogTitle>{t(translations.title)}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t(translations.body)}</DialogContentText>
        <Typography sx={{ mt: 2 }} variant="subtitle2">
          {t(translations.changesSummary, {
            changed: rows.length,
            total: totalRows,
          })}
        </Typography>
        <Box sx={{ maxHeight: 320, mt: 2, overflow: 'auto' }}>
          <ExternalGradeConflictTable
            componentNames={componentNames}
            identifierLabel={identifierLabel}
            rows={rows}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button disabled={disabled} onClick={onCancel} variant="outlined">
          {t(translations.goBack)}
        </Button>
        <LoadingButton
          disabled={disabled}
          loading={keepLoading}
          onClick={onKeepExisting}
          variant="contained"
        >
          {t(translations.keepExisting)}
        </LoadingButton>
        <LoadingButton
          disabled={disabled}
          loading={replaceLoading}
          onClick={onReplaceAll}
          variant="contained"
        >
          {t(translations.replace)}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ExternalGradeConflictPrompt;
