import { AppState } from 'store';
import { CommentPostMiniEntity } from 'types/course/comments';

const getLocalState = (
  state: AppState,
): Record<number, CommentPostMiniEntity> => {
  return state.assessments.submission.posts;
};

export const getCommentPostById = (
  state: AppState,
  postId: number | null,
): CommentPostMiniEntity | null => {
  if (postId) {
    return getLocalState(state)[postId];
  }

  return null;
};
