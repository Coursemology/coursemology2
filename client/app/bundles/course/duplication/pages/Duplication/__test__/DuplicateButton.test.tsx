import { store } from 'store';
import { fireEvent, render } from 'test-utils';

import CourseAPI from 'api/course';
import { duplicableItemTypes } from 'course/duplication/constants';
import { loadObjectsList } from 'course/duplication/store';

import DuplicateButton from '../DuplicateButton';

const data = {
  sourceCourse: { id: 37 },
  metadata: { canDuplicateToAnotherInstance: false, currentInstanceId: 0 },
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
    [duplicableItemTypes.TAB]: { 3: true, 4: true, 5: false },
    [duplicableItemTypes.CATEGORY]: { 6: false },
    [duplicableItemTypes.ASSESSMENT]: { 7: true },
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
  videosComponent: [],
};

const expectedPayload = {
  object_duplication: {
    items: {
      ASSESSMENT: ['7'],
      TAB: ['3', '4'],
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
});
