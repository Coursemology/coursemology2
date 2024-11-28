import { FC } from 'react';
import { Close } from '@mui/icons-material';
import { IconButton, Typography } from '@mui/material';

import actionTypes from 'course/assessment/submission/constants';
import translations from 'course/assessment/submission/translations';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

interface HeaderProps {
  questionId: number;
}

const Header: FC<HeaderProps> = ({ questionId }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const handleClose = (): void => {
    dispatch({
      type: actionTypes.LIVE_FEEDBACK_OPEN_POPUP,
      payload: {
        questionId,
        isDialogOpen: false,
      },
    });
  };

  return (
    <div className="flex items-start justify-between py-4">
      <Typography className="pl-6" variant="h6">
        {t(translations.getHelpHeader)}
      </Typography>
      <IconButton onClick={handleClose} size="small">
        <Close />
      </IconButton>
    </div>
  );
};

export default Header;
