import { ComponentProps, ReactNode } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

interface PromptProps {
  open: boolean;
  title?: string;
  content?: string | ReactNode;
  override?: boolean;
  primaryAction?: string;
  primaryActionColor?: ComponentProps<typeof Button>['color'];
  onPrimaryAction?: () => void;
  cancel?: string;
  onCancel?: () => void;
}

const Prompt = (props: PromptProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Dialog open={props.open} onClose={props.onCancel}>
      {props.title && <DialogTitle>{props.title}</DialogTitle>}

      {props.content && (
        <DialogContent>
          {props.override ? (
            props.content
          ) : (
            <DialogContentText>{props.content}</DialogContentText>
          )}
        </DialogContent>
      )}

      <DialogActions>
        <Button onClick={props.onCancel}>
          {props.cancel ?? t(formTranslations.cancel)}
        </Button>

        <Button
          color={props.primaryActionColor}
          onClick={props.onPrimaryAction}
        >
          {props.primaryAction ?? t(formTranslations.ok)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Prompt;
