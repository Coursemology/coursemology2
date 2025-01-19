import { FC, useEffect, useState } from 'react';
import { Alert } from '@mui/material';

import { tryFetchAnswerById } from 'course/assessment/operations/history';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import CustomSlider from 'lib/components/extensions/CustomSlider';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';
import messagesTranslations from 'lib/translations/messages';

import { getSubmissionQuestionHistory } from '../../selectors/history';
import AnswerDetails from '../AnswerDetails/AnswerDetails';

interface Props {
  questionId: number;
  submissionId: number;
}

const AllAttemptsTimelineView: FC<Props> = (props) => {
  const { submissionId, questionId } = props;

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { answerDataById, allAnswers, question } = useAppSelector(
    getSubmissionQuestionHistory(submissionId, questionId),
  );

  // sliderIndex is the uncommited index that is updated on drag
  // displayedIndex is updated on drop or with any non-mouse (keyboard) events
  const [sliderIndex, setSliderIndex] = useState(allAnswers.length - 1);
  const [displayedIndex, setDisplayedIndex] = useState(allAnswers.length - 1);
  const answerStatus = answerDataById?.[allAnswers[displayedIndex].id]?.status;
  const answerDetails =
    answerDataById?.[allAnswers[displayedIndex].id]?.details;

  useEffect(() => {
    if (!answerDetails) {
      tryFetchAnswerById(
        submissionId,
        questionId,
        allAnswers[displayedIndex].id,
      );
    }
  }, [dispatch, displayedIndex, submissionId, questionId, answerStatus]);

  // TODO: distance between points inside Slider to be reflective towards the time distance
  // (for example, the distance between 1:00PM to 1:01PM should not be equal to 1:00PM to 2:00PM)
  const answerSubmittedTimes = allAnswers.map((answer, idx) => {
    return {
      value: idx,
      label:
        idx === 0 || idx === allAnswers.length - 1
          ? formatLongDateTime(answer.createdAt)
          : '',
    };
  });

  const currentAnswerMarker =
    answerSubmittedTimes[answerSubmittedTimes.length - 1];

  const earliestAnswerMarker = answerSubmittedTimes[0];

  const renderAnswerDetailsComponent = (): JSX.Element | null => {
    if (answerStatus === 'completed') {
      return <AnswerDetails answer={answerDetails!} question={question!} />;
    }
    if (answerStatus === 'errored') {
      return (
        <Alert severity="error">{t(messagesTranslations.fetchingError)}</Alert>
      );
    }
    if (answerStatus === 'submitted') {
      return <LoadingIndicator />;
    }
    return null;
  };

  const changeDisplayedIndex = async (newIndex: number): Promise<void> => {
    try {
      if (answerDataById?.[allAnswers[newIndex].id]?.status !== 'completed') {
        await tryFetchAnswerById(
          submissionId,
          questionId,
          allAnswers[newIndex].id,
        );
      }
    } finally {
      setSliderIndex(newIndex);
      setDisplayedIndex(newIndex);
    }
  };

  return (
    <>
      {answerSubmittedTimes.length > 1 && (
        <div className="w-[calc(100%_-_17rem)] mx-auto pt-8">
          <CustomSlider
            defaultValue={currentAnswerMarker.value}
            marks={answerSubmittedTimes}
            max={currentAnswerMarker.value}
            min={earliestAnswerMarker.value}
            onChange={(event, value) => {
              // The component specs mention that value can either be number or Array,
              // but since there is only a single slider value it will always be a number
              const newIndex = value as number;
              if (
                event.type.includes('mouse') ||
                event.type.includes('touch')
              ) {
                setSliderIndex(newIndex);
              } else {
                changeDisplayedIndex(newIndex);
              }
            }}
            onChangeCommitted={(_, value) => {
              const newIndex = value as number;
              changeDisplayedIndex(newIndex);
            }}
            step={null}
            valueLabelDisplay="on"
            valueLabelFormat={(value) =>
              `${formatLongDateTime(allAnswers[value].createdAt)} (${value + 1} of ${allAnswers.length})`
            }
          />
        </div>
      )}
      <div className={sliderIndex === displayedIndex ? '' : 'opacity-60'}>
        {renderAnswerDetailsComponent()}
      </div>
    </>
  );
};

export default AllAttemptsTimelineView;
