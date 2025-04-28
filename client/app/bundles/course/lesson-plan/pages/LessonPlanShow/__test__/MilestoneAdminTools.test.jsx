import { fireEvent, render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import MilestoneFormDialog from 'course/lesson-plan/containers/MilestoneFormDialog';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';

import MilestoneAdminTools from '../MilestoneAdminTools';

const renderElement = (canManageLessonPlan, milestone) => {
  const state = { lessonPlan: { flags: { canManageLessonPlan } } };
  return render(<MilestoneAdminTools milestone={milestone} />, { state });
};

describe('<MilestoneAdminTools />', () => {
  it('hides admin tools for dummy milestone', async () => {
    const page = renderElement(true, {
      id: undefined,
      title: 'Ungrouped Items',
    });

    await waitFor(() =>
      expect(page.queryByRole('button')).not.toBeInTheDocument(),
    );
  });

  it('hides admin tools when user does not have permissions', async () => {
    const page = renderElement(false, {
      id: 4,
      title: 'User-defined Milestone',
    });

    await waitFor(() =>
      expect(page.queryByRole('button')).not.toBeInTheDocument(),
    );
  });

  it('shows admin tools when user has permissions', async () => {
    const page = renderElement(true, {
      id: 4,
      title: 'User-defined Milestone',
    });

    expect(await page.findAllByRole('button')).toHaveLength(2);
  });

  it('allows milestone to be deleted', async () => {
    const milestoneId = 55;

    const spy = jest.spyOn(CourseAPI.lessonPlan, 'deleteMilestone');

    const page = render(
      <>
        <DeleteConfirmation />
        <MilestoneAdminTools
          milestone={{
            id: milestoneId,
            title: 'Original title',
            start_at: '2017-01-04T02:03:00.000+08:00',
          }}
        />
      </>,
      { state: { lessonPlan: { flags: { canManageLessonPlan: true } } } },
    );

    fireEvent.click((await page.findAllByRole('button'))[1]);
    fireEvent.click(page.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(spy).toHaveBeenCalledWith(milestoneId));
  });

  it('allows milestone to be edited', async () => {
    const milestoneId = 55;
    const milestoneTitle = 'Original title';
    const milestoneStart = new Date('2017-01-03T18:03:00.000+08:00');
    const description = 'Add nice description';
    const expectedPayload = {
      lesson_plan_milestone: {
        title: milestoneTitle,
        description,
        start_at: milestoneStart,
      },
    };

    const spy = jest.spyOn(CourseAPI.lessonPlan, 'updateMilestone');

    const page = render(
      <>
        <MilestoneFormDialog />
        <MilestoneAdminTools
          milestone={{
            id: milestoneId,
            title: milestoneTitle,
            start_at: milestoneStart,
          }}
        />
      </>,
      { state: { lessonPlan: { flags: { canManageLessonPlan: true } } } },
    );

    fireEvent.click((await page.findAllByRole('button'))[0]);

    fireEvent.change(page.getByLabelText('Description'), {
      target: { value: description },
    });

    fireEvent.click(page.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith(milestoneId, expectedPayload),
    );
  });
});
