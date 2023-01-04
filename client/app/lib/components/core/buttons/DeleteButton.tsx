import { ReactNode, useState } from 'react';
import Delete from '@mui/icons-material/Delete';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import Prompt from '../dialogs/Prompt';

interface DeleteButtonProps extends IconButtonProps {
  disabled: boolean;
  onClick: () => Promise<void>;
  confirmMessage?: ReactNode;
  children?: ReactNode;
  tooltip?: string;
  loading?: boolean;
  title?: string;
  confirmLabel?: string;
}

const DeleteButton = (props: DeleteButtonProps): JSX.Element => {
  const {
    disabled,
    onClick,
    confirmMessage,
    children,
    tooltip,
    loading,
    title,
    confirmLabel,
    ...otherProps
  } = props;
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const promptContents = confirmMessage ?? children;

  return (
    <>
      <Tooltip title={tooltip ?? t(formTranslations.delete)}>
        <span>
          <IconButton
            color="error"
            data-testid="DeleteIconButton"
            disabled={disabled}
            {...otherProps}
            onClick={(): void => {
              if (promptContents) {
                setDialogOpen(true);
              } else {
                props.onClick();
              }
            }}
          >
            <Delete data-testid="DeleteIcon" />
          </IconButton>
        </span>
      </Tooltip>

      <Prompt
        contentClassName="space-y-4"
        disabled={loading ?? disabled}
        onClickPrimary={(): void => {
          onClick().finally(() => setDialogOpen(false));
        }}
        onClose={(): void => setDialogOpen(false)}
        open={dialogOpen}
        primaryColor="error"
        primaryLabel={confirmLabel ?? t(formTranslations.delete)}
        title={title}
      >
        {promptContents}
      </Prompt>
    </>
  );
};

export default DeleteButton;
