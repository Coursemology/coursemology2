import ReactDOM from 'react-dom';
import ReactTestUtils, { act } from 'react-dom/test-utils';
import { mount, shallow } from 'enzyme';

import CourseAPI from 'api/course';
import EventFormDialog from 'course/lesson-plan/containers/EventFormDialog';
import storeCreator from 'course/lesson-plan/store';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';

import AdminTools from '../AdminTools';

const buildShallowWrapper = (item) => {
  const store = storeCreator({ flags: { canManageLessonPlan: true } });
  return shallow(
    <AdminTools item={item} store={store} />,
    buildContextOptions(),
  )
    .children()
    .dive()
    .dive()
    .dive();
};

describe('<AdminTools />', () => {
  it('does not show admin menu for lesson plan events', () => {
    const wrapper = buildShallowWrapper({ title: 'Event', eventId: 7 });
    expect(wrapper.find('ForwardRef(Button)')).toHaveLength(2);
  });

  it('does not show admin menu for non-event lesson plan items', () => {
    const wrapper = buildShallowWrapper({ title: 'eventId absent' });
    expect(wrapper.find('ForwardRef(Button)')).toHaveLength(0);
  });

  it('allows event to be deleted', () => {
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'deleteEvent');
    const store = storeCreator({ flags: { canManageLessonPlan: true } });
    const contextOptions = buildContextOptions(store);
    const deleteConfirmation = mount(<DeleteConfirmation />, contextOptions);
    const eventId = 55;
    const wrapper = mount(<AdminTools item={{ eventId }} />, contextOptions);

    const deleteButton = wrapper
      .find('ForwardRef(Button)')
      .last()
      .find('button');
    deleteButton.simulate('click');

    const confirmDeleteButton = deleteConfirmation
      .find('ConfirmationDialog')
      .first()
      .instance().confirmButton;
    ReactTestUtils.Simulate.click(ReactDOM.findDOMNode(confirmDeleteButton));

    expect(spy).toHaveBeenCalledWith(eventId);
  });

  it('allows event to be edited', async () => {
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateEvent');
    const store = storeCreator({ flags: { canManageLessonPlan: true } });
    const contextOptions = buildContextOptions(store);
    const eventId = 55;
    const eventData = {
      title: 'Original title',
      start_at: new Date('2017-01-04T02:03:00.000+08:00'),
      end_at: new Date('2017-01-05T02:03:00.000+08:00'),
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

    const editButton = wrapper
      .find('ForwardRef(Button)')
      .first()
      .find('button');
    editButton.simulate('click');
    eventFormDialog.update();

    const eventForm = eventFormDialog.find('form');
    const description = 'Add nice description';
    const descriptionInput = eventForm.find('textarea[name="description"]');
    descriptionInput.simulate('change', { target: { value: description } });
    await sleep(0.01);

    await act(async () => {
      eventForm.simulate('submit');
    });

    const expectedPayload = {
      lesson_plan_event: {
        ...eventData,
        description,
      },
    };
    expect(spy).toHaveBeenCalledWith(eventId, expectedPayload);
  });
});
