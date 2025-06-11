import { FC } from 'react';

import { fetchLiveFeedbackHistory } from 'course/assessment/operations/liveFeedback';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import LiveFeedbackHistoryPage from './LiveFeedbackHistoryPage';

interface Props {
  questionNumber: number;
  questionId: number;
  courseUserId: number;
  assessmentId: number;
}

const LiveFeedbackHistoryIndex: FC<Props> = (props): JSX.Element => {
  const { questionNumber, questionId, courseUserId, assessmentId } = props;

  const fetchLiveFeedbackHistoryDetails = (): Promise<void> =>
    fetchLiveFeedbackHistory(assessmentId, questionId, courseUserId);

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
