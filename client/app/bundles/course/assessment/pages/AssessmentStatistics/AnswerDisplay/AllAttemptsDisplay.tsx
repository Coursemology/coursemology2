import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Slider, Typography } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';
import {
  AllAnswerDetails,
  QuestionDetails,
} from 'types/course/statistics/assessmentStatistics';

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
  submissionPage: {
    id: 'course.assessment.statistics.submissionPage',
    defaultMessage: 'Go to Answer Page',
  },
});

const AllAttemptsDisplay: FC<Props> = (props) => {
  const { allAnswers, question, questionNumber, submissionEditUrl } = props;

  const { t } = useTranslation();

  const currentAnswer = allAnswers.find((answer) => answer.currentAnswer);
  const sortedAnswers = allAnswers.filter((answer) => !answer.currentAnswer);

  sortedAnswers.push(currentAnswer!);

  // TODO: distance between points inside Slider to be reflective towards the time distance
  // (for example, the distance between 1:00PM to 1:01PM should not be equal to 1:00PM to 2:00PM)
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
        {t(translations.pastAnswerTitle, {
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
