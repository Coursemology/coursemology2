import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import CourseAPI from 'api/course';
import MockAdapter from 'axios-mock-adapter';
import storeCreator from 'course/duplication/store';
import ObjectDuplication from '../index';

const client = CourseAPI.duplication.getClient();
const mock = new MockAdapter(client);

const responseData = {
  sourceCourse: { id: 5 },
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
    const store = storeCreator({});
    const spy = jest.spyOn(CourseAPI.duplication, 'fetch');
    const url = `/courses/${courseId}/object_duplication/new`;
    mock.onGet(url).reply(200, responseData);

    mount(
      <MemoryRouter>
        <ObjectDuplication />
      </MemoryRouter>,
      buildContextOptions(store),
    );
    await sleep(1);
    expect(spy).toHaveBeenCalled();

    const sortedData = store.getState().duplication;
    const courseTitles = sortedData.destinationCourses.map(
      (course) => course.title,
    );
    const rootFolder = sortedData.materialsComponent[0];
    expect(courseTitles).toEqual(['Course A', 'Course B', 'Course C']);
    expect(sortedData.materialsComponent.length).toBe(1);
    expect(rootFolder.name).toBe('Root');
    expect(rootFolder.subfolders[0].name).toBe('L1');
    expect(rootFolder.subfolders[0].subfolders[0].name).toBe('L2');
  });
});
