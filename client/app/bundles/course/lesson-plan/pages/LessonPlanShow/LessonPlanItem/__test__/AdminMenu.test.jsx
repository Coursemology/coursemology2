import React from 'react';
import ReactDOM from 'react-dom';
import { mount, ReactWrapper } from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';
import CourseAPI from 'api/course';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';
import storeCreator from 'course/lesson-plan/store';
import EventFormDialog from 'course/lesson-plan/containers/EventFormDialog';
import AdminMenu from '../AdminMenu';

describe('<AdminMenu />', () => {
  it('does not show admin menu for non-event lesson plan items', () => {
    const store = storeCreator({ flags: { canManageLessonPlan: true } });
    const adminMenu = mount(
      <AdminMenu
        item={{ title: 'This item does not have and eventId' }}
      />,
      buildContextOptions(store)
    );
    expect(adminMenu.find('IconMenu').length).toBe(0);
  });

  it('allows event to be deleted', () => {
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'deleteEvent');
    const store = storeCreator({ flags: { canManageLessonPlan: true } });
    const contextOptions = buildContextOptions(store);
    const deleteConfirmation = mount(<DeleteConfirmation />, contextOptions);
    const eventId = 55;
    const adminMenu = mount(
      <AdminMenu
        item={{ eventId }}
      />,
      contextOptions
    );

    const iconButton = adminMenu.find('button').first();
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(iconButton.node));

    const menuCardNode = adminMenu.find('RenderToLayer').first().node.layerElement;
    const deleteButton = new ReactWrapper(menuCardNode, true).find('EnhancedButton').at(1);
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(deleteButton.node));

    const confirmDeleteButton =
      deleteConfirmation.find('ConfirmationDialog').first().node.confirmButton;
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(confirmDeleteButton));

    expect(spy).toHaveBeenCalledWith(eventId);
  });

  it('allows event to be edited', () => {
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateEvent');
    const store = storeCreator({ flags: { canManageLessonPlan: true } });
    const contextOptions = buildContextOptions(store);
    const eventId = 55;
    const eventData = {
      title: 'Original title',
      start_at: '2017-01-04T02:03:00.000+08:00',
      end_at: '2017-01-05T02:03:00.000+08:00',
      published: false,
      event_type: 'Recitation',
    };
    const eventFormDialog = mount(<EventFormDialog />, contextOptions);
    const adminMenu = mount(
      <AdminMenu
        item={{
          eventId,
          title: eventData.title,
          start_at: eventData.start_at,
          end_at: eventData.end_at,
          published: eventData.published,
          lesson_plan_item_type: [eventData.event_type],
        }}
      />,
      contextOptions
    );

    const iconButton = adminMenu.find('button').first();
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(iconButton.node));

    const menuCardNode = adminMenu.find('RenderToLayer').first().node.layerElement;
    const updateButton = new ReactWrapper(menuCardNode, true).find('EnhancedButton').first();
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(updateButton.node));

    const dialogInline = eventFormDialog.find('RenderToLayer').first().node.layerElement;
    const eventForm = new ReactWrapper(dialogInline, true).find('form');
    const description = 'Add nice description';
    const descriptionInput = eventForm.find('textarea[name="description"]');
    descriptionInput.simulate('change', { target: { value: description } });

    const submitButton = eventFormDialog.find('FormDialogue').first().node.submitButton;
    ReactTestUtils.Simulate.touchTap(ReactDOM.findDOMNode(submitButton));

    const expectedPayload = {
      lesson_plan_event: {
        ...eventData,
        description,
      },
    };
    expect(spy).toHaveBeenCalledWith(eventId, expectedPayload);
  });
});
