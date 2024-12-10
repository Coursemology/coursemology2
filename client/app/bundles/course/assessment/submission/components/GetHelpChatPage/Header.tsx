import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Close } from '@mui/icons-material';
import { IconButton, Typography } from '@mui/material';
import { dispatch } from 'store';

import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { closeLiveFeedbackChat } from '../../reducers/liveFeedbackChats';
import { getLiveFeedbackChatsForQuestionId } from '../../selectors/liveFeedbackChats';

interface HeaderProps {
  questionId: number;
}

const translations = defineMessages({
  getHelpHeader: {
    id: 'course.assessment.submission.GetHelpChatPage',
    defaultMessage: 'Get Help',
  },
});

const Header: FC<HeaderProps> = (props) => {
  const { questionId } = props;

  const submissionId = getSubmissionId();
  const liveFeedbackChats = useAppSelector((state) =>
    getLiveFeedbackChatsForQuestionId(state, questionId),
  );

  const { t } = useTranslation();

  if (!liveFeedbackChats) return null;

  return (
    <div className="flex-none p-1 flex items-center justify-between">
      <Typography className="pl-2" variant="h6">
        {t(translations.getHelpHeader)}
      </Typography>
      <IconButton
        onClick={() =>
          dispatch(closeLiveFeedbackChat({ submissionId, questionId }))
        }
      >
        <Close />
      </IconButton>
    </div>
  );
};

export default Header;
