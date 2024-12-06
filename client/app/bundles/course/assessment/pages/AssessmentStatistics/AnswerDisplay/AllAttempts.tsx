import { FC } from 'react';
import { SubmissionQuestionDetails } from 'types/course/statistics/assessmentStatistics';

import { fetchSubmissionQuestionDetails } from 'course/assessment/operations/statistics';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import AllAttemptsDisplay from './AllAttemptsDisplay';
import Comment from './Comment';

interface Props {
  index: number;
  questionId: number;
  submissionId: number;
}

const AllAttemptsIndex: FC<Props> = (props) => {
  const { index, questionId, submissionId } = props;

  const fetchCurrentSubmissionQuestionDetails =
    (): Promise<SubmissionQuestionDetails> =>
      fetchSubmissionQuestionDetails(submissionId, questionId);

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchCurrentSubmissionQuestionDetails}
    >
      {(data): JSX.Element => {
        return (
          <>
            <AllAttemptsDisplay
              allAnswers={data.allAnswers}
              questionNumber={index}
            />

            {data.comments.length > 0 && <Comment comments={data.comments} />}
          </>
        );
      }}
    </Preload>
  );
};

export default AllAttemptsIndex;
