import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';
import CourseAPI from 'api/course';
import storeCreator from 'course/lesson-plan/store';
import MilestoneFormDialog from 'course/lesson-plan/containers/MilestoneFormDialog';
import NewMilestoneButton from '../NewMilestoneButton';

describe('<NewMilestoneButton />', () => {
  it('allows milestone to be created via MilestoneFormDialog', () => {
    const spyCreate = jest.spyOn(CourseAPI.lessonPlan, 'createMilestone');
    const store = storeCreator({ flags: { canManageLessonPlan: true } });
    const contextOptions = buildContextOptions(store);

    const milestoneFormDialog = mount(<MilestoneFormDialog />, contextOptions);
    const newMilestoneButton = mount(<NewMilestoneButton />, contextOptions);

    // Click 'new milestone' button
    newMilestoneButton.find('button').simulate('click');
    milestoneFormDialog.update();
    expect(
      milestoneFormDialog
        .find('MilestoneFormDialog')
        .first()
        .props().visible,
    ).toBe(true);

    // Fill milestone form
    const milestoneData = {
      title: 'Ambitious milestone title',
      start_at: new Date('2016-12-31T16:00:00.000Z'),
    };
    const startAt = '01-01-2017';
    const dialogInline = milestoneFormDialog
      .find('RenderToLayer')
      .first()
      .instance();
    const milestoneForm = mount(
      dialogInline.props.render(),
      contextOptions,
    ).find('form');
    const titleInput = milestoneForm.find('input[name="title"]');
    titleInput.simulate('change', { target: { value: milestoneData.title } });
    const startAtDateInput = milestoneForm
      .find('input[name="start_at"]')
      .first();
    startAtDateInput.simulate('change', { target: { value: startAt } });
    startAtDateInput.simulate('blur');

    // Submit milestone form
    const submitButton = milestoneFormDialog
      .find('FormDialogue')
      .first()
      .instance().submitButton;
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(submitButton));
    expect(spyCreate).toHaveBeenCalledWith({
      lesson_plan_milestone: milestoneData,
    });
  });

  it('is hidden when canManageLessonPlan is false', () => {
    const store = storeCreator({ flags: { canManageLessonPlan: false } });
    const contextOptions = buildContextOptions(store);
    const newMilestoneButton = mount(<NewMilestoneButton />, contextOptions);
    expect(newMilestoneButton).toMatchSnapshot();
  });
});
