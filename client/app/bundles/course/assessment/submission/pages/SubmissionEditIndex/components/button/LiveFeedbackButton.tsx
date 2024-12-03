import { FC } from 'react';
import { Button } from '@mui/material';

import { toggleLiveFeedbackChat } from 'course/assessment/submission/reducers/liveFeedbackChats';
import translations from 'course/assessment/submission/translations';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  answerId?: number;
}

const LiveFeedbackButton: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { answerId } = props;

  const dispatch = useAppDispatch();
  if (!answerId) return null;

  // TODO: update logic pending #7418: allow [Live feedback] on all programming questions

  return (
    <Button
      className="mb-2 mr-2"
      color="info"
      id="get-live-feedback"
      onClick={() => {
        dispatch(toggleLiveFeedbackChat({ answerId }));
      }}
      variant="contained"
    >
      {t(translations.generateCodaveriLiveFeedback)}
    </Button>
  );
};

export default LiveFeedbackButton;
