// The discussion topics of this submission's questions, keyed by topic id. Each tracks the ids of its posts (the
// posts themselves live in the posts slice), so a post created, deleted, or produced by rubric grading as AI
// feedback is reflected here too.
import { createSlice } from '@reduxjs/toolkit';
import { CommentPostMiniEntity } from 'types/course/comments';

import { isOneOf } from '../../utils/matchers';
import actions from '../constants';
import { Topic, TopicState } from '../types';

interface TopicsLoadedAction {
  type: typeof actions.FETCH_SUBMISSION_SUCCESS;
  payload: { topics?: Topic[] };
}

interface CommentCreatedAction {
  type: typeof actions.CREATE_COMMENT_SUCCESS;
  payload: CommentPostMiniEntity;
}

// Grading a rubric answer may produce an AI feedback comment (see the posts slice). Absent when there is none
// the viewer may see.
interface RubricAutogradedAction {
  type: typeof actions.AUTOGRADE_RUBRIC_SUCCESS;
  payload: { aiGeneratedComment?: CommentPostMiniEntity };
}

interface CommentDeletedAction {
  type: typeof actions.DELETE_COMMENT_SUCCESS;
  payload: { topicId: number; postId: number };
}

const addPost = (state: TopicState, post: CommentPostMiniEntity): void => {
  const topic = state[post.topicId];
  if (topic && !topic.postIds.includes(post.id)) {
    topic.postIds.push(post.id);
  }
};

const initialState: TopicState = {};

export const topicsSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        isOneOf<TopicsLoadedAction>(actions.FETCH_SUBMISSION_SUCCESS),
        (state, action) => {
          action.payload.topics?.forEach((topic) => {
            state[topic.id] = topic;
          });
        },
      )
      .addMatcher(
        isOneOf<CommentCreatedAction>(actions.CREATE_COMMENT_SUCCESS),
        (state, action) => {
          addPost(state, action.payload);
        },
      )
      .addMatcher(
        isOneOf<RubricAutogradedAction>(actions.AUTOGRADE_RUBRIC_SUCCESS),
        (state, action) => {
          const { aiGeneratedComment } = action.payload;
          if (aiGeneratedComment) addPost(state, aiGeneratedComment);
        },
      )
      .addMatcher(
        isOneOf<CommentDeletedAction>(actions.DELETE_COMMENT_SUCCESS),
        (state, action) => {
          const { topicId, postId } = action.payload;
          const topic = state[topicId];
          if (topic) {
            topic.postIds = topic.postIds.filter((id) => id !== postId);
          }
        },
      );
  },
});

export default topicsSlice.reducer;
