import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Close } from '@mui/icons-material';
import { IconButton, Typography } from '@mui/material';
import { dispatch } from 'store';

import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { toggleLiveFeedbackChat } from '../../reducers/liveFeedbackChats';
import { getLiveFeedbackChatsForAnswerId } from '../../selectors/liveFeedbackChats';

interface HeaderProps {
  answerId: number;
}

const translations = defineMessages({
  getHelpHeader: {
    id: 'course.assessment.submission.GetHelpChatPage',
    defaultMessage: 'Get Help',
  },
});

const Header: FC<HeaderProps> = (props) => {
  const { answerId } = props;

  const liveFeedbackChats = useAppSelector((state) =>
    getLiveFeedbackChatsForAnswerId(state, answerId),
  );

  const { t } = useTranslation();

  if (!liveFeedbackChats) return null;

  return (
    <div className="flex-none p-1 flex items-center justify-between">
      <Typography className="pl-2" variant="h6">
        {t(translations.getHelpHeader)}
      </Typography>
      <IconButton
        onClick={() => dispatch(toggleLiveFeedbackChat({ answerId }))}
      >
        <Close />
      </IconButton>
    </div>
  );
};

export default Header;
