// Discussion posts on this submission -- question comments and programming annotations alike -- keyed by post
// id. Posts arrive with the submission, as comments and annotations are created, edited or deleted, and as the
// AI feedback comment that rubric grading produces.
import { createSlice } from '@reduxjs/toolkit';
import { CommentPostMiniEntity } from 'types/course/comments';

import { isOneOf } from '../../utils/matchers';
import actions from '../constants';

export type PostsState = Record<number, CommentPostMiniEntity>;

// A batch of posts: the whole submission's, or one programming file's annotations.
interface PostsLoadedAction {
  type:
    | typeof actions.FETCH_SUBMISSION_SUCCESS
    | typeof actions.FETCH_ANNOTATION_SUCCESS;
  payload: { posts?: CommentPostMiniEntity[] };
}

// A single post that was created or edited.
interface PostSavedAction {
  type:
    | typeof actions.CREATE_COMMENT_SUCCESS
    | typeof actions.UPDATE_COMMENT_SUCCESS
    | typeof actions.CREATE_ANNOTATION_SUCCESS
    | typeof actions.UPDATE_ANNOTATION_SUCCESS;
  payload: CommentPostMiniEntity;
}

// Grading a rubric answer may produce an AI feedback comment -- a draft for staff, or one already published to
// the student, depending on the course's feedback workflow. Absent when there is none the viewer may see.
interface RubricAutogradedAction {
  type: typeof actions.AUTOGRADE_RUBRIC_SUCCESS;
  payload: { aiGeneratedComment?: CommentPostMiniEntity };
}

interface PostDeletedAction {
  type:
    | typeof actions.DELETE_COMMENT_SUCCESS
    | typeof actions.DELETE_ANNOTATION_SUCCESS;
  payload: { postId: number };
}

const initialState: PostsState = {};

export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        isOneOf<PostsLoadedAction>(
          actions.FETCH_SUBMISSION_SUCCESS,
          actions.FETCH_ANNOTATION_SUCCESS,
        ),
        (state, action) => {
          action.payload.posts?.forEach((post) => {
            state[post.id] = post;
          });
        },
      )
      .addMatcher(
        isOneOf<PostSavedAction>(
          actions.CREATE_COMMENT_SUCCESS,
          actions.UPDATE_COMMENT_SUCCESS,
          actions.CREATE_ANNOTATION_SUCCESS,
          actions.UPDATE_ANNOTATION_SUCCESS,
        ),
        (state, action) => {
          state[action.payload.id] = action.payload;
        },
      )
      .addMatcher(
        isOneOf<RubricAutogradedAction>(actions.AUTOGRADE_RUBRIC_SUCCESS),
        (state, action) => {
          const { aiGeneratedComment } = action.payload;
          if (aiGeneratedComment) {
            state[aiGeneratedComment.id] = aiGeneratedComment;
          }
        },
      )
      .addMatcher(
        isOneOf<PostDeletedAction>(
          actions.DELETE_COMMENT_SUCCESS,
          actions.DELETE_ANNOTATION_SUCCESS,
        ),
        (state, action) => {
          delete state[action.payload.postId];
        },
      );
  },
});

export default postsSlice.reducer;
