import { useState } from 'react';
import Delete from '@mui/icons-material/Delete';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

import ConfirmationDialog from '../dialogs/ConfirmationDialog';

interface Props extends IconButtonProps {
  disabled: boolean;
  loading?: boolean;
  onClick: () => Promise<void>;
  confirmMessage?: string;
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

  return (
    <>
      <Tooltip title={tooltip || 'Delete'}>
        <span>
          <IconButton
            color="error"
            disabled={disabled}
            onClick={(): void => {
              if (confirmMessage) {
                setDialogOpen(true);
              } else {
                onClick();
              }
            }}
            {...props}
            data-testid="DeleteIconButton"
          >
            <Delete data-testid="DeleteIcon" />
          </IconButton>
        </span>
      </Tooltip>
      {dialogOpen && (
        <ConfirmationDialog
          disableCancelButton={disabled}
          disableConfirmButton={disabled}
          loadingConfirmButton={loading}
          message={confirmMessage}
          onCancel={(): void => setDialogOpen(false)}
          onConfirm={(): void => {
            onClick().finally(() => setDialogOpen(false));
          }}
          open={dialogOpen}
        />
      )}
    </>
  );
};
export default DeleteButton;
