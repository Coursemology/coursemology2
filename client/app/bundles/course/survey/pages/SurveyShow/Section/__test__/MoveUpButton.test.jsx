import { mount } from 'enzyme';
import CourseAPI from 'api/course';
import storeCreator from 'course/survey/store';
import MoveUpButton from '../MoveUpButton';

const surveys = [
  {
    id: 3,
    sections: [{ id: 3 }, { id: 1 }, { id: 4 }, { id: 5 }, { id: 9 }],
  },
];

describe('<MoveUpButton />', () => {
  it('injects handlers that allow survey section to be moved before the previous section', () => {
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
      <MoveUpButton sectionIndex={sectionIndex} />,
      buildContextOptions(store),
    );
    moveSectionButton.find('button').simulate('click');

    expect(spyMove).toHaveBeenCalledWith({ ordering: [3, 1, 5, 4, 9] });
  });
});
