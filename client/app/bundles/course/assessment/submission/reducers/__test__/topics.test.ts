import { CommentPostMiniEntity } from 'types/course/comments';

import actions from '../../constants';
import { Topic, TopicState } from '../../types';
import reducer from '../topics';

const buildTopic = (id: number, postIds: number[] = []): Topic => ({
  id,
  questionId: id,
  submissionQuestionId: id,
  postIds,
});

const buildPost = (id: number, topicId: number): CommentPostMiniEntity =>
  ({ id, topicId }) as CommentPostMiniEntity;

describe('topics reducer', () => {
  const existing: TopicState = { 1: buildTopic(1, [10]) };

  it('merges the submission topics into the existing ones by id', () => {
    const state = reducer(existing, {
      type: actions.FETCH_SUBMISSION_SUCCESS,
      payload: { topics: [buildTopic(1, [10, 11]), buildTopic(2)] },
    });

    expect(state[1].postIds).toEqual([10, 11]);
    expect(state[2]).toEqual(buildTopic(2));
  });

  it('records a created comment on its topic, once', () => {
    const created = reducer(existing, {
      type: actions.CREATE_COMMENT_SUCCESS,
      payload: buildPost(11, 1),
    });
    const createdAgain = reducer(created, {
      type: actions.CREATE_COMMENT_SUCCESS,
      payload: buildPost(11, 1),
    });

    expect(createdAgain[1].postIds).toEqual([10, 11]);
  });

  it('records the AI feedback comment that rubric grading returned', () => {
    const state = reducer(existing, {
      type: actions.AUTOGRADE_RUBRIC_SUCCESS,
      payload: { questionId: 1, aiGeneratedComment: buildPost(12, 1) },
    });

    expect(state[1].postIds).toEqual([10, 12]);
  });

  it('leaves the topics untouched when rubric grading returned no comment', () => {
    const state = reducer(existing, {
      type: actions.AUTOGRADE_RUBRIC_SUCCESS,
      payload: { questionId: 1 },
    });

    expect(state).toBe(existing);
  });

  it('drops a deleted comment from its topic', () => {
    const state = reducer(existing, {
      type: actions.DELETE_COMMENT_SUCCESS,
      payload: { topicId: 1, postId: 10 },
    });

    expect(state[1].postIds).toEqual([]);
  });
});
