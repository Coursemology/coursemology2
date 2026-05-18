import { createMockAdapter } from 'mocks/axiosMock';
import { store } from 'store';
import { render, screen, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import { loadObjectsList } from 'course/duplication/store';
import { DuplicationData } from 'course/duplication/types';

import ObjectDuplication from '../index';

const client = CourseAPI.duplication.client;
const mock = createMockAdapter(client);
const url = `/courses/${global.courseId}/object_duplication/new`;

const defaultInstance = {
  id: 1,
  name: 'Default',
  host: 'example.org',
};

const baseData = {
  sourceCourse: {
    id: 5,
    title: 'Source Course',
    start_at: '2024-01-01',
    duplicationModesAllowed: ['COURSE', 'OBJECT'],
    enabledComponents: ['ASSESSMENTS'],
    unduplicableObjectTypes: [],
  },
  metadata: { currentInstanceId: 2, currentInstanceHost: 'coursemology.org' },
  destinationInstances: [defaultInstance],
  destinationCourses: [],
  materialsComponent: [],
  assessmentsComponent: [],
  surveyComponent: [],
  achievementsComponent: [],
  videosComponent: [],
};

beforeEach(() => {
  mock.reset();
  store.dispatch(loadObjectsList(baseData));
});

describe('<ObjectDuplication />', () => {
  it('fetches and receives sorted data', async () => {
    const spy = jest.spyOn(CourseAPI.duplication, 'fetch');
    mock.onGet(url).reply(200, {
      sourceCourse: { id: 5 },
      metadata: { currentInstanceId: 0 },
      destinationInstances: [defaultInstance],
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
    });

    render(<ObjectDuplication />);

    await waitFor(() => expect(spy).toHaveBeenCalled());

    const data = store.getState().duplication as DuplicationData;
    const courseTitles = data.destinationCourses.map((course) => course.title);
    const rootFolder = data.materialsComponent[0];

    expect(courseTitles).toEqual(['Course A', 'Course B', 'Course C']);
    expect(data.materialsComponent).toHaveLength(1);
    expect(rootFolder.name).toBe('Root');
    expect(rootFolder.subfolders[0].name).toBe('L1');
    expect(rootFolder.subfolders[0].subfolders[0].name).toBe('L2');
  });

  it('hides alert when current instance is a valid destination', async () => {
    mock.onGet(url).reply(200, {
      ...baseData,
      metadata: {
        currentInstanceId: 1,
        currentInstanceHost: 'coursemology.org',
      },
      destinationInstances: [defaultInstance],
    });

    render(<ObjectDuplication />);
    await screen.findByRole('radio', { name: /new course/i });

    expect(
      screen.queryByText(/cannot duplicate to a new course/i),
    ).not.toBeInTheDocument();
  });

  it('shows alert when current instance is not a valid destination', async () => {
    mock.onGet(url).reply(200, {
      ...baseData,
      metadata: {
        currentInstanceId: 99,
        currentInstanceHost: 'other.coursemology.org',
      },
      destinationInstances: [defaultInstance],
    });

    render(<ObjectDuplication />);

    await screen.findByText(/cannot duplicate to a new course/i);
  });

  it('disables New Course radio when there are no destination instances', async () => {
    mock.onGet(url).reply(200, {
      ...baseData,
      destinationInstances: [],
    });

    render(<ObjectDuplication />);
    await screen.findByRole('radio', { name: /new course/i });

    expect(screen.getByRole('radio', { name: /new course/i })).toBeDisabled();
    expect(
      screen.getByRole('radio', { name: /existing course/i }),
    ).not.toBeDisabled();
  });

  it('enables both mode radios when destination instances exist', async () => {
    mock.onGet(url).reply(200, {
      ...baseData,
      destinationInstances: [defaultInstance],
    });

    render(<ObjectDuplication />);
    await screen.findByRole('radio', { name: /new course/i });

    expect(
      screen.getByRole('radio', { name: /new course/i }),
    ).not.toBeDisabled();
    expect(
      screen.getByRole('radio', { name: /existing course/i }),
    ).not.toBeDisabled();
  });

  it('shows loading indicator while data is being fetched', async () => {
    mock.onGet(url).reply(() => new Promise(() => {}));

    render(<ObjectDuplication />);
    await screen.findByTestId('CircularProgress');

    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('shows duplication disabled message when no modes are allowed', async () => {
    mock.onGet(url).reply(200, {
      ...baseData,
      sourceCourse: { ...baseData.sourceCourse, duplicationModesAllowed: [] },
    });

    render(<ObjectDuplication />);

    await screen.findByText(/duplication is disabled for this course/i);
  });

  it('shows no components message when all components are disabled', async () => {
    mock.onGet(url).reply(200, {
      ...baseData,
      sourceCourse: { ...baseData.sourceCourse, enabledComponents: [] },
    });

    render(<ObjectDuplication />);

    await screen.findByText(
      /all components with duplicable items are disabled/i,
    );
  });
});
