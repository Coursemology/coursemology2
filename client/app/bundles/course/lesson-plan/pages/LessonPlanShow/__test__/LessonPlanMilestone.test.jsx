import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';
import CourseAPI from 'api/course';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';
import storeCreator from 'course/lesson-plan/store';
import MilestoneFormDialog from 'course/lesson-plan/containers/MilestoneFormDialog';
import LessonPlanMilestone from '../LessonPlanMilestone';

describe('<LessonPlanMilestone />', () => {
  it('hides admin menu for dummy milestone', () => {
    const store = storeCreator({ flags: { canManageLessonPlan: true } });
    const lessonPlanMilestone = mount(
      <LessonPlanMilestone
        id={undefined}
        title="Ungrouped Items"
        startAt="2017-01-04T02:03:00.000+08:00"
      />,
      buildContextOptions(store)
    );
    expect(lessonPlanMilestone.find('IconMenu').length).toBe(0);
  });

  it('hides admin menu when user does not have permissions', () => {
    const store = storeCreator({ flags: { canManageLessonPlan: false } });
    const lessonPlanMilestone = mount(
      <LessonPlanMilestone
        id={4}
        title="Ungrouped Items"
        startAt="2017-01-04T02:03:00.000+08:00"
      />,
      buildContextOptions(store)
    );
    expect(lessonPlanMilestone.find('IconMenu').length).toBe(0);
  });

  it('allows milestone to be deleted', () => {
    const spyDelete = jest.spyOn(CourseAPI.lessonPlan, 'deleteMilestone');
    const store = storeCreator({ flags: { canManageLessonPlan: true } });
    const contextOptions = buildContextOptions(store);
    const deleteConfirmation = mount(<DeleteConfirmation />, contextOptions);
    const milestoneId = 55;
    const lessonPlanMilestone = mount(
      <LessonPlanMilestone
        id={milestoneId}
        title="Original title"
        startAt="2017-01-04T02:03:00.000+08:00"
      />,
      contextOptions
    );

    const iconButton = lessonPlanMilestone.find('button').first();
    iconButton.simulate('click');

    const menuCardNode = lessonPlanMilestone.find('RenderToLayer').first().instance();
    const deleteButton = mount(menuCardNode.props.render(), contextOptions).find('EnhancedButton').at(1);
    deleteButton.simulate('click');

    const confirmDeleteButton =
      deleteConfirmation.find('ConfirmationDialog').first().instance().confirmButton;
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(confirmDeleteButton));

    expect(spyDelete).toHaveBeenCalledWith(milestoneId);
  });

  it('allows milestone to be edited', () => {
    const spyUpdate = jest.spyOn(CourseAPI.lessonPlan, 'updateMilestone');
    const store = storeCreator({ flags: { canManageLessonPlan: true } });
    const contextOptions = buildContextOptions(store);
    const milestoneId = 55;
    const milestoneTitle = 'Original title';
    const milestoneStart = '2017-01-04T02:03:00.000+08:00';
    const milestoneFormDialog = mount(<MilestoneFormDialog />, contextOptions);
    const lessonPlanMilestone = mount(
      <LessonPlanMilestone
        id={milestoneId}
        title={milestoneTitle}
        startAt={milestoneStart}
      />,
      contextOptions
    );

    const iconButton = lessonPlanMilestone.find('button').first();
    iconButton.simulate('click');

    const menuCardNode = lessonPlanMilestone.find('RenderToLayer').first().instance();
    const updateButton = mount(menuCardNode.props.render(), contextOptions).find('EnhancedButton').first();
    updateButton.simulate('click');

    const dialogInline = milestoneFormDialog.find('RenderToLayer').first().instance();
    const milestoneForm = mount(dialogInline.props.render(), contextOptions).find('form');
    const description = 'Add nice description';
    const descriptionInput = milestoneForm.find('textarea[name="description"]');
    descriptionInput.simulate('change', { target: { value: description } });

    const submitButton = milestoneFormDialog.find('FormDialogue').first().instance().submitButton;
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(submitButton));

    const expectedPayload = {
      lesson_plan_milestone: {
        title: milestoneTitle,
        description,
        start_at: milestoneStart,
      },
    };
    expect(spyUpdate).toHaveBeenCalledWith(milestoneId, expectedPayload);
  });
});
