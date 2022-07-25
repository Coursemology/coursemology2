import { useState } from 'react';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import ConfirmationDialog from '../ConfirmationDialog';

interface Props extends IconButtonProps {
  disabled: boolean;
  onClick: () => Promise<void>;
  confirmMessage?: string;
  loading?: boolean;
  tooltip?: string;
}

const DeleteButton = ({
  disabled,
  onClick,
  confirmMessage,
  tooltip = '',
  loading = false,
  ...props
}: Props): JSX.Element => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogClose = (_event: object, reason: string): void => {
    if (reason && reason !== 'backdropClick') {
      setDialogOpen(false);
    }
  };

  return (
    <>
      <Tooltip title={tooltip}>
        <span>
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
        </span>
      </Tooltip>
      {dialogOpen && (
        <ConfirmationDialog
          message={confirmMessage}
          disableCancelButton={disabled}
          disableConfirmButton={disabled}
          open={dialogOpen}
          loadingConfirmButton={loading}
          onCancel={handleDialogClose}
          onConfirm={(): void => {
            onClick().finally(() => setDialogOpen(false));
          }}
        />
      )}
    </>
  );
};

export default DeleteButton;
