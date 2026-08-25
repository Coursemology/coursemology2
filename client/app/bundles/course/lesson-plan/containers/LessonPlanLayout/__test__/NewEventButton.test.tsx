import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import EventFormDialog from 'course/lesson-plan/containers/EventFormDialog';

import NewEventButton from '../NewEventButton';

const state = {
  lessonPlan: { flags: { canManageLessonPlan: true } },
};

const startAt = '01-01-2017 12:12';

const eventData = {
  title: 'Ambitious event title',
  event_type: 'In-person Meetup',
  start_at: new Date(startAt),
  description: '',
  end_at: null,
  location: '',
  published: false,
};

describe('<NewEventButton />', () => {
  it('allows event to be created via EventFormDialog', async () => {
    const spyCreate = jest.spyOn(CourseAPI.lessonPlan, 'createEvent');

    const page = render(
      <>
        <EventFormDialog />
        <NewEventButton />
      </>,
      { state },
    );

    fireEvent.click(await page.findByRole('button', { name: 'New Event' }));

    fireEvent.change(page.getByLabelText('Title', { exact: false }), {
      target: { value: eventData.title },
    });

    fireEvent.change(page.getByLabelText('Start at', { exact: false }), {
      target: { value: startAt },
    });

    fireEvent.change(page.getByLabelText('Event Type'), {
      target: { value: eventData.event_type },
    });

    fireEvent.click(page.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(spyCreate).toHaveBeenCalledWith({ lesson_plan_event: eventData }),
    );
  });

  it('is hidden when canManageLessonPlan is false', () => {
    const page = render(<NewEventButton />);
    expect(page.queryByRole('button')).not.toBeInTheDocument();
  });
});
