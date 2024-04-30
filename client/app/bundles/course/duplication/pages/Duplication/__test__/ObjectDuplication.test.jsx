import { createMockAdapter } from 'mocks/axiosMock';
import { store } from 'store';
import { render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import ObjectDuplication from '../index';

const client = CourseAPI.duplication.client;
const mock = createMockAdapter(client);

const responseData = {
  sourceCourse: { id: 5 },
  metadata: { canDuplicateToAnotherInstance: false, currentInstanceId: 0 },
  destinationInstances: [{ id: 0, name: 'default', host: 'example.org' }],
  destinationCourses: [
    { id: 54, title: 'Course B', path: '/courses/54' },
    { id: 55, title: 'Course A', path: '/courses/55' },
    { id: 56, title: 'Course C', path: '/courses/56' },
  ],
  materialsComponent: [
    { id: 91, parent_id: 93, name: 'L2' },
    { id: 92, parent_id: null, name: 'Root' },
    { id: 93, parent_id: 92, name: 'L1' },
  ],
};

beforeEach(() => {
  mock.reset();
});

describe('<ObjectDuplication />', () => {
  it('fetches and receives sorted data', async () => {
    const spy = jest.spyOn(CourseAPI.duplication, 'fetch');
    const url = `/courses/${global.courseId}/object_duplication/new`;
    mock.onGet(url).reply(200, responseData);

    render(<ObjectDuplication />);

    await waitFor(() => expect(spy).toHaveBeenCalled());

    const data = store.getState().duplication;
    const courseTitles = data.destinationCourses.map((course) => course.title);
    const rootFolder = data.materialsComponent[0];

    expect(courseTitles).toEqual(['Course A', 'Course B', 'Course C']);
    expect(data.materialsComponent).toHaveLength(1);
    expect(rootFolder.name).toBe('Root');
    expect(rootFolder.subfolders[0].name).toBe('L1');
    expect(rootFolder.subfolders[0].subfolders[0].name).toBe('L2');
  });
});
