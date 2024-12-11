import { FC } from 'react';
import { Button } from '@mui/material';

import {
  closeLiveFeedbackChat,
  openLiveFeedbackChat,
} from 'course/assessment/submission/reducers/liveFeedbackChats';
import { getLiveFeedbackChatsForQuestionId } from 'course/assessment/submission/selectors/liveFeedbackChats';
import translations from 'course/assessment/submission/translations';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  questionId: number;
}

const LiveFeedbackButton: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { questionId } = props;

  const submissionId = getSubmissionId();

  const dispatch = useAppDispatch();
  const liveFeedbackChatForQuestion = useAppSelector((state) =>
    getLiveFeedbackChatsForQuestionId(state, questionId),
  );
  const isChatOpen = liveFeedbackChatForQuestion?.isLiveFeedbackChatOpen;

  // TODO: update logic pending #7418: allow [Live feedback] on all programming questions

  return (
    <Button
      className="mb-2 mr-2"
      color="info"
      id="get-live-feedback"
      onClick={() => {
        if (isChatOpen) {
          dispatch(closeLiveFeedbackChat({ submissionId, questionId }));
        } else {
          dispatch(openLiveFeedbackChat({ submissionId, questionId }));
        }
      }}
      variant="contained"
    >
      {t(translations.generateCodaveriLiveFeedback)}
    </Button>
  );
};

export default LiveFeedbackButton;
