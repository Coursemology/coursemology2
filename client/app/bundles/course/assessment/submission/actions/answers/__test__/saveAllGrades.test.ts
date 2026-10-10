import { createMockAdapter } from 'mocks/axiosMock';

import CourseAPI from 'api/course';

import { saveAllGrades } from '..';

const mock = createMockAdapter(CourseAPI.assessment.submissions.client);

// Runs thunks inline, so the notification thunk's action is recorded too.
const dispatch = jest.fn((action) =>
  typeof action === 'function' ? action(dispatch) : action,
);

beforeEach(() => {
  mock.reset();
  dispatch.mockClear();
});

describe('saveAllGrades', () => {
  // A rubric answer's grade is breakdown (1 + 2) + moderation (4); the save must not drop the moderation
  // by recomputing the grade from the breakdown alone.
  it('sends the moderation-inclusive grade for rubric-graded answers', async () => {
    mock.onPatch(/\/submissions\/1$/).reply(200, {});

    await saveAllGrades(
      1,
      [
        { id: 10, grade: 7 },
        { id: 11, grade: 5 },
      ],
      100,
      false,
      {
        10: {
          100: { id: 1, gradeId: 1000, grade: 1, explanation: null },
          101: { id: 2, gradeId: 1001, grade: 2, explanation: null },
        },
      },
    )(dispatch);

    const { answers } = JSON.parse(mock.history.patch[0].data).submission;
    expect(answers).toEqual([
      expect.objectContaining({ id: 10, grade: 7 }),
      { id: 11, grade: 5 },
    ]);
    expect(answers[0].selections_attributes).toHaveLength(2);
  });
});
