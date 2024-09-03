import { FC } from 'react';
import { useParams } from 'react-router-dom';

import { fetchLiveFeedbackHistory } from 'course/assessment/operations/liveFeedback';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import LiveFeedbackHistoryPage from './LiveFeedbackHistoryPage';

interface Props {
  questionNumber: number;
  questionId: number;
  courseUserId: number;
}

const LiveFeedbackHistoryIndex: FC<Props> = (props): JSX.Element => {
  const { questionNumber, questionId, courseUserId } = props;
  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const fetchLiveFeedbackHistoryDetails = (): Promise<void> =>
    fetchLiveFeedbackHistory(parsedAssessmentId, questionId, courseUserId);

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchLiveFeedbackHistoryDetails}
    >
      {(): JSX.Element => (
        <LiveFeedbackHistoryPage questionNumber={questionNumber} />
      )}
    </Preload>
  );
};

export default LiveFeedbackHistoryIndex;
