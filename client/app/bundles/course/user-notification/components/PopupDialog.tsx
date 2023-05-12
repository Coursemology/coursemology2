import { ReactNode } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

interface PopupProps {
  title: string;
  onDismiss: () => void;
  children: ReactNode;
  actionButtons?: ReactNode[];
}

const PopupDialog = (props: PopupProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Dialog maxWidth="xl" onClose={props.onDismiss} open>
      <DialogTitle className="flex flex-col items-center">
        {props.title}
      </DialogTitle>

      <DialogContent className="flex w-[40rem] flex-col items-center">
        {props.children}
      </DialogContent>

      <DialogActions>
        {props.actionButtons}

        <Button key="dismiss-button" color="primary" onClick={props.onDismiss}>
          {t(formTranslations.dismiss)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PopupDialog;
