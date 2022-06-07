import { useState } from 'react';
import { IconButton, IconButtonProps } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import ConfirmationDialog from '../ConfirmationDialog';

interface Props extends IconButtonProps {
  disabled: boolean;
  onClick: () => Promise<void>;
  confirmMessage: string;
}

const DeleteButton = ({
  disabled,
  onClick,
  confirmMessage,
  ...props
}: Props): JSX.Element => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <IconButton
        onClick={(): void => {
          if (confirmMessage) {
            setDialogOpen(true);
          } else {
            onClick();
          }
        }}
        color="error"
        {...props}
      >
        <Delete />
      </IconButton>
      {dialogOpen && (
        <ConfirmationDialog
          message={confirmMessage}
          disableCancelButton={disabled}
          disableConfirmButton={disabled}
          open={dialogOpen}
          onCancel={(): void => setDialogOpen(false)}
          onConfirm={(): void => {
            onClick().finally(() => setDialogOpen(false));
          }}
        />
      )}
    </>
  );
};

export default DeleteButton;
