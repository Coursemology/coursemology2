import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import MilestoneFormDialog from 'course/lesson-plan/containers/MilestoneFormDialog';

import NewMilestoneButton from '../NewMilestoneButton';

const startAt = '01-01-2017 11:11';

const milestoneData = {
  title: 'Ambitious milestone title',
  description: '',
  start_at: new Date(startAt),
};

const state = {
  lessonPlan: { flags: { canManageLessonPlan: true } },
};

describe('<NewMilestoneButton />', () => {
  it('allows milestone to be created via MilestoneFormDialog', async () => {
    const spyCreate = jest.spyOn(CourseAPI.lessonPlan, 'createMilestone');

    const page = render(
      <>
        <NewMilestoneButton />
        <MilestoneFormDialog />
      </>,
      { state },
    );

    fireEvent.click(await page.findByRole('button', { name: 'New Milestone' }));

    fireEvent.change(page.getByLabelText('Title', { exact: false }), {
      target: { value: milestoneData.title },
    });

    fireEvent.change(page.getByLabelText('Start at', { exact: false }), {
      target: { value: startAt },
    });

    fireEvent.click(page.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(spyCreate).toHaveBeenCalledWith({
        lesson_plan_milestone: milestoneData,
      });
    });
  });

  it('is hidden when canManageLessonPlan is false', async () => {
    const page = render(<NewMilestoneButton />);

    await waitFor(() =>
      expect(page.queryByRole('button')).not.toBeInTheDocument(),
    );
  });
});
