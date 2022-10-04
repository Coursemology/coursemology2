import { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

interface ConditionDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  onPrimaryAction?: () => void;
  primaryAction: string;
  primaryActionDisabled?: boolean;
}

const ConditionDialog = (props: ConditionDialogProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth>
      {props.title && <DialogTitle>{props.title}</DialogTitle>}

      <DialogContent>{props.children}</DialogContent>

      <DialogActions>
        <Button onClick={props.onClose}>{t(formTranslations.cancel)}</Button>

        <Button
          onClick={props.onPrimaryAction}
          disabled={props.primaryActionDisabled}
        >
          {props.primaryAction}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConditionDialog;
