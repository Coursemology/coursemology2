import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';
import { QuestionAnswerDetails } from 'types/course/statistics/assessmentStatistics';

import { fetchQuestionAnswerDetails } from 'course/assessment/operations/statistics';
import Accordion from 'lib/components/core/layouts/Accordion';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { getPastAnswersURL } from 'lib/helpers/url-builders';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

import AnswerDetails from '../AnswerDetails/AnswerDetails';

const translations = defineMessages({
  questionTitle: {
    id: 'course.assessment.statistics.questionTitle',
    defaultMessage: 'Question {index}',
  },
  gradeDisplay: {
    id: 'course.assessment.statistics.gradeDisplay',
    defaultMessage: 'Grade: {grade} / {maxGrade}',
  },
  morePastAnswers: {
    id: 'course.assessment.statistics.morePastAnswers',
    defaultMessage: 'View All Past Answers',
  },
  currentAnswer: {
    id: 'course.assessment.statistics.currentAnswer',
    defaultMessage: 'Most Recent Answer',
  },
  pastAnswerTitle: {
    id: 'course.assessment.statistics.pastAnswerTitle',
    defaultMessage: '#{index}) Submitted At: {submittedAt}',
  },
});

interface Props {
  curAnswerId: number;
  index: number;
}

const MAX_DISPLAYED_ANSWERS = 10;

const AllAttemptsIndex: FC<Props> = (props) => {
  const { curAnswerId, index } = props;
  const { t } = useTranslation();
  const { courseId, assessmentId } = useParams();

  const fetchQuestionAndCurrentAnswerDetails = (): Promise<
    QuestionAnswerDetails<keyof typeof QuestionType>
  > => {
    return fetchQuestionAnswerDetails(curAnswerId);
  };

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchQuestionAndCurrentAnswerDetails}
    >
      {(data): JSX.Element => {
        const pastAnswersURL = getPastAnswersURL(
          courseId,
          assessmentId,
          data.submissionQuestionId,
        );

        const currentAnswer = data.allAnswers.find(
          (answer) => answer.currentAnswer,
        );
        const displayedAnswers = data.allAnswers
          .filter((answer) => !answer.currentAnswer)
          .slice(0, MAX_DISPLAYED_ANSWERS - 1);

        return (
          <>
            <Accordion
              defaultExpanded={false}
              title={t(translations.questionTitle, { index })}
            >
              <div className="ml-4 mt-4">
                <Typography variant="body1">{data.question.title}</Typography>
                <Typography
                  dangerouslySetInnerHTML={{
                    __html: data.question.description,
                  }}
                  variant="body2"
                />
              </div>
            </Accordion>
            <Accordion
              className="mt-2"
              defaultExpanded
              title={t(translations.currentAnswer)}
            >
              <AnswerDetails answer={currentAnswer!} question={data.question} />
            </Accordion>
            {displayedAnswers.length > 0 &&
              displayedAnswers.map((answer, answerIndex) => (
                <Accordion
                  key={`past-answer-${answer.id}`}
                  className="mt-2"
                  defaultExpanded={false}
                  title={t(translations.pastAnswerTitle, {
                    index: answerIndex + 1,
                    submittedAt: formatLongDateTime(answer.createdAt),
                  })}
                >
                  <AnswerDetails answer={answer} question={data.question} />
                </Accordion>
              ))}
            <Link opensInNewTab to={pastAnswersURL}>
              <Typography className="mt-4" variant="body2">
                {t(translations.morePastAnswers)}
              </Typography>
            </Link>
          </>
        );
      }}
    </Preload>
  );
};

export default AllAttemptsIndex;
