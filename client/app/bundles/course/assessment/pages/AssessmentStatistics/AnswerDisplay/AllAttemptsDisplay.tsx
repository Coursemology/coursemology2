import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Alert, Typography } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';
import { Answer, Question } from 'types/course/statistics/assessmentStatistics';

import { fetchAnswer } from 'course/assessment/operations/statistics';
import Accordion from 'lib/components/core/layouts/Accordion';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Slider from 'lib/components/extensions/CustomSlider';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';
import messagesTranslations from 'lib/translations/messages';

import AnswerDetails from '../AnswerDetails/AnswerDetails';

import { processAttempts } from './utils';

interface Props {
  allAnswers: Answer<keyof typeof QuestionType>[];
  allQuestions: Question<keyof typeof QuestionType>[];
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
  const { allAnswers, allQuestions, questionNumber } = props;

  const { questionMap, allProcessedAnswers, sliderPoints, maxIndex } =
    processAttempts(allQuestions, allAnswers);

  const { t } = useTranslation();

  const [answersCache, setAnswersCache] = useState<{
    [id: number]: {
      details: Answer<keyof typeof QuestionType> | null;
      status: 'pending' | 'completed' | 'errored';
    };
  }>({});
  // sliderIndex is the uncommited index that is updated on drag
  // displayedIndex is updated on drop or with any non-mouse (keyboard) events
  const [sliderIndex, setSliderIndex] = useState(
    allProcessedAnswers.length - 1,
  );
  const [displayedIndex, setDisplayedIndex] = useState(
    allProcessedAnswers.length - 1,
  );
  const answerStatus =
    answersCache[allProcessedAnswers[displayedIndex].id]?.status;
  const answerDetails =
    answersCache[allProcessedAnswers[displayedIndex].id]?.details;

  // We query question data with the answer because the answer can affect how the question is displayed
  // (e.g. option randomization for mcq/mrq questions). However, we can take advantage of the fact that
  // the question should remain the same across all answers.
  const [question, setQuestion] =
    useState<Question<keyof typeof QuestionType>>();

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
      tryFetchAnswerById(allProcessedAnswers[displayedIndex].id);
    }
  }, []);

  const [currAnswer, setCurrAnswer] = useState(allProcessedAnswers[maxIndex]);
  const [currQuestion, setCurrQuestion] = useState<
    Question<keyof typeof QuestionType>
  >(questionMap.get(maxIndex) ?? ({} as Question<keyof typeof QuestionType>));

  const renderQuestionComponent = (): JSX.Element => {
    if (currQuestion) {
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
            <Typography variant="body1">{currQuestion?.title}</Typography>
            <Typography
              dangerouslySetInnerHTML={{
                __html: currQuestion?.description,
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
              submittedAt: formatLongDateTime(answerDetails!.submittedAt),
            })}
          </Typography>
          <AnswerDetails answer={currAnswer!} question={question!} />
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
      if (
        answersCache[allProcessedAnswers[newIndex].id]?.status !== 'completed'
      ) {
        await tryFetchAnswerById(allProcessedAnswers[newIndex].id);
      }
    } finally {
      setSliderIndex(newIndex);
      setDisplayedIndex(newIndex);
      setCurrAnswer(allProcessedAnswers[newIndex]);
      setCurrQuestion(
        questionMap.get(newIndex) ??
          ({} as Question<keyof typeof QuestionType>),
      );
    }
  };

  return (
    <>
      {renderQuestionComponent()}
      {maxIndex > 0 && (
        <div className="w-[calc(100%_-_17rem)] mx-auto mb-4">
          <Slider
            defaultValue={maxIndex}
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
            points={sliderPoints}
            valueLabelDisplay="auto"
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
