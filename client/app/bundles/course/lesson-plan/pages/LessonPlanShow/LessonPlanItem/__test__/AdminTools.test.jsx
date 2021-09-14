import React from 'react';
import ReactDOM from 'react-dom';
import { shallow, mount } from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';
import CourseAPI from 'api/course';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';
import storeCreator from 'course/lesson-plan/store';
import EventFormDialog from 'course/lesson-plan/containers/EventFormDialog';
import AdminTools from '../AdminTools';

const buildShallowWrapper = (item) => {
  const store = storeCreator({ flags: { canManageLessonPlan: true } });
  return shallow(<AdminTools item={item} />, buildContextOptions(store))
    .dive()
    .dive();
};

describe('<AdminTools />', () => {
  it('does not show admin menu for lesson plan events', () => {
    const wrapper = buildShallowWrapper({ title: 'Event', eventId: 7 });
    expect(wrapper.find('RaisedButton').length).toBe(2);
  });

  it('does not show admin menu for non-event lesson plan items', () => {
    const wrapper = buildShallowWrapper({ title: 'eventId absent' });
    expect(wrapper.find('RaisedButton').length).toBe(0);
  });

  it('allows event to be deleted', () => {
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'deleteEvent');
    const store = storeCreator({ flags: { canManageLessonPlan: true } });
    const contextOptions = buildContextOptions(store);
    const deleteConfirmation = mount(<DeleteConfirmation />, contextOptions);
    const eventId = 55;
    const wrapper = mount(<AdminTools item={{ eventId }} />, contextOptions);

    const deleteButton = wrapper.find('RaisedButton').last().find('button');
    deleteButton.simulate('click');

    const confirmDeleteButton = deleteConfirmation
      .find('ConfirmationDialog')
      .first()
      .instance().confirmButton;
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(confirmDeleteButton));

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
    const wrapper = mount(
      <AdminTools
        item={{
          eventId,
          title: eventData.title,
          start_at: eventData.start_at,
          end_at: eventData.end_at,
          published: eventData.published,
          lesson_plan_item_type: [eventData.event_type],
        }}
      />,
      contextOptions,
    );

    const editButton = wrapper.find('RaisedButton').first().find('button');
    editButton.simulate('click');

    const dialogInline = eventFormDialog
      .find('RenderToLayer')
      .first()
      .instance();
    const eventForm = mount(dialogInline.props.render(), contextOptions).find(
      'form',
    );
    const description = 'Add nice description';
    const descriptionInput = eventForm.find('textarea[name="description"]');
    descriptionInput.simulate('change', { target: { value: description } });

    const submitButton = eventFormDialog
      .find('FormDialogue')
      .first()
      .instance().submitButton;
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(submitButton));

    const expectedPayload = {
      lesson_plan_event: {
        ...eventData,
        description,
      },
    };
    expect(spy).toHaveBeenCalledWith(eventId, expectedPayload);
  });
});
