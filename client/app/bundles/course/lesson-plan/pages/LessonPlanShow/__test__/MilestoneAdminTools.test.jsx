import React from 'react';
import ReactDOM from 'react-dom';
import { mount, shallow } from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';
import CourseAPI from 'api/course';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';
import storeCreator from 'course/lesson-plan/store';
import MilestoneFormDialog from 'course/lesson-plan/containers/MilestoneFormDialog';
import MilestoneAdminTools from '../MilestoneAdminTools';

const buildShallowWrapper = (canManageLessonPlan, milestone) => {
  const store = storeCreator({ flags: { canManageLessonPlan } });
  return shallow(
    <MilestoneAdminTools milestone={milestone} />,
    buildContextOptions(store),
  )
    .dive()
    .dive();
};

describe('<MilestoneAdminTools />', () => {
  it('hides admin tools for dummy milestone', () => {
    const milestone = { id: undefined, title: 'Ungrouped Items' };
    expect(
      buildShallowWrapper(true, milestone).find('RaisedButton').length,
    ).toBe(0);
  });

  it('hides admin tools when user does not have permissions', () => {
    const milestone = { id: 4, title: 'User-defined Milestone' };
    expect(
      buildShallowWrapper(false, milestone).find('RaisedButton').length,
    ).toBe(0);
  });

  it('shows admin tools when user has permissions', () => {
    const milestone = { id: 4, title: 'User-defined Milestone' };
    expect(
      buildShallowWrapper(true, milestone).find('RaisedButton').length,
    ).toBe(2);
  });

  it('allows milestone to be deleted', () => {
    const spyDelete = jest.spyOn(CourseAPI.lessonPlan, 'deleteMilestone');
    const store = storeCreator({ flags: { canManageLessonPlan: true } });
    const contextOptions = buildContextOptions(store);
    const deleteConfirmation = mount(<DeleteConfirmation />, contextOptions);
    const milestoneId = 55;
    const wrapper = mount(
      <MilestoneAdminTools
        milestone={{
          id: milestoneId,
          title: 'Original title',
          start_at: '2017-01-04T02:03:00.000+08:00',
        }}
      />,
      contextOptions,
    );

    const deleteButton = wrapper
      .find('RaisedButton')
      .last()
      .find('button');
    deleteButton.simulate('click');
    const confirmButton = deleteConfirmation
      .find('ConfirmationDialog')
      .first()
      .instance().confirmButton;
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(confirmButton));

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

    const wrapper = mount(
      <MilestoneAdminTools
        milestone={{
          id: milestoneId,
          title: milestoneTitle,
          start_at: milestoneStart,
        }}
      />,
      contextOptions,
    );

    const editButton = wrapper
      .find('RaisedButton')
      .first()
      .find('button');
    editButton.simulate('click');

    const dialogInline = milestoneFormDialog
      .find('RenderToLayer')
      .first()
      .instance();
    const milestoneForm = mount(
      dialogInline.props.render(),
      contextOptions,
    ).find('form');
    const description = 'Add nice description';
    const descriptionInput = milestoneForm.find('textarea[name="description"]');
    descriptionInput.simulate('change', { target: { value: description } });

    const submitButton = milestoneFormDialog
      .find('FormDialogue')
      .first()
      .instance().submitButton;
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
