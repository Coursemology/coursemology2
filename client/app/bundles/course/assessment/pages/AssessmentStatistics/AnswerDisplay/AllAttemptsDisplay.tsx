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
import { formatLongDateTime } from 'lib/moment';

import AnswerDetails from '../AnswerDetails/AnswerDetails';
import QuestionDetails from '../QuestionDetails/QuestionDetails';

interface Props {
  allAnswers: Answer<keyof typeof QuestionType>[];
  question: Question<keyof typeof QuestionType>;
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
    question,
    questionNumber,
    submissionEditUrl,
    name,
    pastAnswersURL,
  } = props;

  const { t } = useTranslation();

  // TODO: distance between points inside Slider to be reflective towards the time distance
  // (for example, the distance between 1:00PM to 1:01PM should not be equal to 1:00PM to 2:00PM)
  const answerSubmittedTimes = allAnswers.map((answer, idx) => {
    return {
      value: idx,
      label:
        idx === 0 || idx === allAnswers.length - 1
          ? formatLongDateTime(answer.submittedAt)
          : '',
    };
  });

  const currentAnswerMarker =
    answerSubmittedTimes[answerSubmittedTimes.length - 1];

  const [displayedIndex, setDisplayedIndex] = useState(
    currentAnswerMarker.value,
  );

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

      {answerSubmittedTimes.length > 1 && (
        <div className="w-[calc(100%_-_17rem)] mx-auto mb-4">
          <Slider
            defaultValue={currentAnswerMarker.value}
            onChange={(_, value) => {
              setDisplayedIndex(Array.isArray(value) ? value[0] : value);
            }}
            points={answerSubmittedTimes}
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
          <Typography variant="body1">{question.title}</Typography>
          <Typography
            dangerouslySetInnerHTML={{
              __html: question.description,
            }}
            variant="body2"
          />
        </div>
        <div className="m-4 mt-8">
          <Typography variant="body1">
            {t(translations.questionDetailsTitle)}
          </Typography>
          <QuestionDetails question={question} />
        </div>
      </Accordion>

      <AnswerDetails
        answer={allAnswers[displayedIndex ?? answerSubmittedTimes.length - 1]}
        question={question}
      />
    </>
  );
};

export default AllAttemptsDisplay;
