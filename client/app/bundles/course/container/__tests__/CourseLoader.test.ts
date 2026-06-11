import { store } from 'store';

import CourseAPI from 'api/course';

import { loader } from '../CourseLoader';

jest.mock('api/course', () => ({
  __esModule: true,
  default: { courses: { fetchLayout: jest.fn() } },
}));

const mockFetchLayout = CourseAPI.courses.fetchLayout as jest.Mock;

const runLoader = (courseId: string): Promise<unknown> =>
  // The router passes { request, params }; only params.courseId is read here, so
  // we route through `unknown` to call it with just the params it reads.
  (
    loader as unknown as (args: {
      params: { courseId: string };
    }) => Promise<unknown>
  )({
    params: { courseId },
  });

describe('CourseLoader loader', () => {
  it('hydrates the authenticated user id into the global store', async () => {
    mockFetchLayout.mockResolvedValueOnce({
      data: { courseTitle: 'C', userName: 'Alice', userId: 77 },
    });

    await runLoader('1');

    expect(store.getState().global.user.user.id).toBe(77);
  });

  it('leaves the global user id untouched when the payload has no user id', async () => {
    store.dispatch({ type: 'system/SET_CURRENT_USER_ID', userId: 5 });
    mockFetchLayout.mockResolvedValueOnce({
      data: { courseTitle: 'C', userName: null, userId: null },
    });

    await runLoader('1');

    expect(store.getState().global.user.user.id).toBe(5);
  });
});
