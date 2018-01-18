import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';
import CourseAPI from 'api/course';
import storeCreator from 'course/lesson-plan/store';
import EventFormDialog from 'course/lesson-plan/containers/EventFormDialog';
import NewEventButton from '../NewEventButton';

describe('<NewEventButton />', () => {
  it('allows event to be created via EventFormDialog', () => {
    const spyCreate = jest.spyOn(CourseAPI.lessonPlan, 'createEvent');
    const store = storeCreator({ flags: { canManageLessonPlan: true } });
    const contextOptions = buildContextOptions(store);

    const eventFormDialog = mount(<EventFormDialog />, contextOptions);
    const newEventButton = mount(<NewEventButton />, contextOptions);

    // Click 'new event' button
    newEventButton.find('button').simulate('click');
    expect(eventFormDialog.update().find('EventFormDialog').first().props().visible).toBe(true);

    // Fill event form
    const eventData = {
      title: 'Ambitious event title',
      event_type: 'In-person Meetup',
      start_at: new Date('2016-12-31T16:00:00.000Z'),
    };
    const startAt = '01-01-2017';
    const dialogInline = eventFormDialog.find('RenderToLayer').first().instance();
    const eventForm = mount(dialogInline.props.render(), contextOptions).find('form');
    const titleInput = eventForm.find('input[name="title"]');
    titleInput.simulate('change', { target: { value: eventData.title } });
    const eventTypeInput = eventForm.find('input[name="event_type"]');
    eventTypeInput.simulate('change', { target: { value: eventData.event_type } });
    eventTypeInput.simulate('blur');
    const startAtDateInput = eventForm.find('input[name="start_at"]').first();
    startAtDateInput.simulate('change', { target: { value: startAt } });
    startAtDateInput.simulate('blur');

    // Submit event form
    const submitButton = eventFormDialog.find('FormDialogue').first().instance().submitButton;
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(submitButton));
    expect(spyCreate).toHaveBeenCalledWith({ lesson_plan_event: eventData });
  });

  it('is hidden when canManageLessonPlan is false', () => {
    const store = storeCreator({ flags: { canManageLessonPlan: false } });
    const contextOptions = buildContextOptions(store);
    const newEventButton = mount(<NewEventButton />, contextOptions);
    expect(newEventButton).toMatchSnapshot();
  });
});
