import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';
import CourseAPI from 'api/course';
import storeCreator from 'course/survey/store';
import MoveDownButton from '../MoveDownButton';

const surveys = [{
  id: 3,
  sections: [
    { id: 3 },
    { id: 1 },
    { id: 4 },
    { id: 5 },
    { id: 9 },
  ],
}];

describe('<MoveDownButton />', () => {
  it('injects handlers that allow survey section to be moved after the following section', () => {
    const surveyId = surveys[0].id;
    const sectionIndex = 3;
    const spyMove = jest.spyOn(CourseAPI.survey.surveys, 'reorderSections');
    const store = storeCreator({ surveys: { surveys } });

    Object.defineProperty(window.location, 'pathname', {
      value: `/courses/${courseId}/surveys/${surveyId}`,
    });
    const moveSectionButton =
      mount(<MoveDownButton sectionIndex={sectionIndex} />, buildContextOptions(store));
    const moveSectionButtonNode = ReactDOM.findDOMNode(moveSectionButton.find('button').node);
    ReactTestUtils.Simulate.touchTap(moveSectionButtonNode);

    expect(spyMove).toHaveBeenCalledWith({ ordering: [3, 1, 4, 9, 5] });
  });
});
