import { useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Alert } from '@mui/material';

import Prompt from 'lib/components/core/dialogs/Prompt';
import useTranslation from 'lib/hooks/useTranslation';

import { ColumnPickerTemplate } from '../builder';

const translations = defineMessages({
  defaultTitle: {
    id: 'lib.components.table.MuiColumnPickerPrompt.defaultTitle',
    defaultMessage: 'Select columns',
  },
  apply: {
    id: 'lib.components.table.MuiColumnPickerPrompt.apply',
    defaultMessage: 'Apply to view',
  },
  cancel: {
    id: 'lib.components.table.MuiColumnPickerPrompt.cancel',
    defaultMessage: 'Cancel',
  },
});

interface MuiColumnPickerPromptProps {
  open: boolean;
  onClose: () => void;
  initialVisibility: Record<string, boolean>;
  locked?: string[];
  columnPicker: ColumnPickerTemplate;
  commitColumnVisibility: (next: Record<string, boolean>) => void;
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

const MuiColumnPickerPrompt = ({
  open,
  onClose,
  initialVisibility,
  locked,
  columnPicker,
  commitColumnVisibility,
}: MuiColumnPickerPromptProps): JSX.Element => {
  const { t } = useTranslation();
  const [staged, setStaged] = useState<Record<string, boolean>>(() =>
    enforceLockedLocal({ ...initialVisibility }, locked),
  );

  const dataColumnIds = columnPicker.dataColumnIds;
  const hasDataColumns =
    !dataColumnIds ||
    dataColumnIds.length === 0 ||
    dataColumnIds.some((id) => staged[id]);

  useEffect(() => {
    if (open) {
      setStaged(enforceLockedLocal({ ...initialVisibility }, locked));
    }
  }, [open, initialVisibility, locked]);

  const context = {
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

  return (
    <Prompt
      cancelLabel={t(translations.cancel)}
      onClickPrimary={commitAndClose}
      onClose={onClose}
      open={open}
      primaryColor="primary"
      primaryLabel={t(translations.apply)}
      title={columnPicker.dialogTitle ?? t(translations.defaultTitle)}
    >
      {columnPicker.render(context)}
      {!hasDataColumns && columnPicker.noDataColumnsHint && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {columnPicker.noDataColumnsHint}
        </Alert>
      )}
    </Prompt>
  );
};

export default MuiColumnPickerPrompt;
