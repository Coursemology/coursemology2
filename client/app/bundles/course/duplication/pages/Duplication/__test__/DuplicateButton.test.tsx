import { store } from 'store';
import { fireEvent, render, screen, within } from 'test-utils';

import CourseAPI from 'api/course';
import { loadObjectsList } from 'course/duplication/store';

import DuplicateButton from '../DuplicateButton';

const data = {
  sourceCourse: { id: 37 },
  metadata: { currentInstanceId: 0 },
  destinationCourseId: 9,
  destinationCourses: [
    {
      id: 9,
      title: 'destination',
      host: 'example.org',
      path: '/courses/9',
    },
  ],
  destinationInstances: [{ id: 0, name: 'default', host: 'example.org' }],
  selectedItems: {
    ASSESSMENT: { 7: true },
    TAB: { 3: true, 4: true, 5: false },
    CATEGORY: { 6: false },
    SURVEY: { 10: true },
    ACHIEVEMENT: { 11: true, 12: false },
    FOLDER: { 13: true },
    MATERIAL: { 14: true },
    VIDEO: { 15: true },
    VIDEO_TAB: { 16: true },
  },
  materialsComponent: [],
  assessmentsComponent: [
    {
      id: 6,
      title: 'Category 6',
      tabs: [
        {
          id: 3,
          title: 'Tab 3',
          assessments: [
            {
              title: 'Assessment 7',
              id: 7,
            },
          ],
        },
        {
          id: 4,
          title: 'Tab 4',
          assessments: [],
        },
        {
          id: 5,
          title: 'Tab 5',
          assessments: [],
        },
      ],
    },
  ],
  surveyComponent: [{ id: 10, title: 'Survey 10', published: true }],
  achievementsComponent: [
    { id: 11, title: 'Achievement 11', published: true, url: '/badges/11' },
    { id: 12, title: 'Achievement 12', published: true, url: '/badges/12' },
  ],
  videosComponent: [
    {
      id: 16,
      title: 'Video Tab 16',
      parent_id: null,
      videos: [{ id: 15, title: 'Video 15', published: true }],
    },
  ],
};

const expectedPayload = {
  object_duplication: {
    items: {
      ASSESSMENT: ['7'],
      TAB: ['3', '4'],
      SURVEY: ['10'],
      ACHIEVEMENT: ['11'],
      FOLDER: ['13'],
      MATERIAL: ['14'],
      VIDEO: ['15'],
      VIDEO_TAB: ['16'],
    },
    destination_course_id: 9,
  },
};

describe('<DuplicateButton />', () => {
  it('allows duplication to be triggered with the correct parameters', async () => {
    const spy = jest.spyOn(CourseAPI.duplication, 'duplicateItems');

    store.dispatch(loadObjectsList(data));
    const page = render(<DuplicateButton />);

    fireEvent.click(await page.findByRole('button'));
    fireEvent.click(page.getByRole('button', { name: 'Duplicate' }));

    expect(spy).toHaveBeenCalledWith(data.sourceCourse.id, expectedPayload);
  });

  it('shows only selected items in the confirmation dialog and sends the correct request', async () => {
    const spy = jest.spyOn(CourseAPI.duplication, 'duplicateItems');

    store.dispatch(loadObjectsList(data));
    const page = render(<DuplicateButton />);

    fireEvent.click(
      await page.findByRole('button', { name: /duplicate items/i }),
    );

    const dialog = await screen.findByRole('dialog');
    const d = within(dialog);

    // Destination course card
    expect(d.getByText('destination')).toBeInTheDocument();

    // Selected assessments and tabs appear; unselected ones do not
    expect(d.getByText('Assessment 7')).toBeInTheDocument();
    expect(d.getByText('Tab 3')).toBeInTheDocument();
    expect(d.getByText('Tab 4')).toBeInTheDocument();
    expect(d.queryByText('Tab 5')).not.toBeInTheDocument();
    expect(d.queryByText('Category 6')).not.toBeInTheDocument();

    // Selected survey appears
    expect(d.getByText('Survey 10')).toBeInTheDocument();

    // Selected achievement appears; unselected one does not
    expect(d.getByText('Achievement 11')).toBeInTheDocument();
    expect(d.queryByText('Achievement 12')).not.toBeInTheDocument();

    // Selected video and video tab appear
    expect(d.getByText('Video Tab 16')).toBeInTheDocument();
    expect(d.getByText('Video 15')).toBeInTheDocument();

    // Clicking Duplicate sends the correct API request
    fireEvent.click(d.getByRole('button', { name: 'Duplicate' }));
    expect(spy).toHaveBeenCalledWith(data.sourceCourse.id, expectedPayload);
  });
});
