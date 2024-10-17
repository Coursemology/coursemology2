import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { QuestionType } from 'types/course/assessment/question';
import { QuestionAnswerDetails } from 'types/course/statistics/assessmentStatistics';

import { fetchAttempts } from 'course/assessment/operations/statistics';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import {
  getEditSubmissionQuestionURL,
  getPastAnswersURL,
} from 'lib/helpers/url-builders';

import AllAttemptsDisplay from './AllAttemptsDisplay';
import Comment from './Comment';

const LIMIT = 10;

interface Props {
  curAnswerId: number;
  index: number;
  name: string;
}

const AllAttemptsIndex: FC<Props> = (props) => {
  const { curAnswerId, index, name } = props;
  const { courseId, assessmentId } = useParams();

  const fetchAttemptDetails = (): Promise<
    QuestionAnswerDetails<keyof typeof QuestionType>
  > => {
    return fetchAttempts(curAnswerId, LIMIT);
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchAttemptDetails}>
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
              allQuestions={data.allQuestions}
              name={name}
              pastAnswersURL={pastAnswersURL}
              questionNumber={index}
              submissionEditUrl={getEditSubmissionQuestionURL(
                courseId,
                assessmentId,
                data.submissionId,
                index,
              )}
            />

            {data.comments.length > 0 && <Comment comments={data.comments} />}
          </>
        );
      }}
    </Preload>
  );
};

export default AllAttemptsIndex;
