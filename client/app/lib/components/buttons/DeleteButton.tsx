import { useState } from 'react';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import ConfirmationDialog from '../ConfirmationDialog';

interface Props extends IconButtonProps {
  disabled: boolean;
  onClick: () => Promise<void>;
  confirmMessage: string;
  tooltip?: string;
}

const DeleteButton = ({
  disabled,
  onClick,
  confirmMessage,
  tooltip = '',
  ...props
}: Props): JSX.Element => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Tooltip title={tooltip}>
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
      </Tooltip>
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
