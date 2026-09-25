import { CommentPostMiniEntity } from 'types/course/comments';

import actions from '../../constants';
import reducer, { PostsState } from '../posts';

const buildPost = (
  id: number,
  overrides: Partial<CommentPostMiniEntity> = {},
): CommentPostMiniEntity =>
  ({
    id,
    topicId: 1,
    text: `post ${id}`,
    workflowState: 'published',
    isAiGenerated: false,
    ...overrides,
  }) as CommentPostMiniEntity;

describe('posts reducer', () => {
  const existing: PostsState = { 1: buildPost(1) };

  it('merges a batch of posts into the existing ones by id', () => {
    const state = reducer(existing, {
      type: actions.FETCH_SUBMISSION_SUCCESS,
      payload: { posts: [buildPost(1, { text: 'edited' }), buildPost(2)] },
    });

    expect(state[1].text).toBe('edited');
    expect(state[2]).toEqual(buildPost(2));
  });

  it('upserts a single created or edited post', () => {
    const state = reducer(existing, {
      type: actions.UPDATE_COMMENT_SUCCESS,
      payload: buildPost(1, { text: 'edited' }),
    });

    expect(state[1].text).toBe('edited');
  });

  it('adds the AI feedback comment that rubric grading returned', () => {
    const comment = buildPost(3, { isAiGenerated: true });
    const state = reducer(existing, {
      type: actions.AUTOGRADE_RUBRIC_SUCCESS,
      payload: { questionId: 1, aiGeneratedComment: comment },
    });

    expect(state[3]).toEqual(comment);
  });

  // A student sees the rubric breakdown only once the submission is published, so the action often arrives
  // carrying neither -- it must leave the posts untouched rather than insert an undefined entry.
  it('leaves the posts untouched when rubric grading returned no comment', () => {
    const state = reducer(existing, {
      type: actions.AUTOGRADE_RUBRIC_SUCCESS,
      payload: { questionId: 1 },
    });

    expect(state).toBe(existing);
  });

  it('removes a deleted post', () => {
    const state = reducer(
      { ...existing, 2: buildPost(2) },
      { type: actions.DELETE_COMMENT_SUCCESS, payload: { postId: 2 } },
    );

    expect(Object.keys(state)).toEqual(['1']);
  });
});
