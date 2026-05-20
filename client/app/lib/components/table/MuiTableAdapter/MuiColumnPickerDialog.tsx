import { useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
} from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import { ColumnPickerTemplate } from '../builder';

const translations = defineMessages({
  defaultTitle: {
    id: 'lib.components.table.MuiColumnPickerDialog.defaultTitle',
    defaultMessage: 'Select columns to export',
  },
  apply: {
    id: 'lib.components.table.MuiColumnPickerDialog.apply',
    defaultMessage: 'Apply to view',
  },
  cancel: {
    id: 'lib.components.table.MuiColumnPickerDialog.cancel',
    defaultMessage: 'Cancel',
  },
  defaultExport: {
    id: 'lib.components.table.MuiColumnPickerDialog.export',
    defaultMessage: 'Export CSV',
  },
  identifierRequired: {
    id: 'lib.components.table.MuiColumnPickerDialog.identifierRequired',
    defaultMessage: 'Select at least one identifier column to export.',
  },
});

interface MuiColumnPickerDialogProps {
  open: boolean;
  onClose: () => void;
  initialVisibility: Record<string, boolean>;
  locked?: string[];
  columnPicker: ColumnPickerTemplate;
  commitColumnVisibility: (next: Record<string, boolean>) => void;
  onExportFromPicker?: (visibility: Record<string, boolean>) => void;
}

const enforceLockedLocal = (
  next: Record<string, boolean>,
  locked: string[] | undefined,
): Record<string, boolean> => {
  if (!locked || locked.length === 0) return next;
  const enforced = { ...next };
  locked.forEach((id) => {
    enforced[id] = true;
  });
  return enforced;
};

const MuiColumnPickerDialog = ({
  open,
  onClose,
  initialVisibility,
  locked,
  columnPicker,
  commitColumnVisibility,
  onExportFromPicker,
}: MuiColumnPickerDialogProps): JSX.Element => {
  const { t } = useTranslation();
  const [staged, setStaged] = useState<Record<string, boolean>>(() =>
    enforceLockedLocal({ ...initialVisibility }, locked),
  );

  const identifiers = columnPicker.identifiers;
  const hasIdentifier =
    !identifiers ||
    identifiers.length === 0 ||
    identifiers.some((id) => staged[id]);

  useEffect(() => {
    if (open) {
      setStaged(enforceLockedLocal({ ...initialVisibility }, locked));
    }
  }, [open, initialVisibility, locked]);

  const ctx = {
    isVisible: (id: string): boolean => staged[id] ?? false,
    setVisible: (id: string, v: boolean): void => {
      if (locked?.includes(id)) return;
      setStaged((prev) =>
        Object.hasOwn(prev, id) ? { ...prev, [id]: v } : prev,
      );
    },
    setManyVisible: (ids: string[], v: boolean): void => {
      setStaged((prev) => {
        const next = { ...prev };
        let changed = false;
        ids.forEach((id) => {
          if (!Object.hasOwn(next, id)) return;
          if (locked?.includes(id)) return;
          if (next[id] !== v) {
            next[id] = v;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    },
  };

  const commitAndClose = (): void => {
    commitColumnVisibility(enforceLockedLocal(staged, locked));
    onClose();
  };

  const cancelAndClose = (): void => {
    onClose();
  };

  const exportAndClose = (): void => {
    const enforced = enforceLockedLocal(staged, locked);
    commitColumnVisibility(enforced);
    onExportFromPicker?.(enforced);
    onClose();
  };

  return (
    <Dialog
      aria-labelledby="column-picker-dialog-title"
      fullWidth
      maxWidth="sm"
      onClose={cancelAndClose}
      open={open}
    >
      <DialogTitle id="column-picker-dialog-title">
        {columnPicker.dialogTitle ?? t(translations.defaultTitle)}
      </DialogTitle>
      <DialogContent dividers>
        {columnPicker.renderTree(ctx)}
        {!hasIdentifier && (
          <FormHelperText error sx={{ mt: 1 }}>
            {t(translations.identifierRequired)}
          </FormHelperText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelAndClose}>{t(translations.cancel)}</Button>
        <Button disabled={!hasIdentifier} onClick={commitAndClose}>
          {t(translations.apply)}
        </Button>
        <Button
          color="primary"
          disabled={!hasIdentifier}
          onClick={exportAndClose}
          variant="contained"
        >
          {columnPicker.exportLabel ?? t(translations.defaultExport)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MuiColumnPickerDialog;
