import { AppState } from 'store';
import { fireEvent, render, RenderResult, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';

import { LessonPlanEventItem } from '../../../../types';
import AdminTools from '../AdminTools';

// `Partial<AppState>` only allows omitting whole slices, and these tests seed
// just the few fields the component reads, so the shape is asserted.

const state = {
  lessonPlan: { flags: { canManageLessonPlan: true } },
} as unknown as Partial<AppState>;

const renderElement = (item: LessonPlanEventItem): RenderResult =>
  render(<AdminTools item={item} />, { state });

describe('<AdminTools />', () => {
  it('does not show admin menu for lesson plan events', async () => {
    const page = renderElement({ title: 'Event', eventId: 7 });
    expect(await page.findAllByRole('button')).toHaveLength(2);
  });

  it('does not show admin menu for non-event lesson plan items', async () => {
    const wrapper = renderElement({ title: 'eventId absent' });

    await waitFor(() =>
      expect(wrapper.queryAllByRole('button')).toHaveLength(0),
    );
  });

  it('allows event to be deleted', async () => {
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'deleteEvent');
    const eventId = 55;

    const page = render(
      <>
        <DeleteConfirmation />
        <AdminTools item={{ eventId }} />
      </>,
      { state },
    );

    fireEvent.click((await page.findAllByRole('button'))[1]);
    fireEvent.click(page.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(spy).toHaveBeenCalledWith(eventId));
  });

  it('allows event to be edited', async () => {
    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateEvent');
    const eventId = 55;

    const eventData = {
      title: 'Original title',
      start_at: new Date('2017-01-04T02:03:00.000+08:00'),
      end_at: new Date('2017-01-05T02:03:00.000+08:00'),
      published: false,
      event_type: 'Recitation',
    };

    const page = render(
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
      { state },
    );

    fireEvent.click((await page.findAllByRole('button'))[0]);

    const description = 'Add nice description';
    fireEvent.change(page.getByLabelText('Description'), {
      target: { value: description },
    });

    fireEvent.click(page.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith(eventId, {
        lesson_plan_event: {
          ...eventData,
          description,
        },
      }),
    );
  });
});
