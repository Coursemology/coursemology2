import { FC } from 'react';
import { Typography } from '@mui/material';

import Accordion from 'lib/components/core/layouts/Accordion';
import UserHTMLText from 'lib/components/core/UserHTMLText';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getLiveFeedbackQuestionInfo } from '../selectors';
import translations from '../translations';

import LiveFeedbackDetails from './LiveFeedbackDetails';

interface Props {
  questionNumber: number;
}

const LiveFeedbackHistoryTimelineView: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { questionNumber } = props;
  const question = useAppSelector(getLiveFeedbackQuestionInfo);

  return (
    <>
      <div className="pb-2">
        <Accordion
          defaultExpanded={false}
          disableGutters
          title={t(translations.questionTitle, { index: questionNumber })}
        >
          <div className="ml-4 mt-4">
            <Typography variant="body1">{question.title}</Typography>
            <UserHTMLText html={question.description} />
          </div>
        </Accordion>
      </div>
      <LiveFeedbackDetails />
    </>
  );
};

export default LiveFeedbackHistoryTimelineView;
