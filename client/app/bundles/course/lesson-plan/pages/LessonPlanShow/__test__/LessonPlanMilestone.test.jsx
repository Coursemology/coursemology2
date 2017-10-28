import React from 'react';
import ReactDOM from 'react-dom';
import { mount, ReactWrapper } from 'enzyme';
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
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(iconButton.node));

    const menuCardNode = lessonPlanMilestone.find('RenderToLayer').first().node.layerElement;
    const deleteButton = new ReactWrapper(menuCardNode, true).find('EnhancedButton').at(1);
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(deleteButton.node));

    const confirmDeleteButton =
      deleteConfirmation.find('ConfirmationDialog').first().node.confirmButton;
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
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(iconButton.node));

    const menuCardNode = lessonPlanMilestone.find('RenderToLayer').first().node.layerElement;
    const updateButton = new ReactWrapper(menuCardNode, true).find('EnhancedButton').first();
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(updateButton.node));

    const dialogInline = milestoneFormDialog.find('RenderToLayer').first().node.layerElement;
    const milestoneForm = new ReactWrapper(dialogInline, true).find('form');
    const description = 'Add nice description';
    const descriptionInput = milestoneForm.find('textarea[name="description"]');
    descriptionInput.simulate('change', { target: { value: description } });

    const submitButton = milestoneFormDialog.find('FormDialogue').first().node.submitButton;
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
