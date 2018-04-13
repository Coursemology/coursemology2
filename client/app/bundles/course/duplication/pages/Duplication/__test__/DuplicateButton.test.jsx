import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';
import CourseAPI from 'api/course';
import storeCreator from 'course/duplication/store';
import { duplicableItemTypes } from 'course/duplication/constants';
import DuplicateButton from '../DuplicateButton';

const data = {
  duplication: {
    duplication: {
      destinationCourseId: 9,
      destinationCourses: [{
        id: 9,
        title: 'destination',
        host: 'example.org',
        path: '/courses/9',
      }],
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
              assessments: [{
                title: 'Assessment 7',
                id: 7,
              }],
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
    },
  },
};

describe('<DuplicateButton />', () => {
  it('allows duplication to be triggered with the correct parameters', () => {
    const spy = jest.spyOn(CourseAPI.duplication, 'duplicateItems');
    const duplicateButton = mount(<DuplicateButton />, buildContextOptions(storeCreator(data)));
    duplicateButton.find('button').first().simulate('click');

    const confirmButton = duplicateButton.find('ConfirmationDialog').first().instance().confirmButton;
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(confirmButton));

    const expectedPayload = {
      object_duplication: {
        items: {
          ASSESSMENT: ['7'],
          TAB: ['3', '4'],
        },
        destination_course_id: 9,
      },
    };
    expect(spy).toHaveBeenCalledWith(expectedPayload);
  });
});
