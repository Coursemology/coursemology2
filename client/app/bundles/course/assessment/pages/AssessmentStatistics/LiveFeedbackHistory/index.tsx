import { FC } from 'react';

import { fetchLiveFeedbackHistory } from 'course/assessment/operations/liveFeedback';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import LiveFeedbackHistoryTimelineView from './LiveFeedbackHistoryTimelineView';

interface Props {
  questionNumber: number;
  questionId: number;
  courseUserId: number;
  assessmentId: number;
  courseId?: number; // Optional, only used for system or instance admin context
}

const LiveFeedbackHistoryContent: FC<Props> = (props): JSX.Element => {
  const { questionNumber, questionId, courseUserId, assessmentId, courseId } =
    props;

  const fetchLiveFeedbackHistoryDetails = (): Promise<void> =>
    fetchLiveFeedbackHistory(assessmentId, questionId, courseUserId, courseId);

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchLiveFeedbackHistoryDetails}
    >
      {(): JSX.Element => (
        <LiveFeedbackHistoryTimelineView questionNumber={questionNumber} />
      )}
    </Preload>
  );
};

export default LiveFeedbackHistoryContent;
