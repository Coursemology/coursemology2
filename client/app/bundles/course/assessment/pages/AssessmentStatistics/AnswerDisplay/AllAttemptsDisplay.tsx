import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Slider, Typography } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';
import {
  AllAnswerDetails,
  QuestionDetails,
} from 'types/course/statistics/assessmentStatistics';

import { workflowStates } from 'course/assessment/submission/constants';
import Accordion from 'lib/components/core/layouts/Accordion';
import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

import AnswerDetails from '../AnswerDetails/AnswerDetails';

interface Props {
  allAnswers: AllAnswerDetails<keyof typeof QuestionType>[];
  question: QuestionDetails<keyof typeof QuestionType>;
  questionNumber: number;
  submissionEditUrl: string;
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
  mostRecentAnswer: {
    id: 'course.assessment.statistics.mostRecentAnswer',
    defaultMessage: 'Current Answer (Attempting)',
  },
  submissionPage: {
    id: 'course.assessment.statistics.submissionPage',
    defaultMessage: 'Go to Answer Page',
  },
});

// only used as a dummy buffer time if the submission's state is attempting
// this is due to the time record for attempting answer being lower than any other
// states' answer, while it's actually the latest version.
const BUFFER_TIME = 100;

const AllAttemptsDisplay: FC<Props> = (props) => {
  const { allAnswers, question, questionNumber, submissionEditUrl } = props;

  const { t } = useTranslation();

  let currentAnswer = allAnswers.find((answer) => answer.currentAnswer);
  const sortedAnswers = allAnswers.filter((answer) => !answer.currentAnswer);

  if (
    sortedAnswers.length > 0 &&
    currentAnswer?.workflowState === workflowStates.Attempting
  ) {
    currentAnswer = {
      ...currentAnswer,
      createdAt: new Date(
        sortedAnswers[sortedAnswers.length - 1].createdAt.getTime() +
          BUFFER_TIME,
      ),
    };
  }

  sortedAnswers.push(currentAnswer!);

  const answerSubmittedTimes = sortedAnswers.map((answer, idx) => {
    return {
      value: idx,
      label:
        idx === 0 || idx === sortedAnswers.length - 1
          ? formatLongDateTime(answer.createdAt)
          : '',
    };
  });

  const currentAnswerMarker =
    answerSubmittedTimes[answerSubmittedTimes.length - 1];

  const earliestAnswerMarker = answerSubmittedTimes[0];
  const [displayedIndex, setDisplayedIndex] = useState(
    currentAnswerMarker.value,
  );

  const isCurrentAnswerStillAttempting =
    sortedAnswers[answerSubmittedTimes.length - 1].workflowState ===
    workflowStates.Attempting;

  return (
    <>
      <Link opensInNewTab to={submissionEditUrl}>
        <Typography className="mb-4" variant="body2">
          {t(translations.submissionPage)}
        </Typography>
      </Link>
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
      {answerSubmittedTimes.length > 1 && (
        <div className="w-[calc(100%_-_17rem)] mx-auto">
          <Slider
            defaultValue={currentAnswerMarker.value}
            marks={answerSubmittedTimes}
            max={currentAnswerMarker.value}
            min={earliestAnswerMarker.value}
            onChange={(_, value) => {
              setDisplayedIndex(Array.isArray(value) ? value[0] : value);
            }}
            step={null}
            valueLabelDisplay="off"
          />
        </div>
      )}

      <Typography variant="h6">
        {(!displayedIndex ||
          displayedIndex === answerSubmittedTimes.length - 1) &&
        isCurrentAnswerStillAttempting
          ? t(translations.mostRecentAnswer)
          : t(translations.pastAnswerTitle, {
              submittedAt: formatLongDateTime(
                sortedAnswers[displayedIndex ?? answerSubmittedTimes.length - 1]
                  .createdAt,
              ),
            })}
      </Typography>
      <AnswerDetails
        answer={
          sortedAnswers[displayedIndex ?? answerSubmittedTimes.length - 1]
        }
        question={question}
      />
    </>
  );
};

export default AllAttemptsDisplay;
