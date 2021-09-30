import React from 'react';
import { mount } from 'enzyme';
import CourseAPI from 'api/course';
import storeCreator from 'course/survey/store';
import MoveDownButton from '../MoveDownButton';

const surveys = [
  {
    id: 3,
    sections: [{ id: 3 }, { id: 1 }, { id: 4 }, { id: 5 }, { id: 9 }],
  },
];

describe('<MoveDownButton />', () => {
  it('injects handlers that allow survey section to be moved after the following section', () => {
    const surveyId = surveys[0].id;
    const sectionIndex = 3;
    const spyMove = jest.spyOn(CourseAPI.survey.surveys, 'reorderSections');
    const store = storeCreator({ surveys: { surveys } });

    window.history.pushState(
      {},
      '',
      `/courses/${courseId}/surveys/${surveyId}`,
    );
    const moveSectionButton = mount(
      <MoveDownButton sectionIndex={sectionIndex} />,
      buildContextOptions(store),
    );
    moveSectionButton.find('button').simulate('click');

    expect(spyMove).toHaveBeenCalledWith({ ordering: [3, 1, 4, 9, 5] });
  });
});
