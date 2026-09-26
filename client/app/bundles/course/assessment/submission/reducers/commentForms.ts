// What the user is typing into this submission's comment boxes -- new comments on each question, new annotations on
// each programming file line, and edits to existing posts -- plus whether a comment is being submitted or updated.
import { createSlice } from '@reduxjs/toolkit';

import { isOneOf } from '../../utils/matchers';
import actions from '../constants';

export interface CommentFormsState {
  isSubmittingNormalComment: boolean;
  isSubmittingDelayedComment: boolean;
  isUpdatingComment: boolean;
  // The new-comment box of each question's topic, keyed by topic id.
  topics: Record<number, string>;
  // The edit box of each comment or annotation post, keyed by post id.
  posts: Record<number, string>;
  // The new-annotation box on each line of each programming file, keyed by file id, then line number.
  annotations: Record<number, Record<number, string>>;
}

interface SubmissionFetchedAction {
  type: typeof actions.FETCH_SUBMISSION_SUCCESS;
  payload: { topics?: { id: number }[]; annotations?: { fileId: number }[] };
}

interface NewCommentChangedAction {
  type: typeof actions.CREATE_COMMENT_CHANGE;
  payload: { topicId: number; text: string };
}

interface CommentCreatedAction {
  type: typeof actions.CREATE_COMMENT_SUCCESS;
  payload: { topicId: number };
}

interface NewAnnotationChangedAction {
  type: typeof actions.CREATE_ANNOTATION_CHANGE;
  payload: { fileId: number; line: number; text: string };
}

interface AnnotationCreatedAction {
  type: typeof actions.CREATE_ANNOTATION_SUCCESS;
  payload: { fileId: number; line: number };
}

interface PostEditChangedAction {
  type:
    | typeof actions.UPDATE_COMMENT_CHANGE
    | typeof actions.UPDATE_ANNOTATION_CHANGE;
  payload: { postId: number; text: string };
}

interface PostUpdatedAction {
  type:
    | typeof actions.UPDATE_COMMENT_SUCCESS
    | typeof actions.UPDATE_ANNOTATION_SUCCESS;
  payload: { id: number; text: string };
}

interface PostDeletedAction {
  type:
    | typeof actions.DELETE_COMMENT_SUCCESS
    | typeof actions.DELETE_ANNOTATION_SUCCESS;
  payload: { postId: number };
}

interface CreateRequestedAction {
  type:
    | typeof actions.CREATE_COMMENT_REQUEST
    | typeof actions.CREATE_ANNOTATION_REQUEST;
  isDelayedComment?: boolean;
}

// Grading an answer may return its latest attempt, whose programming files start with empty annotation boxes.
interface AnswerAutogradedAction {
  type: typeof actions.AUTOGRADE_SUCCESS;
  payload: { latestAnswer?: { annotations?: { fileId: number }[] } };
}

const initialState: CommentFormsState = {
  isSubmittingNormalComment: false,
  isSubmittingDelayedComment: false,
  isUpdatingComment: false,
  topics: {},
  posts: {},
  annotations: {},
};

const annotationBoxesOf = (
  state: CommentFormsState,
  fileId: number,
): Record<number, string> => {
  state.annotations[fileId] ??= {};
  return state.annotations[fileId];
};

export const commentFormsSlice = createSlice({
  name: 'commentForms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(
        isOneOf<SubmissionFetchedAction>(actions.FETCH_SUBMISSION_SUCCESS),
        (state, action) => {
          // Replaced rather than merged: a freshly loaded submission starts every box empty.
          state.topics = Object.fromEntries(
            (action.payload.topics ?? []).map((topic) => [topic.id, '']),
          );
          state.annotations = Object.fromEntries(
            (action.payload.annotations ?? []).map((annotation) => [
              annotation.fileId,
              {},
            ]),
          );
        },
      )
      .addMatcher(
        isOneOf<NewCommentChangedAction>(actions.CREATE_COMMENT_CHANGE),
        (state, action) => {
          state.topics[action.payload.topicId] = action.payload.text;
        },
      )
      .addMatcher(
        isOneOf<CommentCreatedAction>(actions.CREATE_COMMENT_SUCCESS),
        (state, action) => {
          state.isSubmittingNormalComment = false;
          state.isSubmittingDelayedComment = false;
          state.topics[action.payload.topicId] = '';
        },
      )
      .addMatcher(
        isOneOf<NewAnnotationChangedAction>(actions.CREATE_ANNOTATION_CHANGE),
        (state, action) => {
          const { fileId, line, text } = action.payload;
          annotationBoxesOf(state, fileId)[line] = text;
        },
      )
      .addMatcher(
        isOneOf<AnnotationCreatedAction>(actions.CREATE_ANNOTATION_SUCCESS),
        (state, action) => {
          const { fileId, line } = action.payload;
          state.isSubmittingNormalComment = false;
          state.isSubmittingDelayedComment = false;
          annotationBoxesOf(state, fileId)[line] = '';
        },
      )
      .addMatcher(
        isOneOf<PostEditChangedAction>(
          actions.UPDATE_COMMENT_CHANGE,
          actions.UPDATE_ANNOTATION_CHANGE,
        ),
        (state, action) => {
          state.posts[action.payload.postId] = action.payload.text;
        },
      )
      .addMatcher(
        isOneOf<PostUpdatedAction>(
          actions.UPDATE_COMMENT_SUCCESS,
          actions.UPDATE_ANNOTATION_SUCCESS,
        ),
        (state, action) => {
          state.isUpdatingComment = false;
          state.posts[action.payload.id] = action.payload.text;
        },
      )
      .addMatcher(
        isOneOf<PostDeletedAction>(
          actions.DELETE_COMMENT_SUCCESS,
          actions.DELETE_ANNOTATION_SUCCESS,
        ),
        (state, action) => {
          delete state.posts[action.payload.postId];
        },
      )
      .addMatcher(
        isOneOf<CreateRequestedAction>(
          actions.CREATE_COMMENT_REQUEST,
          actions.CREATE_ANNOTATION_REQUEST,
        ),
        (state, action) => {
          state.isSubmittingNormalComment = !action.isDelayedComment;
          state.isSubmittingDelayedComment = Boolean(action.isDelayedComment);
        },
      )
      .addMatcher(
        isOneOf(
          actions.UPDATE_COMMENT_REQUEST,
          actions.UPDATE_ANNOTATION_REQUEST,
        ),
        (state) => {
          state.isUpdatingComment = true;
        },
      )
      .addMatcher(
        isOneOf(
          actions.CREATE_COMMENT_FAILURE,
          actions.CREATE_ANNOTATION_FAILURE,
        ),
        (state) => {
          state.isSubmittingNormalComment = false;
          state.isSubmittingDelayedComment = false;
        },
      )
      .addMatcher(
        isOneOf(
          actions.UPDATE_COMMENT_FAILURE,
          actions.UPDATE_ANNOTATION_FAILURE,
        ),
        (state) => {
          state.isUpdatingComment = false;
        },
      )
      .addMatcher(
        isOneOf<AnswerAutogradedAction>(actions.AUTOGRADE_SUCCESS),
        (state, action) => {
          action.payload.latestAnswer?.annotations?.forEach((annotation) => {
            state.annotations[annotation.fileId] = {};
          });
        },
      );
  },
});

export default commentFormsSlice.reducer;
