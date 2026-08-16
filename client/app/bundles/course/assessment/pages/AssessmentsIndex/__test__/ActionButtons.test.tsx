import userEvent from '@testing-library/user-event';
import { render, waitFor } from 'test-utils';
import { AssessmentListData } from 'types/course/assessment/assessments';

import ActionButtons from '../ActionButtons';

const assessment = (
  overrides: Partial<AssessmentListData> = {},
): AssessmentListData => ({
  id: 1,
  title: 'Recursion',
  status: 'open',
  actionButtonUrl: null,
  passwordProtected: false,
  published: true,
  autograded: false,
  hasPersonalTimes: false,
  affectsPersonalTimes: false,
  url: '/courses/1/assessments/1',
  conditionSatisfied: true,
  startAt: { isFixed: false, effectiveTime: null, referenceTime: null },
  isStartTimeBegin: true,
  ...overrides,
});

describe('<ActionButtons />', () => {
  it('links an enabled Attempt button when the assessment is open', async () => {
    const page = render(
      <ActionButtons
        for={assessment({ status: 'open', actionButtonUrl: '/attempt' })}
        student
      />,
    );

    const button = await page.findByRole('button', { name: 'Attempt' });
    expect(button).not.toBeDisabled();
    expect(button.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('/attempt'),
    );
  });

  it('shows a disabled Attempt button with no link when the assessment is closed', async () => {
    const page = render(
      <ActionButtons for={assessment({ status: 'closed' })} student />,
    );

    const button = await page.findByRole('button', { name: 'Attempt' });
    expect(button).toBeDisabled();
    expect(button.closest('a')).toBeNull();
  });

  it('explains why on hover when the assessment is closed', async () => {
    const page = render(
      <ActionButtons for={assessment({ status: 'closed' })} student />,
    );

    const button = await page.findByRole('button', { name: 'Attempt' });
    // The disabled button does not emit hover events; the tooltip anchors to its wrapper.
    await userEvent.hover(button.parentElement!);

    await waitFor(() =>
      expect(
        page.getByText(
          'This assessment is no longer accepting new submissions.',
        ),
      ).toBeInTheDocument(),
    );
  });
});
