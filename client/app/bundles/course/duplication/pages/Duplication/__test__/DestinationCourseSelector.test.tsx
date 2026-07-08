import { createMockAdapter } from 'mocks/axiosMock';
import { store } from 'store';
import { fireEvent, render, screen, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import { loadObjectsList } from 'course/duplication/store';

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
  metadata: { currentInstanceId: 1, currentInstanceHost: 'coursemology.org' },
  destinationInstances: [defaultInstance],
  destinationCourses: [],
  materialsComponent: [],
  assessmentsComponent: [],
  surveyComponent: [],
  achievementsComponent: [],
  videosComponent: [],
};

const waitForCombobox = (): Promise<HTMLElement> =>
  screen.findByRole('combobox', { name: /destination instance/i });

beforeEach(() => {
  mock.reset();
  store.dispatch(loadObjectsList(baseData));
});

describe('<DestinationCourseSelector /> instance dropdown', () => {
  it('pre-fills instance dropdown with current instance when it is a valid destination', async () => {
    const testData = {
      ...baseData,
      metadata: {
        currentInstanceId: 1,
        currentInstanceHost: 'coursemology.org',
      },
      destinationInstances: [defaultInstance],
    };
    store.dispatch(loadObjectsList(testData));
    mock.onGet(url).reply(200, testData);

    render(<ObjectDuplication />);
    const combobox = await waitForCombobox();

    expect(combobox).toHaveValue('Default');
  });

  it('does not pre-fill instance dropdown when current instance is not a valid destination', async () => {
    const testData = {
      ...baseData,
      metadata: {
        currentInstanceId: 99,
        currentInstanceHost: 'other.coursemology.org',
      },
      destinationInstances: [defaultInstance],
    };
    store.dispatch(loadObjectsList(testData));
    mock.onGet(url).reply(200, testData);

    render(<ObjectDuplication />);
    const combobox = await waitForCombobox();

    expect(combobox).toHaveValue('');
  });

  it('MyLocation button sets the Autocomplete to the current instance', async () => {
    const testData = {
      ...baseData,
      metadata: {
        currentInstanceId: 1,
        currentInstanceHost: 'coursemology.org',
      },
      destinationInstances: [
        defaultInstance,
        { id: 2, name: 'Other', host: 'other.org' },
      ],
    };
    store.dispatch(loadObjectsList(testData));
    mock.onGet(url).reply(200, testData);

    render(<ObjectDuplication />);
    const combobox = await waitForCombobox();
    await waitFor(() => expect(combobox).toHaveValue('Default'));

    // Click MyLocation to confirm it sets the current instance
    fireEvent.click(
      screen.getByRole('button', { name: /select current instance/i }),
    );

    // Combobox should show the current instance name
    await waitFor(() => expect(combobox).toHaveValue('Default'));
  });

  /**
   * The MyLocation IconButton is currently only disabled when `isDuplicating` is true,
   * but it should also be disabled when the current instance is not a valid destination.
   */
  it('disables MyLocation button when current instance is not a valid destination', async () => {
    const testData = {
      ...baseData,
      metadata: {
        currentInstanceId: 99,
        currentInstanceHost: 'other.coursemology.org',
      },
      destinationInstances: [defaultInstance],
    };
    store.dispatch(loadObjectsList(testData));
    mock.onGet(url).reply(200, testData);

    render(<ObjectDuplication />);
    await waitForCombobox();

    const locationButton = screen.getByRole('button', {
      name: /select current instance/i,
    });
    expect(locationButton).toBeDisabled();
  });
});
