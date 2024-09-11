import { FC, useState } from 'react';
import { Typography } from '@mui/material';

import Accordion from 'lib/components/core/layouts/Accordion';
import CustomSlider from 'lib/components/extensions/CustomSlider';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

import {
  getLiveFeedbackHistory,
  getLiveFeedbadkQuestionInfo,
} from '../selectors';
import translations from '../translations';

import LiveFeedbackDetails from './LiveFeedbackDetails';

interface Props {
  questionNumber: number;
}

const LiveFeedbackHistoryPage: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { questionNumber } = props;
  const allLiveFeedbackHistory = useAppSelector(getLiveFeedbackHistory);
  const nonEmptyLiveFeedbackHistory = allLiveFeedbackHistory.filter(
    (liveFeedbackHistory) => {
      // Remove live feedbacks that have no comments
      return liveFeedbackHistory.files.some((file) => file.comments.length > 0);
    },
  );
  const question = useAppSelector(getLiveFeedbadkQuestionInfo);

  const [displayedIndex, setDisplayedIndex] = useState(
    nonEmptyLiveFeedbackHistory.length - 1,
  );
  const sliderMarks = nonEmptyLiveFeedbackHistory.map(
    (liveFeedbackHistory, idx) => {
      return {
        value: idx + 1,
        label:
          idx === 0 || idx === nonEmptyLiveFeedbackHistory.length - 1
            ? formatLongDateTime(liveFeedbackHistory.createdAt)
            : '',
      };
    },
  );

  return (
    <>
      <div className="pb-2">
        <Accordion
          defaultExpanded={false}
          disableGutters
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

      {nonEmptyLiveFeedbackHistory.length > 1 && (
        <div className="w-[calc(100%_-_17rem)] mx-auto">
          <CustomSlider
            defaultValue={nonEmptyLiveFeedbackHistory.length}
            marks={sliderMarks}
            max={nonEmptyLiveFeedbackHistory.length}
            min={1}
            onChange={(_, value) => {
              setDisplayedIndex(
                Array.isArray(value) ? value[0] - 1 : value - 1,
              );
            }}
            step={null}
            valueLabelDisplay="auto"
          />
        </div>
      )}

      <Typography className="py-2" variant="h6">
        {t(translations.feedbackTimingTitle, {
          usedAt: formatLongDateTime(
            nonEmptyLiveFeedbackHistory[displayedIndex].createdAt,
          ),
        })}
      </Typography>

      {nonEmptyLiveFeedbackHistory[displayedIndex].files.map((file) => (
        <LiveFeedbackDetails key={file.id} file={file} />
      ))}
    </>
  );
};

export default LiveFeedbackHistoryPage;
