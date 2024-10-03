import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Alert, Typography } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';
import {
  AllAnswerItem,
  AnswerStatisticsData,
  QuestionDetails,
} from 'types/course/statistics/assessmentStatistics';

import { fetchAnswer } from 'course/assessment/operations/statistics';
import Accordion from 'lib/components/core/layouts/Accordion';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import CustomSlider from 'lib/components/extensions/CustomSlider';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';
import messagesTranslations from 'lib/translations/messages';

import AnswerDetails from '../AnswerDetails/AnswerDetails';

interface Props {
  allAnswers: AllAnswerItem[];
  questionNumber: number;
}

const translations = defineMessages({
  questionTitle: {
    id: 'course.assessment.statistics.questionTitle',
    defaultMessage: 'Question {index}',
  },
  pastAnswerTitle: {
    id: 'course.assessment.statistics.pastAnswerTitle',
    defaultMessage: 'Submitted At: {submittedAt}',
  },
});

const AllAttemptsDisplay: FC<Props> = (props) => {
  const { allAnswers, questionNumber } = props;

  const { t } = useTranslation();

  const [answersCache, setAnswersCache] = useState<{
    [id: number]: {
      details: AnswerStatisticsData<keyof typeof QuestionType> | null;
      status: 'pending' | 'completed' | 'errored';
    };
  }>({});
  // sliderIndex is the uncommited index that is updated on drag
  // displayedIndex is updated on drop or with any non-mouse (keyboard) events
  const [sliderIndex, setSliderIndex] = useState(allAnswers.length - 1);
  const [displayedIndex, setDisplayedIndex] = useState(allAnswers.length - 1);
  const answerStatus = answersCache[allAnswers[displayedIndex].id]?.status;
  const answerDetails = answersCache[allAnswers[displayedIndex].id]?.details;

  // We query question data with the answer because the answer can affect how the question is displayed
  // (e.g. option randomization for mcq/mrq questions). However, we can take advantage of the fact that
  // the question should remain the same across all answers.
  const [question, setQuestion] =
    useState<QuestionDetails<keyof typeof QuestionType>>();

  const tryFetchAnswerById = (answerId: number): Promise<void> => {
    setAnswersCache({
      ...answersCache,
      [answerId]: {
        details: null,
        status: 'pending',
      },
    });
    return fetchAnswer(answerId)
      .then((details) => {
        setAnswersCache({
          ...answersCache,
          [answerId]: {
            details,
            status: 'completed',
          },
        });
        setQuestion(details.question);
      })
      .catch(() => {
        setAnswersCache({
          ...answersCache,
          [answerId]: {
            details: null,
            status: 'errored',
          },
        });
      });
  };

  useEffect(() => {
    if (!answerDetails) {
      tryFetchAnswerById(allAnswers[displayedIndex].id);
    }
  }, []);

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

  const renderQuestionComponent = (): JSX.Element => {
    if (question) {
      return (
        <Accordion
          defaultExpanded={false}
          disabled={false}
          disableGutters
          displayDotIndicator
          title={t(translations.questionTitle, {
            index: questionNumber,
          })}
        >
          <div className="ml-4 mt-4">
            <Typography variant="body1">{question?.title}</Typography>
            <Typography
              dangerouslySetInnerHTML={{
                __html: question?.description,
              }}
              variant="body2"
            />
          </div>
        </Accordion>
      );
    }
    return (
      <Accordion
        disabled
        title={t(translations.questionTitle, {
          index: questionNumber,
        })}
      >
        <div />
      </Accordion>
    );
  };

  const renderAnswerDetailsComponent = (): JSX.Element | null => {
    if (answerStatus === 'completed') {
      return (
        <>
          <Typography variant="body1">
            {t(translations.pastAnswerTitle, {
              submittedAt: formatLongDateTime(answerDetails!.createdAt),
            })}
          </Typography>
          <AnswerDetails answer={answerDetails!} question={question!} />
        </>
      );
    }
    if (answerStatus === 'errored') {
      return (
        <Alert severity="error">{t(messagesTranslations.fetchingError)}</Alert>
      );
    }
    if (answerStatus === 'pending') {
      return <LoadingIndicator />;
    }
    return null;
  };

  const changeDisplayedIndex = async (newIndex: number): Promise<void> => {
    try {
      if (answersCache[allAnswers[newIndex].id]?.status !== 'completed') {
        await tryFetchAnswerById(allAnswers[newIndex].id);
      }
    } finally {
      setSliderIndex(newIndex);
      setDisplayedIndex(newIndex);
    }
  };

  return (
    <>
      {renderQuestionComponent()}
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

export default AllAttemptsDisplay;
