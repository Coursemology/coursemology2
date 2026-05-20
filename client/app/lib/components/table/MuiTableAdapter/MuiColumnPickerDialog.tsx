import { useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import { ColumnPickerTemplate, Data } from '../builder';

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
});

interface MuiColumnPickerDialogProps<D extends Data = Data> {
  open: boolean;
  onClose: () => void;
  initialVisibility: Record<string, boolean>;
  locked?: string[];
  columnPicker: ColumnPickerTemplate<D>;
  commitColumnVisibility: (next: Record<string, boolean>) => void;
  onExportFromPicker?: () => void;
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

const MuiColumnPickerDialog = <D extends Data = Data>({
  open,
  onClose,
  initialVisibility,
  locked,
  columnPicker,
  commitColumnVisibility,
  onExportFromPicker,
}: MuiColumnPickerDialogProps<D>): JSX.Element => {
  const { t } = useTranslation();
  const [staged, setStaged] = useState<Record<string, boolean>>(() =>
    enforceLockedLocal({ ...initialVisibility }, locked),
  );

  useEffect(() => {
    if (open) {
      setStaged(enforceLockedLocal({ ...initialVisibility }, locked));
    }
  }, [open, initialVisibility, locked]);

  const ctx = {
    isVisible: (id: string) => staged[id] ?? false,
    setVisible: (id: string, v: boolean) => {
      if (locked?.includes(id)) return;
      setStaged((prev) =>
        Object.hasOwn(prev, id) ? { ...prev, [id]: v } : prev,
      );
    },
    setManyVisible: (ids: string[], v: boolean) => {
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
    commitColumnVisibility(enforceLockedLocal(staged, locked));
    onExportFromPicker?.();
    if (columnPicker.closeOnExport !== false) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={cancelAndClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="column-picker-dialog-title"
    >
      <DialogTitle id="column-picker-dialog-title">
        {columnPicker.dialogTitle ?? t(translations.defaultTitle)}
      </DialogTitle>
      <DialogContent dividers>{columnPicker.renderTree(ctx)}</DialogContent>
      <DialogActions>
        <Button onClick={cancelAndClose}>{t(translations.cancel)}</Button>
        <Button onClick={commitAndClose}>{t(translations.apply)}</Button>
        {columnPicker.onExport && (
          <Button onClick={exportAndClose} variant="contained" color="primary">
            {columnPicker.exportLabel ?? t(translations.defaultExport)}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MuiColumnPickerDialog;
