import { useState } from 'react';
import { IconButton, IconButtonProps } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import ConfirmationDialog from '../ConfirmationDialog';

interface Props extends IconButtonProps {
  disabled: boolean;
  onClick: () => Promise<void>;
  withDialog: boolean;
}

const DeleteButton = ({
  disabled,
  onClick,
  withDialog,
  ...props
}: Props): JSX.Element => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <IconButton
        onClick={(): void => {
          if (withDialog) {
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
          message="Are you sure you wish to delete this achievement?"
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
