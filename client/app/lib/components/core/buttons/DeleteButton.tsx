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
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const promptContents = props.confirmMessage ?? props.children;

  return (
    <>
      <Tooltip title={props.tooltip ?? t(formTranslations.delete)}>
        <span>
          <IconButton
            color="error"
            {...props}
            data-testid="DeleteIconButton"
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
        disabled={props.loading ?? props.disabled}
        onClickPrimary={(): void => {
          props.onClick().finally(() => setDialogOpen(false));
        }}
        onClose={(): void => setDialogOpen(false)}
        open={dialogOpen}
        primaryColor="error"
        primaryLabel={props.confirmLabel ?? t(formTranslations.delete)}
        title={props.title}
      >
        {promptContents}
      </Prompt>
    </>
  );
};

export default DeleteButton;
