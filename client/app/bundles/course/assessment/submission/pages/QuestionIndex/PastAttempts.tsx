import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { QuestionType } from 'types/course/assessment/question';
import { QuestionAllAnswerDisplayDetails } from 'types/course/statistics/assessmentStatistics';

import { fetchAllAnswers } from 'course/assessment/operations/statistics';
import AllAttemptsDisplay from 'course/assessment/pages/AssessmentStatistics/AnswerDisplay/AllAttemptsDisplay';
import Comment from 'course/assessment/pages/AssessmentStatistics/AnswerDisplay/Comment';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { getEditSubmissionQuestionURL } from 'lib/helpers/url-builders';

const PastAnswers: FC = () => {
  const { courseId, assessmentId, submissionQuestionId } = useParams();
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
        return data.isAnswersDisplayed ? (
          <>
            <AllAttemptsDisplay
              allAnswers={data.allAnswers}
              question={data.question}
              questionNumber={data.question.questionNumber!}
              submissionEditUrl={getEditSubmissionQuestionURL(
                courseId,
                assessmentId,
                data.submissionId,
                data.question.questionNumber,
              )}
            />
            {data.comments.length > 0 && <Comment comments={data.comments} />}
          </>
        ) : (
          <div />
        );
      }}
    </Preload>
  );
};
export default PastAnswers;
