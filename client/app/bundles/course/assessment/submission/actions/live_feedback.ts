import { AppDispatch } from 'store';

import CourseAPI from 'api/course';

import { storeInitialLiveFeedbackChats } from '../reducers/liveFeedbackChats';
import { LiveFeedbackThread } from '../types';

const fetchLiveFeedbackChat = async (
  dispatch: AppDispatch,
  answerId: number,
): Promise<void> => {
  const response =
    await CourseAPI.assessment.submissions.fetchLiveFeedbackChat(answerId);
  dispatch(
    storeInitialLiveFeedbackChats({
      thread: response.data as LiveFeedbackThread,
    }),
  );
};

export default fetchLiveFeedbackChat;
