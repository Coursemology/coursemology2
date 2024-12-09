import { Dispatch, FC, SetStateAction } from 'react';
import { defineMessages } from 'react-intl';
import { Close } from '@mui/icons-material';
import { IconButton, Typography } from '@mui/material';
import { dispatch } from 'store';

import { SYNC_STATUS } from 'lib/constants/sharedConstants';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { toggleLiveFeedbackChat } from '../../reducers/liveFeedbackChats';
import { getLiveFeedbackChatsForAnswerId } from '../../selectors/liveFeedbackChats';

import ChipButton from './ChipButton';

interface HeaderProps {
  answerId: number;
  syncStatus: keyof typeof SYNC_STATUS;
  setSyncStatus: Dispatch<SetStateAction<keyof typeof SYNC_STATUS>>;
}

const translations = defineMessages({
  getHelpHeader: {
    id: 'course.assessment.submission.GetHelpChatPage',
    defaultMessage: 'Get Help',
  },
});

const Header: FC<HeaderProps> = (props) => {
  const { answerId, syncStatus, setSyncStatus } = props;

  const liveFeedbackChats = useAppSelector((state) =>
    getLiveFeedbackChatsForAnswerId(state, answerId),
  );

  const { t } = useTranslation();

  if (!liveFeedbackChats) return null;

  return (
    <div className="flex-none p-1 flex items-center justify-between">
      <div className="flex flex-row gap-4">
        <Typography className="pl-2" variant="h6">
          {t(translations.getHelpHeader)}
        </Typography>
        <ChipButton
          answerId={answerId}
          setSyncStatus={setSyncStatus}
          syncStatus={syncStatus}
        />
      </div>

      <IconButton
        onClick={() => dispatch(toggleLiveFeedbackChat({ answerId }))}
      >
        <Close />
      </IconButton>
    </div>
  );
};

export default Header;
