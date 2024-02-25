import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';
import { QuestionAnswerDetails } from 'types/course/statistics/assessmentStatistics';

import { fetchQuestionAnswerDetails } from 'course/assessment/operations/statistics';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import {
  getEditSubmissionQuestionURL,
  getPastAnswersURL,
} from 'lib/helpers/url-builders';
import useTranslation from 'lib/hooks/useTranslation';

import AllAttemptsDisplay from './AllAttemptsDisplay';
import Comment from './Comment';

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
    defaultMessage: 'Submitted At: {submittedAt}',
  },
  submissionPage: {
    id: 'course.assessment.statistics.submissionPage',
    defaultMessage: 'Go to Answer Page',
  },
});

interface Props {
  curAnswerId: number;
  index: number;
}

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

        return (
          <>
            <AllAttemptsDisplay
              allAnswers={data.allAnswers}
              question={data.question}
              questionNumber={index}
              submissionEditUrl={getEditSubmissionQuestionURL(
                courseId,
                assessmentId,
                data.submissionId,
                index,
              )}
            />

            <Link opensInNewTab to={pastAnswersURL}>
              <Typography className="mt-4" variant="body2">
                {t(translations.morePastAnswers)}
              </Typography>
            </Link>

            {data.comments.length > 0 && <Comment comments={data.comments} />}
          </>
        );
      }}
    </Preload>
  );
};

export default AllAttemptsIndex;
