import { useState } from 'react';
import { IconButton, IconButtonProps } from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import ConfirmationDialog from '../ConfirmationDialog';
import CustomTooltip from '../CustomTooltip';

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
      <CustomTooltip title={tooltip}>
        <IconButton
          disabled={disabled}
          onClick={(): void => {
            if (confirmMessage) {
              setDialogOpen(true);
            } else {
              onClick();
            }
          }}
          color="error"
          {...props}
          data-testid="DeleteIconButton"
        >
          <Delete data-testid="DeleteIcon" />
        </IconButton>
      </CustomTooltip>
      {dialogOpen && (
        <ConfirmationDialog
          message={confirmMessage}
          disableCancelButton={disabled}
          disableConfirmButton={disabled}
          loadingConfirmButton={loading}
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
