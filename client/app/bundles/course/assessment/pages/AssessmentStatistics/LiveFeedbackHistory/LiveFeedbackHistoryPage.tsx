import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Slider, Typography } from '@mui/material';

import Accordion from 'lib/components/core/layouts/Accordion';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

import {
  getLiveFeedbackHistory,
  getLiveFeedbadkQuestionInfo,
} from '../selectors';

import LiveFeedbackDetails from './LiveFeedbackDetails';

const translations = defineMessages({
  questionTitle: {
    id: 'course.assessment.liveFeedback.questionTitle',
    defaultMessage: 'Question {index}',
  },
});

interface Props {
  questionNumber: number;
}

const LiveFeedbackHistoryPage: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { questionNumber } = props;
  const allLiveFeedbackHistory = useAppSelector(getLiveFeedbackHistory).filter(
    (liveFeedbackHistory) => {
      // Remove live feedbacks that have no comments
      return liveFeedbackHistory.files.some((file) => file.comments.length > 0);
    },
  );
  const question = useAppSelector(getLiveFeedbadkQuestionInfo);

  const [displayedIndex, setDisplayedIndex] = useState(
    allLiveFeedbackHistory.length - 1,
  );
  const sliderMarks = allLiveFeedbackHistory.map((liveFeedbackHistory, idx) => {
    return {
      value: idx,
      label:
        idx === 0 || idx === allLiveFeedbackHistory.length - 1
          ? formatLongDateTime(liveFeedbackHistory.createdAt)
          : '',
    };
  });

  return (
    <>
      <div className="pb-2">
        <Accordion
          defaultExpanded={false}
          title={t(translations.questionTitle, {
            index: questionNumber,
          })}
        >
          <div className="ml-4 mt-4">
            <Typography variant="body1">{question.title}</Typography>
            <Typography
              dangerouslySetInnerHTML={{
                __html: question.description,
              }}
              variant="body2"
            />
          </div>
        </Accordion>
      </div>

      {allLiveFeedbackHistory.length > 1 && (
        <div className="w-[calc(100%_-_17rem)] mx-auto">
          <Slider
            defaultValue={allLiveFeedbackHistory.length - 1}
            marks={sliderMarks}
            max={allLiveFeedbackHistory.length - 1}
            min={0}
            onChange={(_, value) => {
              setDisplayedIndex(Array.isArray(value) ? value[0] : value);
            }}
            step={null}
            valueLabelDisplay="off"
          />
        </div>
      )}
      {allLiveFeedbackHistory[displayedIndex].files.map((file) => {
        return <LiveFeedbackDetails key={file.id} file={file} />;
      })}
    </>
  );
};

export default LiveFeedbackHistoryPage;
