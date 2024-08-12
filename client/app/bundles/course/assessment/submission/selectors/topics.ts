import { AppState } from 'store';

import { TopicState } from '../types';

const getLocalState = (state: AppState): TopicState => {
  return state.assessments.submission.topics;
};

export const getTopics = (state: AppState): TopicState => {
  return getLocalState(state);
};
