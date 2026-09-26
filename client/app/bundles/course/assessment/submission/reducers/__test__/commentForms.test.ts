import actions from '../../constants';
import reducer, { CommentFormsState } from '../commentForms';

const loaded = (): CommentFormsState =>
  reducer(undefined, {
    type: actions.FETCH_SUBMISSION_SUCCESS,
    payload: { topics: [{ id: 1 }], annotations: [{ fileId: 7 }] },
  });

describe('commentForms reducer', () => {
  it('starts every box empty when the submission loads, keeping post edits', () => {
    const editing = reducer(loaded(), {
      type: actions.UPDATE_COMMENT_CHANGE,
      payload: { postId: 10, text: 'draft edit' },
    });
    const reloaded = reducer(editing, {
      type: actions.FETCH_SUBMISSION_SUCCESS,
      payload: { topics: [{ id: 2 }], annotations: [] },
    });

    expect(reloaded.topics).toEqual({ 2: '' });
    expect(reloaded.annotations).toEqual({});
    expect(reloaded.posts).toEqual({ 10: 'draft edit' });
  });

  it('clears the new-comment box once the comment is created', () => {
    const typed = reducer(loaded(), {
      type: actions.CREATE_COMMENT_CHANGE,
      payload: { topicId: 1, text: 'hello' },
    });
    const submitting = reducer(typed, {
      type: actions.CREATE_COMMENT_REQUEST,
      isDelayedComment: true,
    });
    const created = reducer(submitting, {
      type: actions.CREATE_COMMENT_SUCCESS,
      payload: { topicId: 1 },
    });

    expect(typed.topics[1]).toBe('hello');
    expect(submitting.isSubmittingDelayedComment).toBe(true);
    expect(submitting.isSubmittingNormalComment).toBe(false);
    expect(created.topics[1]).toBe('');
    expect(created.isSubmittingDelayedComment).toBe(false);
  });

  it('opens an annotation box on a file that has none yet', () => {
    const state = reducer(loaded(), {
      type: actions.CREATE_ANNOTATION_CHANGE,
      payload: { fileId: 8, line: 3, text: 'look here' },
    });

    expect(state.annotations[8]).toEqual({ 3: 'look here' });
  });

  it('tracks an edit through to the saved text, then forgets it on delete', () => {
    const updating = reducer(loaded(), {
      type: actions.UPDATE_COMMENT_REQUEST,
    });
    const updated = reducer(updating, {
      type: actions.UPDATE_COMMENT_SUCCESS,
      payload: { id: 10, text: 'saved' },
    });
    const deleted = reducer(updated, {
      type: actions.DELETE_COMMENT_SUCCESS,
      payload: { postId: 10 },
    });

    expect(updating.isUpdatingComment).toBe(true);
    expect(updated.isUpdatingComment).toBe(false);
    expect(updated.posts[10]).toBe('saved');
    expect(deleted.posts).toEqual({});
  });

  it("empties the annotation boxes of a graded answer's files", () => {
    const typed = reducer(loaded(), {
      type: actions.CREATE_ANNOTATION_CHANGE,
      payload: { fileId: 7, line: 1, text: 'unsent' },
    });
    const graded = reducer(typed, {
      type: actions.AUTOGRADE_SUCCESS,
      payload: { latestAnswer: { annotations: [{ fileId: 7 }] } },
    });

    expect(graded.annotations[7]).toEqual({});
  });
});
