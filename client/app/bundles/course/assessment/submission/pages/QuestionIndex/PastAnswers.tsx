import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { QuestionType } from 'types/course/assessment/question';
import { QuestionAllAnswerDisplayDetails } from 'types/course/statistics/assessmentStatistics';

import { fetchAllAnswers } from 'course/assessment/operations/statistics';
import AnswerDetails from 'course/assessment/pages/AssessmentStatistics/AnswerDetails/AnswerDetails';
import Accordion from 'lib/components/core/layouts/Accordion';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { getSubmissionQuestionId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

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

const PastAnswers: FC = () => {
  const submissionQuestionId = getSubmissionQuestionId();
  const { t } = useTranslation();
  if (!submissionQuestionId) {
    return null;
  }

  const parsedSubmissionQuestionId = parseInt(submissionQuestionId, 10);

  const fetchAnswers = (): Promise<
    QuestionAllAnswerDisplayDetails<keyof typeof QuestionType>
  > => {
    return fetchAllAnswers(parsedSubmissionQuestionId);
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchAnswers}>
      {(data): JSX.Element => {
        const { question, allAnswers } = data;
        const currentAnswer = allAnswers.find((answer) => answer.currentAnswer);
        const otherAnswers = allAnswers.filter(
          (answer) => !answer.currentAnswer,
        );

        return (
          <>
            <Accordion title={t(translations.currentAnswer)}>
              <AnswerDetails answer={currentAnswer!} question={question} />
            </Accordion>
            {otherAnswers.length > 0 &&
              otherAnswers.map((answer, index) => (
                <Accordion
                  key={`past-answer-${answer.id}`}
                  className="mt-2"
                  defaultExpanded={false}
                  title={t(translations.pastAnswerTitle, {
                    index: index + 1,
                    submittedAt: formatLongDateTime(answer.createdAt),
                  })}
                >
                  <AnswerDetails answer={answer} question={question} />
                </Accordion>
              ))}
          </>
        );
      }}
    </Preload>
  );
};
export default PastAnswers;
