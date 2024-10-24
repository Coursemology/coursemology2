import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { History, OpenInNew } from '@mui/icons-material';
import {
  Card,
  CardHeader,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';
import { Answer, Question } from 'types/course/statistics/assessmentStatistics';

import Accordion from 'lib/components/core/layouts/Accordion';
import Link from 'lib/components/core/Link';
import Slider from 'lib/components/extensions/CustomSlider';
import useTranslation from 'lib/hooks/useTranslation';

import AnswerDetails from '../AnswerDetails/AnswerDetails';
import QuestionDetails from '../QuestionDetails/QuestionDetails';

import { processAttempts } from './utils';

interface Props {
  allAnswers: Answer<keyof typeof QuestionType>[];
  allQuestions: Question<keyof typeof QuestionType>[];
  questionNumber: number;
  submissionEditUrl: string;
  pastAnswersURL?: string;
  name: string;
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
  submissionPage: {
    id: 'course.assessment.statistics.submissionPage',
    defaultMessage: 'Go to Answer Page',
  },
  submittedAt: {
    id: 'course.assessment.statistics.submittedAt',
    defaultMessage: 'Submitted At',
  },
  pastAnswers: {
    id: 'course.assessment.statistics.pastAnswers',
    defaultMessage: 'See All Past Answers',
  },
  questionDetailsTitle: {
    id: 'course.assessment.statistics.questionDetailsTitle',
    defaultMessage: 'More Details',
  },
});

const AllAttemptsDisplay: FC<Props> = (props) => {
  const {
    allAnswers,
    allQuestions,
    questionNumber,
    submissionEditUrl,
    name,
    pastAnswersURL,
  } = props;

  const { t } = useTranslation();

  const { questionMap, allProcessedAnswers, sliderPoints, maxIndex } =
    processAttempts(allQuestions, allAnswers);

  const [currAnswer, setCurrAnswer] = useState(allProcessedAnswers[maxIndex]);
  const [currQuestion, setCurrQuestion] = useState<
    Question<keyof typeof QuestionType>
  >(questionMap.get(maxIndex) ?? ({} as Question<keyof typeof QuestionType>));

  const updateDisplayedIndex = (index: number): void => {
    setCurrAnswer(allProcessedAnswers[index]);
    setCurrQuestion(
      questionMap.get(index) ?? ({} as Question<keyof typeof QuestionType>),
    );
  };

  return (
    <>
      <Card className="mb-4" variant="outlined">
        <CardHeader
          action={
            <div className="space-x-2">
              {pastAnswersURL && (
                <Tooltip placement="top" title={t(translations.pastAnswers)}>
                  <IconButton
                    className="p-2"
                    component={Link}
                    rel="noopener noreferrer"
                    size="small"
                    target="_blank"
                    to={pastAnswersURL}
                  >
                    <History />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip placement="top" title={t(translations.submissionPage)}>
                <IconButton
                  className="p-2"
                  component={Link}
                  rel="noopener noreferrer"
                  size="small"
                  target="_blank"
                  to={submissionEditUrl}
                >
                  <OpenInNew />
                </IconButton>
              </Tooltip>
            </div>
          }
          title={<Typography variant="h6">{name}</Typography>}
        />
      </Card>

      {maxIndex > 0 && (
        <div className="w-[calc(100%_-_17rem)] mx-auto mb-4">
          <Slider
            defaultValue={maxIndex}
            onChange={(_, value) => {
              updateDisplayedIndex(Array.isArray(value) ? value[0] : value);
            }}
            points={sliderPoints}
            valueLabelDisplay="auto"
          />
        </div>
      )}

      <Accordion
        defaultExpanded={false}
        disableGutters
        displayDotIndicator
        title={t(translations.questionTitle, {
          index: questionNumber,
        })}
      >
        <div className="m-4">
          <Typography variant="body1">{currQuestion.title}</Typography>
          <Typography
            dangerouslySetInnerHTML={{
              __html: currQuestion.description,
            }}
            variant="body2"
          />
        </div>
        <div className="m-4 mt-8">
          <Typography variant="body1">
            {t(translations.questionDetailsTitle)}
          </Typography>
          <QuestionDetails question={currQuestion} />
        </div>
      </Accordion>

      <AnswerDetails answer={currAnswer} question={currQuestion} />
    </>
  );
};

export default AllAttemptsDisplay;
