import { SyntheticEvent } from 'react';
import Edit from '@mui/icons-material/Edit';
import { IconButton, IconButtonProps, Tooltip } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

interface Props extends IconButtonProps {
  onClick: (e: SyntheticEvent) => void;
  tooltip?: string;
}

const EditButton = ({
  onClick,
  tooltip = '',
  ...props
}: Props): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t(formTranslations.edit)}>
      <span>
        <IconButton
          color="inherit"
          onClick={onClick}
          {...props}
          data-testid="EditIconButton"
        >
          <Edit data-testid="EditIcon" />
        </IconButton>
      </span>
    </Tooltip>
  );
};
export default EditButton;
